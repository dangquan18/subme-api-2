import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
// import { UpdatePlanDto } from './dto/update-plan.dto';

@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}
  // tạo mới gói
  @Post()
  create(@Body() createDto: CreatePlanDto) {
    return this.planService.createNew(createDto);
  }
  // Lấy tất cả
  @Get()
  findAll() {
    return this.planService.getAll();
  }
  // Lấy Gói theo id
  // +id tức ép sang kiểu numberF
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planService.getById(+id);
  }
  @Get('user/:userId')
  getByUser(@Param('userId') userId: string) {
    return this.planService.getByUser(+userId);
  }
}
