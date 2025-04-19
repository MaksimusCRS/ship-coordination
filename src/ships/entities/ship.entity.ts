import { Entity, PrimaryColumn, OneToMany } from 'typeorm';
import { Position } from './position.entity';

@Entity()
export class Ship {
  @PrimaryColumn()
  id: string;

  @OneToMany(() => Position, (position: Position): Ship => position.ship, {
    cascade: true,
    nullable: true,
  })
  positions: Position[];
}
