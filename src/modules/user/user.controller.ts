import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // GET /users/profile - Lấy profile của user hiện tại
  @Get('profile')
  getProfile(@Request() req) {
    return this.userService.getProfile(req.user.userId);
  }

  // PATCH /users/profile - Cập nhật profile
  @Patch('profile')
  updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.userId, updateProfileDto);
  }

  // GET /users/favorites - Danh sách yêu thích
  @Get('favorites')
  getFavorites(@Request() req) {
    return this.userService.getFavorites(req.user.userId);
  }

  // POST /users/favorites/:planId - Thêm vào yêu thích
  @Post('favorites/:planId')
  addFavorite(@Request() req, @Param('planId', ParseIntPipe) planId: number) {
    return this.userService.addFavorite(req.user.userId, planId);
  }

  // DELETE /users/favorites/:planId - Xóa khỏi yêu thích
  @Delete('favorites/:planId')
  removeFavorite(@Request() req, @Param('planId', ParseIntPipe) planId: number) {
    return this.userService.removeFavorite(req.user.userId, planId);
  }
}

