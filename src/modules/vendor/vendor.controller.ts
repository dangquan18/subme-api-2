import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VendorService } from './vendor.service';
import { CreatePlanDto } from '../plan/dto/create-plan.dto';
import { UpdatePlanDto } from '../plan/dto/update-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('vendor')
@UseGuards(JwtAuthGuard)
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  /**
   * GET /vendor/stats - Thống kê dashboard
   */
  @Get('stats')
  getStats(@Request() req) {
    return this.vendorService.getStats(req.user.userId);
  }

  /**
   * GET /vendor/packages - Danh sách gói
   */
  @Get('packages')
  getPackages(@Request() req) {
    return this.vendorService.getPackages(req.user.userId);
  }

  /**
   * POST /vendor/packages - Tạo gói mới
   */
  @Post('packages')
  createPackage(@Request() req, @Body() dto: CreatePlanDto) {
    return this.vendorService.createPackage(req.user.userId, dto);
  }

  /**
   * PATCH /vendor/packages/:id - Cập nhật gói
   */
  @Patch('packages/:id')
  updatePackage(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.vendorService.updatePackage(id, req.user.userId, dto);
  }

  /**
   * DELETE /vendor/packages/:id - Xóa gói
   */
  @Delete('packages/:id')
  deletePackage(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.vendorService.deletePackage(id, req.user.userId);
  }

  /**
   * GET /vendor/orders - Danh sách đơn hàng
   */
  @Get('orders')
  getOrders(
    @Request() req,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const finalLimit = limit || 20;
    const finalOffset = offset || 0;
    return this.vendorService.getOrders(req.user.userId, status, finalLimit, finalOffset);
  }

  /**
   * GET /vendor/analytics - Thống kê chi tiết
   */
  @Get('analytics')
  getAnalytics(
    @Request() req,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return this.vendorService.getAnalytics(req.user.userId, startDate, endDate);
  }

  /**
   * GET /vendor/reviews - Đánh giá
   */
  @Get('reviews')
  getReviews(
    @Request() req,
    @Query('plan_id') planId?: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const finalLimit = limit || 20;
    const finalOffset = offset || 0;
    return this.vendorService.getReviews(req.user.userId, planId, finalLimit, finalOffset);
  }
}
