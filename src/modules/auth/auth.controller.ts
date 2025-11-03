import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountDto } from './dto/account.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    // private readonly subscriptionService: SubscriptionService,
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  @Post('register')
  create(@Body() dto: AccountDto) {
    return this.authService.register(dto);
  }
}
