// src/email/dto/email.dto.ts
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class SendVerificationEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  verificationToken: string;
}


export class SendPendingVerificationEmailDto {
  email: string;
  verificationToken: string;
  verificationId: string;
}