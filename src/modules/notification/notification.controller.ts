import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * GET /notifications - Danh sách thông báo
   */
  @Get()
  findAll(
    @Request() req,
    @Query('is_read') isRead?: string,
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
  ) {
    const isReadBool = isRead === 'true' ? true : isRead === 'false' ? false : undefined;
    
    // ⭐ Parse sang number với default values
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 20;
    
    return this.notificationService.findAll(req.user.userId, page, limit, isReadBool);
  }

  /**
   * GET /notifications/unread-count - Số lượng chưa đọc
   */
  @Get('unread-count')
  getUnreadCount(@Request() req) {
    return this.notificationService.getUnreadCount(req.user.userId);
  }

  /**
   * PATCH /notifications/:id/read - Đánh dấu đã đọc
   */
  @Patch(':id/read')
  markAsRead(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.notificationService.markAsRead(id, req.user.userId);
  }

  /**
   * PATCH /notifications/read-all - Đánh dấu tất cả đã đọc
   */
  @Patch('read-all')
  markAllAsRead(@Request() req) {
    return this.notificationService.markAllAsRead(req.user.userId);
  }

  /**
   * DELETE /notifications/:id - Xóa thông báo
   */
  @Delete(':id')
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.notificationService.remove(id, req.user.userId);
  }
}