import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ship } from '../entities/ship.entity';
import { Position } from '../entities/position.entity';
import { Repository } from 'typeorm';
import { CreatePositionDto } from '../dto/create-position.dto';
import { ShipStatus } from '../enums/ship-status.enum';
import {
  COLLISION_DISTANCE,
  LOOKAHEAD_TIME,
  WARNING_DISTANCE,
} from '../consts/ships.consts';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Ship)
    private readonly shipRepo: Repository<Ship>,
    @InjectRepository(Position)
    private readonly positionRepo: Repository<Position>,
  ) {}

  async reportPosition(shipId: string, dto: CreatePositionDto) {
    const now = Math.floor(Date.now() / 1000);

    if (dto.time > now) {
      throw new UnprocessableEntityException({ error: 'time out of range' });
    }

    let ship = await this.shipRepo.findOne({
      where: { id: shipId },
      relations: ['positions'],
    });

    const lastPosition = ship?.positions?.sort((a, b) => b.time - a.time)[0];

    if (lastPosition && dto.time <= lastPosition.time) {
      throw new UnprocessableEntityException({ error: 'time out of range' });
    }

    if (!ship) {
      ship = this.shipRepo.create({ id: shipId, positions: [] });
      await this.shipRepo.save(ship);
    }

    const dx = lastPosition ? dto.x - lastPosition.x : 0;
    const dy = lastPosition ? dto.y - lastPosition.y : 0;
    const dt = lastPosition ? dto.time - lastPosition.time : 1;

    const speed = Math.sqrt(dx * dx + dy * dy) / dt;

    const status = await this.predictCollisionStatus(shipId, dto, speed);

    const newPosition = this.positionRepo.create({
      ship,
      time: dto.time,
      x: dto.x,
      y: dto.y,
      speed,
      status,
    });

    await this.positionRepo.save(newPosition);

    return {
      time: newPosition.time,
      x: newPosition.x,
      y: newPosition.y,
      speed: newPosition.speed,
      status: newPosition.status,
    };
  }

  async predictCollisionStatus(
    currentShipId: string,
    dto: CreatePositionDto,
    speed: number,
  ): Promise<ShipStatus> {
    const positions = await this.positionRepo
      .createQueryBuilder('position')
      .innerJoinAndSelect('position.ship', 'ship')
      .where('ship.id != :id', { id: currentShipId })
      .getMany();

    const lookaheadTime = LOOKAHEAD_TIME;

    for (const pos of positions) {
      const dt = dto.time - pos.time;
      if (dt < 0) continue; // Skip any past positions

      // Calculate the current distance between positions
      const dx = dto.x - pos.x;
      const dy = dto.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy); // Current distance

      // Predict future positions based on speed and time
      const futurePosX =
        pos.x + Math.cos(Math.atan2(dy, dx)) * speed * lookaheadTime;
      const futurePosY =
        pos.y + Math.sin(Math.atan2(dy, dx)) * speed * lookaheadTime;

      // Calculate the future distance between current ship and future position of the other ship
      const futureDx =
        dto.x +
        Math.cos(Math.atan2(dy, dx)) * speed * lookaheadTime -
        futurePosX;
      const futureDy =
        dto.y +
        Math.sin(Math.atan2(dy, dx)) * speed * lookaheadTime -
        futurePosY;
      const futureDist = Math.sqrt(futureDx * futureDx + futureDy * futureDy); // Future distance

      // If the ships are already close (current distance), return Red status
      if (dist <= COLLISION_DISTANCE) {
        return ShipStatus.Red;
      }

      if (futureDist <= COLLISION_DISTANCE) {
        return ShipStatus.Red;
      } else if (futureDist <= WARNING_DISTANCE) {
        return ShipStatus.Yellow;
      }
    }

    return ShipStatus.Green;
  }

  async getAllShipsStatus() {
    const ships = await this.shipRepo.find({ relations: ['positions'] });

    return {
      ships: ships.map((ship) => {
        const last = ship.positions.sort((a, b) => b.time - a.time)[0];
        return {
          id: ship.id,
          last_time: last?.time ?? null,
          last_status: last?.status ?? ShipStatus.Green,
          last_speed: last?.speed ?? 0,
          last_position: last ? { x: last.x, y: last.y } : { x: 0, y: 0 },
        };
      }),
    };
  }

  async getShipPositions(id: string) {
    const ship = await this.shipRepo.findOne({
      where: { id },
      relations: ['positions'],
    });

    if (!ship) {
      throw new NotFoundException(`Ship with id ${id} not found`);
    }

    const positions = ship.positions
      .sort((a, b) => a.time - b.time)
      .map((pos) => ({
        time: pos.time,
        speed: pos.speed,
        position: {
          x: pos.x,
          y: pos.y,
        },
      }));

    return {
      id: ship.id,
      positions,
    };
  }

  async flushData() {
    await this.positionRepo.delete({});
    await this.shipRepo.delete({});
    return { message: 'All data flushed' };
  }
}
