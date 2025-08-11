import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailModule } from 'src/email/email.module';
import { FirestoreModule } from 'src/firestore/firestore.module';
import { TemplatesService } from './template.service';

@Module({
  imports: [EmailModule ,FirestoreModule],
  controllers: [AuthController],
  providers: [AuthService ,TemplatesService],
  exports: [AuthService],
})
export class AuthModule {}
