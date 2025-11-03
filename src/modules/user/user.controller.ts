import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Lấy profile của user
  @Get('profile/:userId')
  getProfile(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.getProfile(userId);
  }

  // Cập nhật profile
  @Put('profile/:userId')
  updateProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(userId, updateProfileDto);
  }
}
