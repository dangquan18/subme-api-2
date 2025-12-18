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
import { ApproveVendorDto } from './dto/approve-vendor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('vendor')
@UseGuards(JwtAuthGuard)
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  /**
   * GET /vendor/info - Lấy thông tin vendor theo userId
   */
  @Get('info')
  getVendorInfo(@Request() req) {
    return this.vendorService.getVendorInfo(req.user.userId);
  }

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
   * GET /vendor/packages/:id - Chi tiết một gói
   */
  @Get('packages/:id')
  getPackageDetail(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.vendorService.getPackageDetail(req.user.userId, id);
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

  /**
   * ADMIN ENDPOINTS
   */

  /**
   * GET /vendor/admin/all - Lấy danh sách tất cả vendors (admin only)
   */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAllVendors(
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const finalLimit = limit || 20;
    const finalOffset = offset || 0;
    return this.vendorService.getAllVendors(status, finalLimit, finalOffset);
  }

  /**
   * GET /vendor/admin/:id - Chi tiết vendor (admin only)
   */
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getVendorById(@Param('id', ParseIntPipe) id: number) {
    return this.vendorService.getVendorById(id);
  }

  /**
   * PATCH /vendor/admin/:id/approve - Duyệt/từ chối vendor (admin only)
   */
  @Patch('admin/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  approveVendor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveVendorDto,
  ) {
    return this.vendorService.approveVendor(id, dto);
  }
}
