import { Test, TestingModule } from '@nestjs/testing';
import { PositionsService } from '../src/ships/services/positions.service'; // Service to test
import { ShipRepository } from '../src/ships/repositories/ship.repository'; // Repository to mock
import { PositionRepository } from '../src/ships/repositories/position.repository'; // Repository to mock

describe('PositionsService', () => {
  let positionsService: PositionsService;

  // Mock repositories
  const mockShipRepository = {
    find: jest.fn().mockResolvedValue([{ id: 1, name: 'Ship1' }]), // Mock method behavior
  };

  const mockPositionRepository = {
    find: jest
      .fn()
      .mockResolvedValue([{ id: 1, shipId: 1, coordinates: 'lat,lng' }]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PositionsService,
        { provide: ShipRepository, useValue: mockShipRepository },
        { provide: PositionRepository, useValue: mockPositionRepository },
      ],
    }).compile();

    positionsService = module.get<PositionsService>(PositionsService);
  });

  it('should be defined', () => {
    expect(positionsService).toBeDefined();
  });

  // Other tests related to service logic
});
