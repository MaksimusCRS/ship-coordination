import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { CreatePositionDto } from '../dto/create-position.dto';
import { PositionsService } from '../services/positions.service';

@Controller('/v1/api/ships')
export class ShipsController {
  constructor(private readonly positionService: PositionsService) {}

  @Post(':id/position')
  reportShipPosition(
    @Param('id') shipId: string,
    @Body() dto: CreatePositionDto,
  ) {
    return this.positionService.reportPosition(shipId, dto);
  }

  @Get()
  getAllShipStatuses() {
    return this.positionService.getAllShipsStatus();
  }

  @Get(':id')
  getShipHistory(@Param('id') id: string) {
    return this.positionService.getShipPositions(id);
  }

  @Post('flush')
  flush() {
    return this.positionService.flushData();
  }
}
