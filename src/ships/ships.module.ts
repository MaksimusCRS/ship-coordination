import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipsController } from './controllers/ships.controller';
import { ShipsService } from './services/ships.service';
import { Ship } from './entities/ship.entity';
import { Position } from './entities/position.entity';
import { PositionsService } from './services/positions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ship, Position])],
  controllers: [ShipsController],
  providers: [ShipsService, PositionsService],
  exports: [ShipsService, PositionsService],
})
export class ShipsModule {}
