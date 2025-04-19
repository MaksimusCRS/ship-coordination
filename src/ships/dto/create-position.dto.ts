import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber } from 'class-validator';

export class CreatePositionDto {
  @ApiProperty({
    example: 1744383218,
    description: 'Unix timestamp in seconds',
  })
  @IsInt({ message: 'time must be an integer' })
  time: number;

  @ApiProperty({ example: 2 })
  @IsNumber({ allowNaN: false }, { message: 'x must be a number' })
  x: number;

  @ApiProperty({ example: 3 })
  @IsNumber({ allowNaN: false }, { message: 'y must be a number' })
  y: number;
}
