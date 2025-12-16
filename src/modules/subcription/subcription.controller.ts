import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SubscriptionService } from './subcription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  /**
   * GET /subscriptions - Danh sách đăng ký
   */
  @Get()
  async findAll(
    @Request() req,
    @Query('status') status?: string,
  ) {
    return this.subscriptionService.findAll(req.user.userId, status);
  }

  /**
   * GET /subscriptions/:id - Chi tiết đăng ký
   */
  @Get(':id')
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.findOne(id, req.user.userId);
  }

  /**
   * POST /subscriptions - Tạo đăng ký mới
   */
  @Post()
  async create(@Request() req, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionService.create(req.user.userId, dto);
  }

  /**
   * PATCH /subscriptions/:id - Cập nhật đăng ký
   */
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.update(id, req.user.userId, dto);
  }

  /**
   * POST /subscriptions/:id/pause - Tạm dừng
   */
  @Post(':id/pause')
  async pause(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.pause(id, req.user.userId);
  }

  /**
   * POST /subscriptions/:id/resume - Tiếp tục
   */
  @Post(':id/resume')
  async resume(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.resume(id, req.user.userId);
  }

  /**
   * POST /subscriptions/:id/renew - Gia hạn
   */
  @Post(':id/renew')
  async renew(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body('payment_method_id') paymentMethodId?: number,
  ) {
    return this.subscriptionService.renew(id, req.user.userId, paymentMethodId);
  }

  /**
   * DELETE /subscriptions/:id - Hủy đăng ký
   */
  @Delete(':id')
  async cancel(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.cancel(id, req.user.userId);
  }
}

