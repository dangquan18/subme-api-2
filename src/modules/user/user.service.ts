import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/users.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  /**
   * Lấy thông tin profile
   */
  async getProfile(userId: number): Promise<any> {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        select: [
          'id',
          'name',
          'email',
          'role',
          'phone',
          'address',
          'date_of_birth',
          'createdAt',
          'updatedAt',
        ],
      });

      if (!user) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy user',
            error: 'USER_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Lấy thông tin profile thành công',
        data: user,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi lấy thông tin profile',
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cập nhật profile
   */
  async updateProfile(
    userId: number,
    updateData: UpdateProfileDto,
  ): Promise<any> {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException(
          {
            success: false,
            message: 'Không tìm thấy user',
            error: 'USER_NOT_FOUND',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Cập nhật thông tin
      if (updateData.name !== undefined) {
        user.name = updateData.name;
      }

      if (updateData.phone !== undefined) {
        user.phone = updateData.phone;
      }

      if (updateData.address !== undefined) {
        user.address = updateData.address;
      }

      if (updateData.date_of_birth !== undefined) {
        user.date_of_birth = new Date(updateData.date_of_birth);
      }

      await this.userRepo.save(user);

      // Trả về thông tin mới (không có password)
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        message: 'Cập nhật profile thành công',
        data: userWithoutPassword,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Có lỗi xảy ra khi cập nhật profile',
          error: 'INTERNAL_SERVER_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
