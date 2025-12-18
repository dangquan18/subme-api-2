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
import { ApprovePlanDto } from './dto/approve-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

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

  /**
   * ADMIN ENDPOINTS
   */

  /**
   * GET /packages/admin/all - Lấy tất cả plans bao gồm pending (admin only)
   */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllPlansForAdmin(
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const finalLimit = limit || 20;
    const finalOffset = offset || 0;
    return this.planService.getAllPlansForAdmin(status, finalLimit, finalOffset);
  }

  /**
   * GET /packages/admin/:id - Chi tiết plan (admin only)
   */
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getPlanByIdForAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.planService.getPlanByIdForAdmin(id);
  }

  /**
   * PATCH /packages/admin/:id/approve - Duyệt/từ chối plan (admin only)
   */
  @Patch('admin/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async approvePlan(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApprovePlanDto,
  ) {
    return this.planService.approvePlan(id, dto);
  }
}

