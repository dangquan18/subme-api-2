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
  Ip,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { TestPaymentDto } from './dto/test-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * GET /payments/history - Lịch sử thanh toán
   */
  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @Request() req,
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
    @Query('status') status?: 'success' | 'pending' | 'failed',
  ) {
    // Parse với default values
    const limit = limitStr ? parseInt(limitStr, 10) : 20;
    const offset = offsetStr ? parseInt(offsetStr, 10) : 0;
    
    return this.paymentService.getHistory(req.user.userId, limit, offset, status);
  }

  /**
   * GET /payments/:id - Chi tiết thanh toán
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.paymentService.getById(id, req.user.userId);
  }

  /**
   * POST /payments/process - Xử lý thanh toán
   */
  @Post('process')
  @UseGuards(JwtAuthGuard)
  async processPayment(
    @Request() req,
    @Body() dto: ProcessPaymentDto,
    @Ip() ipAddr: string,
  ) {
    return this.paymentService.processPayment(dto, req.user.userId, ipAddr);
  }

  /**
   * GET /payments/vnpay/callback - VNPay callback (không cần auth)
   */
  @Get('vnpay/callback')
  async vnpayCallback(@Query() query: any) {
    return this.paymentService.vnpayCallback(query);
  }

  /**
   * POST /payments/test - Test thanh toán (không qua payment gateway)
   */
  @Post('test')
  @UseGuards(JwtAuthGuard)
  async testPayment(
    @Request() req,
    @Body() dto: TestPaymentDto,
  ) {
    return this.paymentService.testPayment(dto, req.user.userId);
  }
}