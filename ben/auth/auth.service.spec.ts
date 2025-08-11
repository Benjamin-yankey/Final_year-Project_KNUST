import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import * as firebaseAdmin from 'firebase-admin';
import { EmailService } from '../email/email.service';
import axios from 'axios';
import { AuthError } from './errors/auth.errors';

jest.mock('firebase-admin');
jest.mock('axios');
jest.mock('../email/email.service');

describe('AuthService', () => {
  let service: AuthService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, EmailService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    emailService = module.get<EmailService>(EmailService);

    // Mock implementations
    jest
      .spyOn(service as any, 'getFirebaseErrorMessage')
      .mockImplementation((error) => error);
    jest.spyOn(service as any, 'getStatusCodeFromError').mockReturnValue(500);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should successfully register a user', async () => {
      const mockUser = {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: false,
      };

      (firebaseAdmin.auth().createUser as jest.Mock).mockResolvedValue(
        mockUser,
      );
      (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await service.signup({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+1234567890',
      });

      expect(result.success).toBe(true);
      expect(result.data.uid).toBe(mockUser.uid);
      expect(firebaseAdmin.auth().createUser).toHaveBeenCalledWith({
        displayName: 'Test',
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle email already exists error', async () => {
      const error = new Error('Email already in use');
      error['code'] = 'auth/email-already-in-use';
      (firebaseAdmin.auth().createUser as jest.Mock).mockRejectedValue(error);

      const result = await service.signup({
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+1234567890',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('registration_failed');
      expect(result.statusCode).toBe(409);
    });

    it('should handle weak password error', async () => {
      const error = new Error('Weak password');
      error['code'] = 'auth/weak-password';
      (firebaseAdmin.auth().createUser as jest.Mock).mockRejectedValue(error);

      const result = await service.signup({
        email: 'test@example.com',
        password: 'weak',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+1234567890',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('registration_failed');
      expect(result.statusCode).toBe(400);
    });

    it('should return success even if verification email fails', async () => {
      const mockUser = {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: false,
      };

      (firebaseAdmin.auth().createUser as jest.Mock).mockResolvedValue(
        mockUser,
      );
      (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue({
        success: false,
      });

      const result = await service.signup({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+1234567890',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('verification email could not be sent');
    });
  });

  describe('signin', () => {
    it('should successfully sign in a user', async () => {
      const mockAxiosResponse = {
        data: {
          idToken: 'token123',
          refreshToken: 'refresh123',
          expiresIn: 3600,
        },
      };

      const mockUser = {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true,
      };

      (axios.post as jest.Mock).mockResolvedValue(mockAxiosResponse);
      (firebaseAdmin.auth().verifyIdToken as jest.Mock).mockResolvedValue({
        uid: '123',
      });
      (firebaseAdmin.auth().getUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.signin({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data.idToken).toBe('token123');
    });

    it('should require email verification if not verified', async () => {
      const mockAxiosResponse = {
        data: {
          idToken: 'token123',
          refreshToken: 'refresh123',
          expiresIn: 3600,
        },
      };

      const mockUser = {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: false,
      };

      (axios.post as jest.Mock).mockResolvedValue(mockAxiosResponse);
      (firebaseAdmin.auth().verifyIdToken as jest.Mock).mockResolvedValue({
        uid: '123',
      });
      (firebaseAdmin.auth().getUser as jest.Mock).mockResolvedValue(mockUser);
      (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await service.signin({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('email_not_verified');
      expect(result.statusCode).toBe(403);
      expect(result.data.requiresVerification).toBe(true);
    });

    it('should handle invalid credentials', async () => {
      const error = new Error('Invalid credentials');
      error['response'] = {
        data: {
          error: {
            message: 'INVALID_PASSWORD',
          },
        },
      };
      (axios.post as jest.Mock).mockRejectedValue(error);

      const result = await service.signin({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('invalid_credentials');
      expect(result.statusCode).toBe(401);
    });

    it('should handle user not found', async () => {
      const error = new Error('User not found');
      error['response'] = {
        data: {
          error: {
            message: 'EMAIL_NOT_FOUND',
          },
        },
      };
      (axios.post as jest.Mock).mockRejectedValue(error);

      const result = await service.signin({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('user_not_found');
      expect(result.statusCode).toBe(404);
    });
  });

  describe('validateRequest', () => {
    it('should validate a request with proper token', async () => {
      const mockDecodedToken = {
        uid: '123',
        email: 'test@example.com',
        email_verified: true,
      };

      (firebaseAdmin.auth().verifyIdToken as jest.Mock).mockResolvedValue(
        mockDecodedToken,
      );

      const req = {
        headers: {
          authorization: 'Bearer validtoken',
        },
      };

      const result = await service.validateRequest(req);

      expect(result.success).toBe(true);
      expect(req['user']).toEqual({
        uid: '123',
        email: 'test@example.com',
        email_verified: true,
      });
    });

    it('should reject request with missing authorization header', async () => {
      const req = {
        headers: {},
      };

      const result = await service.validateRequest(req);

      expect(result.success).toBe(false);
      expect(result.error).toBe('missing_authorization_header');
      expect(result.statusCode).toBe(401);
    });

    it('should reject request with invalid token format', async () => {
      const req = {
        headers: {
          authorization: 'InvalidFormat',
        },
      };

      const result = await service.validateRequest(req);

      expect(result.success).toBe(false);
      expect(result.error).toBe('invalid_authorization_format');
      expect(result.statusCode).toBe(401);
    });

    it('should reject request with expired token', async () => {
      const error = new Error('Token expired');
      error['code'] = 'auth/id-token-expired';
      (firebaseAdmin.auth().verifyIdToken as jest.Mock).mockRejectedValue(
        error,
      );

      const req = {
        headers: {
          authorization: 'Bearer expiredtoken',
        },
      };

      const result = await service.validateRequest(req);

      expect(result.success).toBe(false);
      expect(result.error).toBe('token_validation_failed');
      expect(result.statusCode).toBe(401);
    });
  });

  describe('refreshAuthToken', () => {
    it('should refresh auth token successfully', async () => {
      const mockResponse = {
        id_token: 'newtoken',
        refresh_token: 'newrefreshtoken',
        expires_in: 3600,
      };

      (service as any).sendPostRequest = jest
        .fn()
        .mockResolvedValue(mockResponse);

      const result = await service.refreshAuthToken('oldrefreshtoken');

      expect(result.success).toBe(true);
      expect(result.data.idToken).toBe('newtoken');
      expect(result.data.refreshToken).toBe('newrefreshtoken');
    });

    it('should handle invalid refresh token', async () => {
      const error = new Error('Invalid refresh token');
      error['response'] = {
        data: {
          error: {
            message: 'INVALID_REFRESH_TOKEN',
          },
        },
      };

      (service as any).sendPostRequest = jest.fn().mockRejectedValue(error);

      const result = await service.refreshAuthToken('invalidtoken');

      expect(result.success).toBe(false);
      expect(result.error).toBe('token_refresh_failed');
      expect(result.statusCode).toBe(401);
    });
  });

  describe('signInAnonymously', () => {
    it('should create anonymous user successfully', async () => {
      const mockResponse = {
        data: {
          idToken: 'anontoken',
          refreshToken: 'anonrefresh',
          expiresIn: 3600,
        },
      };

      const mockUser = {
        uid: 'anon123',
        email: null,
        displayName: null,
        emailVerified: false,
        providerData: [],
      };

      (axios.post as jest.Mock).mockResolvedValue(mockResponse);
      (firebaseAdmin.auth().verifyIdToken as jest.Mock).mockResolvedValue({
        uid: 'anon123',
      });
      (firebaseAdmin.auth().getUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.signInAnonymously();

      expect(result.success).toBe(true);
      expect(result.data.user.isAnonymous).toBe(true);
    });

    it('should handle anonymous sign-in failure', async () => {
      const error = new Error('Anonymous sign-in failed');
      (axios.post as jest.Mock).mockRejectedValue(error);

      const result = await service.signInAnonymously();

      expect(result.success).toBe(false);
      expect(result.error).toBe('anonymous_signin_failed');
    });
  });

  describe('linkAccount', () => {
    it('should link anonymous account to credentials successfully', async () => {
      const mockDecodedToken = { uid: 'anon123' };
      const mockAnonymousUser = {
        uid: 'anon123',
        providerData: [],
        email: null,
      };
      const mockUpdatedUser = {
        uid: 'anon123',
        email: 'test@example.com',
        emailVerified: false,
        displayName: null,
      };
      const mockTokenResponse = {
        data: {
          idToken: 'newtoken',
          refreshToken: 'newrefresh',
          expiresIn: 3600,
        },
      };

      (firebaseAdmin.auth().verifyIdToken as jest.Mock).mockResolvedValue(
        mockDecodedToken,
      );
      (firebaseAdmin.auth().getUser as jest.Mock)
        .mockResolvedValueOnce(mockAnonymousUser) // First call for anonymous user
        .mockResolvedValueOnce(mockUpdatedUser); // Second call after update
      (firebaseAdmin.auth().updateUser as jest.Mock).mockResolvedValue(
        mockUpdatedUser,
      );
      (firebaseAdmin.auth().createCustomToken as jest.Mock).mockResolvedValue(
        'customtoken',
      );
      (axios.post as jest.Mock).mockResolvedValue(mockTokenResponse);
      (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await service.linkAccount('anontoken', {
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data.user.email).toBe('test@example.com');
      expect(result.data.user.isAnonymous).toBe(false);
      expect(emailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should reject linking for non-anonymous user', async () => {
      const mockDecodedToken = { uid: 'user123' };
      const mockUser = {
        uid: 'user123',
        providerData: [{ providerId: 'password' }],
        email: 'existing@example.com',
      };

      (firebaseAdmin.auth().verifyIdToken as jest.Mock).mockResolvedValue(
        mockDecodedToken,
      );
      (firebaseAdmin.auth().getUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.linkAccount('usertoken', {
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('user_not_anonymous');
    });

    it('should reject linking with existing email', async () => {
      const mockDecodedToken = { uid: 'anon123' };
      const mockAnonymousUser = {
        uid: 'anon123',
        providerData: [],
        email: null,
      };

      (firebaseAdmin.auth().verifyIdToken as jest.Mock).mockResolvedValue(
        mockDecodedToken,
      );
      (firebaseAdmin.auth().getUser as jest.Mock).mockResolvedValue(
        mockAnonymousUser,
      );
      (firebaseAdmin.auth().getUserByEmail as jest.Mock).mockImplementation(
        () => {
          throw new Error('User exists');
        },
      );

      const result = await service.linkAccount('anontoken', {
        email: 'existing@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('email_validation_failed');
    });

    it('should reject linking with weak password', async () => {
      const mockDecodedToken = { uid: 'anon123' };
      const mockAnonymousUser = {
        uid: 'anon123',
        providerData: [],
        email: null,
      };

      (firebaseAdmin.auth().verifyIdToken as jest.Mock).mockResolvedValue(
        mockDecodedToken,
      );
      (firebaseAdmin.auth().getUser as jest.Mock).mockResolvedValue(
        mockAnonymousUser,
      );
      (firebaseAdmin.auth().getUserByEmail as jest.Mock).mockImplementation(
        () => {
          throw { code: 'auth/user-not-found' };
        },
      );

      const result = await service.linkAccount('anontoken', {
        email: 'test@example.com',
        password: 'weak',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('weak_password');
    });
  });

  describe('helper methods', () => {
    it('should validate email format correctly', () => {
      const isValid = (service as any).isValidEmail('test@example.com');
      expect(isValid).toBe(true);

      const isInvalid = (service as any).isValidEmail('notanemail');
      expect(isInvalid).toBe(false);
    });

    it('should check password strength correctly', () => {
      const isStrong = (service as any).isStrongPassword('Password123');
      expect(isStrong).toBe(true);

      const isWeak = (service as any).isStrongPassword('123');
      expect(isWeak).toBe(false);
    });
  });
});
