import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  ParseIntPipe,
  UseGuards,
  Request,
  Patch,
  Delete
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { GetPackagesDto } from './dto/get-packages.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('packages')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  // GET /packages - Danh sách gói với filters
  @Get()
  async findAll(@Query() query: GetPackagesDto) {
    return this.planService.findAll(query);
  }

  // GET /packages/featured - Gói nổi bật
  @Get('featured')
  async findFeatured(@Query('limit', ParseIntPipe) limit: number = 10) {
    return this.planService.findFeatured(limit);
  }

  // GET /packages/search - Tìm kiếm
  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ) {
    return this.planService.search(query, limit);
  }

  // GET /packages/category/:categoryId - Gói theo category
  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.planService.findByCategory(categoryId);
  }

  // GET /packages/:id - Chi tiết gói
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.planService.findOne(id);
  }
}

