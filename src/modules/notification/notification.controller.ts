import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Lấy tất cả thông báo của user
  @Get('user/:userId')
  getNotificationsByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationService.getNotificationsByUser(userId);
  }

  // Lấy thông báo chưa đọc
  @Get('user/:userId/unread')
  getUnreadNotifications(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationService.getUnreadNotifications(userId);
  }

  // Đánh dấu 1 thông báo đã đọc
  @Put(':id/read')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Body('user_id') userId: number,
  ) {
    return this.notificationService.markAsRead(id, userId);
  }

  // Đánh dấu tất cả đã đọc
  @Put('user/:userId/read-all')
  markAllAsRead(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationService.markAllAsRead(userId);
  }

  // Xóa 1 thông báo
  @Delete(':id')
  deleteNotification(
    @Param('id', ParseIntPipe) id: number,
    @Body('user_id') userId: number,
  ) {
    return this.notificationService.deleteNotification(id, userId);
  }

  // Xóa tất cả thông báo đã đọc
  @Delete('user/:userId/read')
  deleteReadNotifications(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationService.deleteReadNotifications(userId);
  }
}
