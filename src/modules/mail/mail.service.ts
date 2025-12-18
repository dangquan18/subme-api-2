import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendRegisterSuccess(email: string, content: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Đăng ký thành công 🎉',
      html: `
        ${content}
      `,
    });
  }
}
