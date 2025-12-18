import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'minhtrivo2005gg@gmail.com',
          pass: 'tkqx ptzk rhnh gdiy',
        },
      },
      defaults: {
        from: '"My App" <no-reply@myapp.com>',
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService], // ⭐ QUAN TRỌNG
})
export class MailModule {}
