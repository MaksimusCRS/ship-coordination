import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipsController } from './ships.controller';
import { ShipsService } from './ships.service';
import { Ship } from './entities/ship.entity';
import { Position } from './entities/position.entity';
import { PositionsService } from './positions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ship, Position])],
  controllers: [ShipsController],
  providers: [ShipsService, PositionsService],
})
export class ShipsModule {}
