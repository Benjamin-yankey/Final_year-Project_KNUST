import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendVerificationEmailDto } from './dto/email.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-verification')
  async sendVerificationEmail(@Body() dto: SendVerificationEmailDto) {
    try {
      await this.emailService.sendVerificationEmail(dto);
      return {
        success: true,
        message: 'Verification email sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send verification email',
        error: error.message,
        details:
          process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };
    }
  }
}
