import { Test, TestingModule } from '@nestjs/testing';
import { PositionsService } from './positions.service';
import { Repository } from 'typeorm';
import { Ship } from '../entities/ship.entity';
import { Position } from '../entities/position.entity';
import { CreatePositionDto } from '../dto/create-position.dto';
import { ShipStatus } from '../enums/ship-status.enum';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('PositionsService', () => {
  let positionsService: PositionsService;
  let shipRepository: Repository<Ship>;
  let positionRepository: Repository<Position>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PositionsService,
        {
          provide: getRepositoryToken(Ship),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Position),
          useClass: Repository,
        },
      ],
    }).compile();

    positionsService = module.get<PositionsService>(PositionsService);
    shipRepository = module.get<Repository<Ship>>(getRepositoryToken(Ship));
    positionRepository = module.get<Repository<Position>>(
      getRepositoryToken(Position),
    );

    // Mock createQueryBuilder
    const mockQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    jest
      .spyOn(positionRepository, 'createQueryBuilder')
      .mockReturnValue(mockQueryBuilder as any);
  });

  it('should be defined', () => {
    expect(positionsService).toBeDefined();
  });

  describe('reportPosition', () => {
    it('should create a new ship if it does not exist', async () => {
      const dto: CreatePositionDto = { time: 1000, x: 0, y: 0 };
      jest.spyOn(shipRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(shipRepository, 'create')
        .mockReturnValue({ id: 'newShip', positions: [] } as Ship);
      jest
        .spyOn(shipRepository, 'save')
        .mockResolvedValue({ id: 'newShip', positions: [] } as Ship);
      jest.spyOn(positionRepository, 'create').mockReturnValue({
        ship: { id: 'newShip' },
        time: 1000,
        x: 0,
        y: 0,
        speed: 0,
        status: ShipStatus.Green,
      } as Position);
      jest.spyOn(positionRepository, 'save').mockResolvedValue({} as Position);

      const result = await positionsService.reportPosition('newShip', dto);

      expect(shipRepository.create).toHaveBeenCalledWith({
        id: 'newShip',
        positions: [],
      });
      expect(shipRepository.save).toHaveBeenCalled();
      expect(result.status).toBe(ShipStatus.Green);
    });

    it('should calculate speed correctly for existing ship', async () => {
      const dto: CreatePositionDto = { time: 2000, x: 3, y: 4 };
      jest.spyOn(shipRepository, 'findOne').mockResolvedValue({
        id: 'existingShip',
        positions: [{ time: 1000, x: 0, y: 0 }],
      } as Ship);
      jest.spyOn(positionRepository, 'create').mockReturnValue({
        ship: { id: 'existingShip' },
        time: 2000,
        x: 3,
        y: 4,
        speed: 5,
        status: ShipStatus.Green,
      } as Position);
      jest.spyOn(positionRepository, 'save').mockResolvedValue({} as Position);

      const result = await positionsService.reportPosition('existingShip', dto);

      expect(result.speed).toBeCloseTo(5);
    });
  });

  // Add more tests for other methods...
});
