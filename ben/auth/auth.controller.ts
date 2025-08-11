import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Headers,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LinkAccountDto } from './dto/link-account.dto';
import { TemplatesService } from './template.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private readonly templatesService: TemplatesService) {}

  // @ApiOperation({ summary: 'Register a new user' })
  // @ApiResponse({ status: 201, description: 'User registered successfully' })
  // @ApiResponse({ status: 400, description: 'Bad request' })
  // @ApiResponse({ status: 409, description: 'Email already exists' })
  // @Post('register')
  // @UsePipes(new ValidationPipe({ transform: true }))
  // registerUser(@Body() registerUserDto: CreateUserDto) {
  //   return this.authService.linkAccount(registerUserDto);
  // }


  @Post('init-link-account')
  @UsePipes(new ValidationPipe({ transform: true }))
  initiatelinkingAccount(@Body() registerUserDto: CreateUserDto) {
    return this.authService.createPendingVerification(registerUserDto);
  }

  
// @Get('complete-link') 
// @UsePipes(new ValidationPipe({ transform: true }))
// async completeLinkAccount(
//   @Query('id') verificationId: string,
//   @Query('token') verificationToken: string,
// ) {
//   return this.authService.completeVerification(verificationId, verificationToken);
// }



@Get('complete-link')
  async completeVerification(
    @Query('id') verificationId: string,
    @Query('token') verificationToken: string,
    @Res() res: Response,
  ) {
    const result = await this.authService.completeVerification(
      verificationId,
      verificationToken,
    );
  

    if (result.success) {
      res.send(this.templatesService.getVerificationResultPage({
        success: true,
        title: 'Account Linked!',
        message: 'Your account has been successfully linked. Please verify your email.',

      }));
    } else {
      res.send(this.templatesService.getVerificationResultPage({
        success: false,
        title: 'Linking Failed',
        message: result.message || 'There was a problem linking your account.',
      }));
    }
  }


  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  login(@Body() loginDto: LoginDto) {
    return this.authService.signin(loginDto);
  }

  @ApiOperation({ summary: 'Create anonymous user session' })
  @ApiResponse({ status: 200, description: 'Anonymous session created' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get('anonymous')
  async createAnonymousSession() {
    return this.authService.signInAnonymously();
  } 

  

  @ApiOperation({ summary: 'Validate authentication' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('validate')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  validateAuth() {
    return { message: 'Authentication valid' };
  }

  @ApiOperation({ summary: 'Refresh authentication token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('refresh-auth')
  refreshAuth(@Query('refreshToken') refreshToken: string) {
    return this.authService.refreshAuthToken(refreshToken);
  }
}

// @ApiOperation({ summary: 'Link anonymous account to permanent credentials' })
  // @ApiResponse({ status: 200, description: 'Account linked successfully' })
  // @ApiResponse({ status: 400, description: 'Bad request' })
  // @ApiResponse({ status: 401, description: 'Unauthorized' })
  // @ApiBearerAuth()
  // @Post('link-account')
  // @UseGuards(AuthGuard)
  // @UsePipes(new ValidationPipe({ transform: true }))
  // async linkAccount(
  //   @Headers('authorization') authHeader: string,
  //   @Body() linkAccountDto: LinkAccountDto,
  // ) {
  //   const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
  //   return this.authService.linkAccount(token, linkAccountDto);
  // }  