import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from 'src/entities/users.entity';
import { Favorite } from 'src/entities/favorites.entity';
import { Plan } from 'src/entities/plans.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Favorite, Plan])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
