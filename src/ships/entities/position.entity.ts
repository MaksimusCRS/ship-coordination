import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Ship } from './ship.entity';

@Entity()
export class Position {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  time: number; // unix timestamp

  @Column()
  x: number;

  @Column()
  y: number;

  @Column('float')
  speed: number;

  @Column()
  status: 'green' | 'yellow' | 'red';

  @ManyToOne(() => Ship, (ship) => ship.positions, { onDelete: 'CASCADE' })
  ship: Ship;
}
