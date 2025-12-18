import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from 'src/entities/users.entity';
import { Vendor } from 'src/entities/vendors.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    // private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
  ) {}

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  // Validate user credentials
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');
    }

    const { password, ...result } = user;
    return result;
  }

  // Login
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const payload = { email: user.email, sub: user.id, role: user.role };

    return {
      success: true,
      access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    };
  }

  // Register
  async register(dto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      role: dto.role || 'user',
    });

    const savedUser = await this.userRepository.save(user);

    // If role is vendor, create vendor record
    if (savedUser.role === 'vendor') {
      const vendor = this.vendorRepository.create({
        user_id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        password: hashedPassword,
        phone: savedUser.phone,
        address: savedUser.address,
        status: 'pending',
      });
      await this.vendorRepository.save(vendor);
    }

    // 📧 GỬI MAIL TRỰC TIẾP
    try {
      await this.mailService.sendRegisterSuccess(
        savedUser.email,
        savedUser.name,
        // savedUser.role,
      );
    } catch (error) {
      console.error('Send mail failed:', error);
    }

    const { password, ...result } = savedUser;

    return {
      success: true,
      message: 'Đăng ký thành công',
      user: result,
    };
  }

  // Refresh token
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const newPayload = {
        email: payload.email,
        sub: payload.sub,
        role: payload.role,
      };

      return {
        success: true,
        access_token: this.jwtService.sign(newPayload, { expiresIn: '1h' }),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Get current user info
  async getMe(userId: number) {
    const user = await this.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...result } = user;
    return result;
  }

  // Change password
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { current_password, new_password, confirm_password } =
      changePasswordDto;

    // Validate new password matches confirm password
    if (new_password !== confirm_password) {
      throw new BadRequestException(
        'Mật khẩu mới và xác nhận mật khẩu không khớp',
      );
    }

    // Get user
    const user = await this.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      current_password,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Đổi mật khẩu thành công',
    };
  }
}
