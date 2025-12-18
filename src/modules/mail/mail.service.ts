import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendRegisterSuccess(email: string, name: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Đăng ký thành công 🎉',
      html: `
        <h2>Xin chào ${name}</h2>
        <p>Bạn đã đăng ký tài khoản thành công.</p>
        <p>Cảm ơn bạn đã sử dụng dịch vụ SUBME!</p>
      `,
    });
  }
}
