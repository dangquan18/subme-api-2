import { Injectable, HttpException, HttpStatus, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/users.entity';
import { Favorite } from 'src/entities/favorites.entity';
import { Plan } from 'src/entities/plans.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Favorite)
    private favoriteRepo: Repository<Favorite>,
    @InjectRepository(Plan)
    private planRepo: Repository<Plan>,
  ) {}

  /**
   * GET /users/profile - Lấy thông tin profile
   */
  async getProfile(userId: number) {
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
      throw new NotFoundException('Không tìm thấy user');
    }

    return user;
  }

  /**
   * PATCH /users/profile - Cập nhật profile
   */
  async updateProfile(userId: number, updateDto: UpdateProfileDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Không tìm thấy user');
    }

    Object.assign(user, updateDto);
    await this.userRepo.save(user);

    const { password, ...result } = user;
    return result;
  }

  /**
   * GET /users/favorites - Danh sách gói yêu thích
   */
  async getFavorites(userId: number) {
    const favorites = await this.favoriteRepo.find({
      where: { user_id: userId },
      relations: ['plan', 'plan.vendor', 'plan.category'],
      order: { createdAt: 'DESC' },
    });

    return favorites.map((fav) => fav.plan);
  }

  /**
   * POST /users/favorites/:planId - Thêm vào yêu thích
   */
  async addFavorite(userId: number, planId: number) {
    // Check if plan exists
    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException('Gói dịch vụ không tồn tại');
    }

    // Check if already favorited
    const existingFavorite = await this.favoriteRepo.findOne({
      where: { user_id: userId, plan_id: planId },
    });

    if (existingFavorite) {
      throw new ConflictException('Gói này đã có trong danh sách yêu thích');
    }

    const favorite = this.favoriteRepo.create({
      user_id: userId,
      plan_id: planId,
    });

    await this.favoriteRepo.save(favorite);

    return {
      success: true,
      message: 'Đã thêm vào yêu thích',
      favorite,
    };
  }

  /**
   * DELETE /users/favorites/:planId - Xóa khỏi yêu thích
   */
  async removeFavorite(userId: number, planId: number) {
    const favorite = await this.favoriteRepo.findOne({
      where: { user_id: userId, plan_id: planId },
    });

    if (!favorite) {
      throw new NotFoundException('Không tìm thấy trong danh sách yêu thích');
    }

    await this.favoriteRepo.remove(favorite);

    return {
      success: true,
      message: 'Đã xóa khỏi danh sách yêu thích',
    };
  }

  /**
   * Check if a plan is favorited by user
   */
  async isFavorited(userId: number, planId: number): Promise<boolean> {
    const favorite = await this.favoriteRepo.findOne({
      where: { user_id: userId, plan_id: planId },
    });

    return !!favorite;
  }
}
