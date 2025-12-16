import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from 'src/entities/notifications.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async findAll(userId: number, page: number = 1, limit: number = 20, isRead?: boolean) {
    const query = this.notificationsRepository
      .createQueryBuilder('notification')
      .where('notification.user_id = :userId', { userId })
      .orderBy('notification.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (isRead !== undefined) {
      query.andWhere('notification.is_read = :isRead', { isRead });
    }

    const [notifications, total] = await query.getManyAndCount();

    // Format notifications với created_at
    const formattedNotifications = notifications.map(notification => ({
      ...notification,
      created_at: notification.createdAt,
    }));

    return {
      data: formattedNotifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationsRepository.count({
      where: { user_id: userId, is_read: false },
    });
  }

  async markAsRead(id: number, userId: number) {
    const notification = await this.notificationsRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.is_read = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: number) {
    await this.notificationsRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ is_read: true })
      .where('user_id = :userId', { userId })
      .andWhere('is_read = :isRead', { isRead: false })
      .execute();

    return { message: 'All notifications marked as read' };
  }

  async remove(id: number, userId: number) {
    const notification = await this.notificationsRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await this.notificationsRepository.remove(notification);
    return { message: 'Notification deleted successfully' };
  }
}
