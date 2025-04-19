import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ship } from '../entities/ship.entity';
import { Position } from '../entities/position.entity';
import { CreatePositionDto } from '../dto/create-position.dto';

@Injectable()
export class ShipsService {
  constructor(
    @InjectRepository(Ship) private shipRepo: Repository<Ship>,
    @InjectRepository(Position) private posRepo: Repository<Position>,
  ) {}

  async reportPosition(id: string, dto: CreatePositionDto) {
    const now = Math.floor(Date.now() / 1000);
    if (dto.time > now) {
      throw new UnprocessableEntityException('time out of range');
    }

    let ship = await this.shipRepo.findOne({
      where: { id },
      relations: ['positions'],
    });
    if (!ship) {
      ship = this.shipRepo.create({ id, positions: [] });
      await this.shipRepo.save(ship);
    }

    const last = ship.positions[ship.positions.length - 1];
    if (last && dto.time <= last.time) {
      throw new UnprocessableEntityException('time out of range');
    }

    const dx = last ? dto.x - last.x : 0;
    const dy = last ? dto.y - last.y : 0;
    const dt = last ? dto.time - last.time : 1;

    const speed = Math.sqrt(dx * dx + dy * dy) / dt;

    const status = 'green'; // we'll improve this in next step

    const position = this.posRepo.create({
      time: dto.time,
      x: dto.x,
      y: dto.y,
      speed,
      status,
      ship,
    });

    await this.posRepo.save(position);

    return {
      time: position.time,
      x: position.x,
      y: position.y,
      speed: position.speed,
      status: position.status,
    };
  }
}
