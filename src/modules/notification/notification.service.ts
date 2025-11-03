import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from 'src/entities/notifications.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

  /**
   * Lấy tất cả thông báo của user
   */
  async getNotificationsByUser(userId: number): Promise<any> {
    try {
      const notifications = await this.notificationRepo.find({
        where: { user_id: userId },
        order: { createdAt: 'DESC' },
      });

      return {
        success: true,
        message: 'Lấy danh sách thông báo thành công',
        data: notifications,
        total: notifications.length,
        unread_count: notifications.filter((n) => !n.is_read).length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách thông báo',
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Lấy thông báo chưa đọc của user
   */
  async getUnreadNotifications(userId: number): Promise<any> {
    try {
      const notifications = await this.notificationRepo.find({
        where: { user_id: userId, is_read: false },
        order: { createdAt: 'DESC' },
      });

      return {
        success: true,
        message: 'Lấy danh sách thông báo chưa đọc thành công',
        data: notifications,
        total: notifications.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy danh sách thông báo',
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Đánh dấu thông báo đã đọc
   */
  async markAsRead(notificationId: number, userId: number): Promise<any> {
    try {
      const notification = await this.notificationRepo.findOne({
        where: { id: notificationId, user_id: userId },
      });

      if (!notification) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy thông báo',
            error: 'NOTIFICATION_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      notification.is_read = true;
      await this.notificationRepo.save(notification);

      return {
        success: true,
        message: 'Đánh dấu đã đọc thành công',
        data: notification,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi đánh dấu thông báo',
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  async markAllAsRead(userId: number): Promise<any> {
    try {
      await this.notificationRepo.update(
        { user_id: userId, is_read: false },
        { is_read: true },
      );

      return {
        success: true,
        message: 'Đã đánh dấu tất cả thông báo là đã đọc',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi đánh dấu thông báo',
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Xóa thông báo
   */
  async deleteNotification(
    notificationId: number,
    userId: number,
  ): Promise<any> {
    try {
      const notification = await this.notificationRepo.findOne({
        where: { id: notificationId, user_id: userId },
      });

      if (!notification) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy thông báo',
            error: 'NOTIFICATION_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      await this.notificationRepo.remove(notification);

      return {
        success: true,
        message: 'Xóa thông báo thành công',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi xóa thông báo',
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Xóa tất cả thông báo đã đọc
   */
  async deleteReadNotifications(userId: number): Promise<any> {
    try {
      await this.notificationRepo.delete({
        user_id: userId,
        is_read: true,
      });

      return {
        success: true,
        message: 'Xóa tất cả thông báo đã đọc thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi xóa thông báo',
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
