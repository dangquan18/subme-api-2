import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
// import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/users.entity';
import { Vendor } from 'src/entities/vendors.entity';
import { JwtStrategy } from './jwt.strategy';
import { MailService } from '../mail/mail.service';
import { MailModule } from '../mail/mail.module';
// import { MailService } from '../mail/mail.service';
// import { MailModule } from '../mail/mail.module';
// import { JwtStrategy } from './jwt.strategy';
// import { AccountModule } from 'src/account/account.module';
// import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Vendor]),
    JwtModule.register({
      secret: 'SECRET_KEY',
      signOptions: { expiresIn: '1h' },
    }),
    MailModule,
  ],
  providers: [AuthService, JwtStrategy, MailService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
