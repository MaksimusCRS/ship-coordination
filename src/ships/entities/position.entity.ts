import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
} from 'typeorm';
import { Ship } from './ship.entity';
import { ShipStatus } from '../enums/ship-status.enum';

@Entity()
@Index('idx_position_coordinates', ['x', 'y'])
@Index('idx_position_time', ['time'])
@Index('idx_position_ship_id', ['shipId'])
export class Position {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shipId: string;

  @Column()
  time: number;

  @Column()
  x: number;

  @Column()
  y: number;

  @Column({ type: 'float' })
  speed: number;

  @Column({
    type: 'enum',
    enum: ShipStatus,
    default: ShipStatus.Green,
  })
  status: ShipStatus;

  @ManyToOne(() => Ship, (ship) => ship.positions, { onDelete: 'CASCADE' })
  ship: Ship;
}
