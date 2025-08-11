import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { SendPendingVerificationEmailDto, SendVerificationEmailDto } from './dto/email.dto';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private isInitialized = false;
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeTransporter();
  }

  private async initializeTransporter(): Promise<void> {
    try {
      // Configuration options
      const options = {
        service: 'gmail',
        auth: {
          user: this.configService.get('EMAIL_USER'),
          pass: this.configService.get('EMAIL_PASSWORD'),
        },
        tls: {
          rejectUnauthorized:
            this.configService.get('NODE_ENV') === 'production',
        },
        pool: true,
        maxConnections: 5,
        connectionTimeout: 50000,
        greetingTimeout: 50000,
        socketTimeout: 50000,
        logger: false,
        debug: this.configService.get('NODE_ENV') !== 'production',
      };

      this.transporter = nodemailer.createTransport(options);
      this.isInitialized = await this.verifyConnection();

      if (this.isInitialized) {
        this.logger.log('Email service successfully initialized');
      } else {
        this.logger.warn(
          'Email service initialized but connection verification failed',
        );
      }
    } catch (error) {
      this.logger.error('Email service initialization failed', error);
      this.isInitialized = false;
    }
  }

  private async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified');
      return true;
    } catch (error) {
      this.logger.error('SMTP connection verification failed', {
        error: error.message,
        code: error.code,
        response: error.response,
      });
      return false;
    }
  }

  private createVerificationEmailTemplate(
    userName: string,
    verificationLink: string,
    companyName: string,
  ): string {
    return `
     <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    /* Base Styles */
    body {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f7f9fc;
      margin: 0;
      padding: 0;
    }
    
    /* Container */
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    
    /* Header */
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    
    /* Content */
    .content {
      padding: 30px;
    }
    
    .content h2 {
      color: #2d3748;
      margin-top: 0;
      font-size: 20px;
      font-weight: 600;
    }
    
    .content p {
      margin-bottom: 20px;
      font-size: 15px;
      color: #4a5568;
    }
    
    /* Button */
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 30px;
      margin: 20px 0;
      font-weight: 500;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
    }
    
    /* Link */
    .verification-link {
      word-break: break-all;
      background: #f0f4f8;
      padding: 12px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 13px;
      color: #2d3748;
    }
    
    /* Footer */
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 13px;
      color: #718096;
      text-align: center;
    }
    
    .footer p {
      margin: 5px 0;
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .container {
        margin: 0;
        border-radius: 0;
      }
      
      .content {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${companyName}</h1>
    </div>
    
    <div class="content">
      <h2>Hi ${userName},</h2>
      <p>Welcome to ${companyName}! We're excited to have you on board. To get started, please verify your email address by clicking the button below:</p>
      
      <div style="text-align: center;">
        <a href="${verificationLink}" class="button">Verify Email Address</a>
      </div>
      
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <div class="verification-link">${verificationLink}</div>
      
      <p>This verification link will expire in 24 hours for your security.</p>
      <p>If you didn't create an account with ${companyName}, you can safely ignore this email.</p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
      <p>${companyName}, Making your experience better</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private async sendWithRetry(
    mailOptions: nodemailer.SendMailOptions,
  ): Promise<nodemailer.SentMessageInfo> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const info = await this.transporter.sendMail(mailOptions);
        this.logger.log(`Email sent to ${mailOptions.to} (attempt ${attempt})`);
        return info;
      } catch (error) {
        lastError = error;
        this.logger.warn(`Email send attempt ${attempt} failed`, {
          error: error.message,
          recipient: mailOptions.to,
        });

        if (attempt < this.maxRetries) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.retryDelay * attempt),
          );
        }
      }
    }

    this.logger.error(`All ${this.maxRetries} attempts failed`, {
      recipient: mailOptions.to,
      error: lastError ? lastError.message : 'Unknown error',
    });
    throw lastError || new Error('Unknown error occurred while sending email');
  }

  async sendVerificationEmail(
    dto: SendVerificationEmailDto,
  ): Promise<{ success: boolean; message: string; error?: string }> {
    if (!this.isInitialized) {
      return {
        success: false,
        message: 'Email service is not available',
        error: 'Service not initialized',
      };
    }

    const { email, verificationToken } = dto;
    const baseUrl = this.configService.get('FRONTEND_URL');
    const companyName = this.configService.get('COMPANY_NAME') || 'Our Service';
    const verificationLink = `${verificationToken}`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: `${companyName} - Please verify your email address`,
      html: this.createVerificationEmailTemplate(
        email,
        verificationLink,
        companyName,
      ),
      text: `Please verify your email by visiting: ${verificationLink}`,
      replyTo: this.configService.get('EMAIL_REPLY_TO'),
    };

    try {
      await this.sendWithRetry(mailOptions);
      return {
        success: true,
        message: 'Verification email sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send verification email',
        error: error.message,
      };
    }
  }

private createPendingVerificationEmailTemplate(
  userName: string,
  verificationLink: string,
  companyName: string,
): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Your Account Linking</title>
    <style>
      body {
        font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #FFF9E6;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background: #FFFDF5;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        border: 1px solid #FFEEB2;
      }
      .header {
        background: #FFD166;
        padding: 25px;
        text-align: center;
        border-bottom: 3px solid #FFC233;
      }
      .header h1 {
        color: #5E4200;
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
      .content {
        padding: 30px;
        color: #5E4200;
      }
      .content h2 {
        color: #8A6D00;
        margin-top: 0;
        font-size: 20px;
        font-weight: 600;
      }
      .content p {
        margin-bottom: 20px;
        font-size: 15px;
      }
      .button {
        display: inline-block;
        padding: 12px 30px;
        background: #FFD166;
        color: #5E4200 !important;
        text-decoration: none;
        border-radius: 4px;
        margin: 20px 0;
        font-weight: 500;
        text-align: center;
        border: 1px solid #FFC233;
        transition: all 0.3s ease;
      }
      .button:hover {
        background: #FFC233;
        box-shadow: 0 2px 8px rgba(255,193,51,0.3);
      }
      .verification-link {
        word-break: break-all;
        background: #FFF5CC;
        padding: 12px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 13px;
        color: #5E4200;
        border: 1px dashed #FFD166;
      }
      .footer {
        margin-top: 30px;
        padding: 20px;
        border-top: 1px solid #FFEEB2;
        font-size: 13px;
        color: #8A6D00;
        text-align: center;
        background: #FFF5CC;
      }
      .footer p {
        margin: 5px 0;
      }
      @media only screen and (max-width: 600px) {
        .container {
          margin: 0;
          border-radius: 0;
        }
        .content {
          padding: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>${companyName}</h1>
      </div>
      
      <div class="content">
        <h2>Hi ${userName},</h2>
        <p>We're excited to help you complete your account setup with ${companyName}! Just one more step to verify your email address and secure your account.</p>
        
        <div style="text-align: center;">
          <a href="${verificationLink}" class="button">Complete Account Setup</a>
        </div>
        
        <p><strong>Having trouble?</strong> Copy this link into your browser:</p>
        <div class="verification-link">${verificationLink}</div>
        
        <p><span style="color: #D4A017;">⚠️ Important:</span> This verification link will expire in 1 hour for your security.</p>
        
        <p>By completing this step, you'll be able to:</p>
        <ul style="padding-left: 20px; margin-top: -10px;">
          <li>Access all ${companyName} features</li>
          <li>Secure your account with your email</li>
          <li>Receive important notifications</li>
        </ul>
        
        <p>If you didn't request this, please ignore this email or contact our support team.</p>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        <p>Keeping your account safe and secure</p>
      </div>
    </div>
  </body>
  </html>
  `;
}



  async sendPendingVerificationEmail(
    dto: SendPendingVerificationEmailDto,
  ): Promise<{ success: boolean; message: string; error?: string }> {
    if (!this.isInitialized) {
      return {
        success: false,
        message: 'Email service is not available',
        error: 'Service not initialized',
      };
    }

    const { email, verificationToken, verificationId } = dto;
    const verificationLink = `${this.configService.get('FRONTEND_URL')}/auth/complete-link?id=${verificationId}&token=${verificationToken}`;
    const companyName = this.configService.get('COMPANY_NAME') || 'Our Service';

    const mailOptions: nodemailer.SendMailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: `${companyName} - Complete Your Account Linking`,
      html: this.createPendingVerificationEmailTemplate(
        email,
        verificationLink,
        companyName,
      ),
      text: `Please complete your account linking by visiting: ${verificationLink}`,
      replyTo: this.configService.get('EMAIL_REPLY_TO'),
      priority: 'high',
    };

    try {
      await this.sendWithRetry(mailOptions);
      return {
        success: true,
        message: 'Pending verification email sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send pending verification email',
        error: error.message,
      };
    }
  }





}
