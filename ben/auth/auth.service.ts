import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as firebaseAdmin from 'firebase-admin';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { LinkAccountDto } from './dto/link-account.dto';
import { AuthError } from './errors/auth.errors';
import { EmailService } from 'src/email/email.service';
import { FirestoreService } from 'src/firestore/firestore.service';

export interface AuthResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  statusCode?: number;
  details?: any;
}

@Injectable()
export class AuthService {
  constructor(private readonly emailService: EmailService, private readonly firestoreService: FirestoreService,
  ) { }
  private readonly logger = new Logger(AuthService.name);
  private readonly ENCRYPTION_KEY = crypto.randomBytes(32);
  private readonly IV = crypto.randomBytes(16);

  // async signup(registerUser: CreateUserDto): Promise<AuthResponse> {
  //   this.logger.log(`Attempting to register user: ${registerUser.email}`);
  //   try {
  //     const userRecord = await firebaseAdmin.auth().createUser({
  //       email: registerUser.email,
  //       password: registerUser.password,
  //     });

  //     this.logger.log(`User registered successfully: ${userRecord.uid}`);

  //     // Send email verification
  //     if (!userRecord.email) {
  //       return {
  //         success: false,
  //         message: 'User email is missing, cannot send verification email',
  //         error: 'missing_user_email',
  //         statusCode: 500,
  //       };
  //     }

  //     const emailResult = await this.sendEmailVerification(userRecord.email);
  //     if (!emailResult.success) {
  //       // Registration succeeded but verification email failed
  //       return {
  //         success: true,
  //         data: {
  //           uid: userRecord.uid,
  //           email: userRecord.email,
  //           displayName: userRecord.displayName,
  //           emailVerified: userRecord.emailVerified,
  //         },
  //         message:
  //           'Account created successfully, but verification email could not be sent. You can request a new verification email later.',
  //         statusCode: 201,
  //       };
  //     }

  //     return {
  //       success: true,
  //       data: {
  //         uid: userRecord.uid,
  //         email: userRecord.email,
  //         displayName: userRecord.displayName,
  //         emailVerified: userRecord.emailVerified,
  //       },
  //       message:
  //         'Account created successfully. Please check your email for verification.',
  //       statusCode: 201,
  //     };
  //   } catch (error) {
  //     this.logger.error(
  //       `User registration failed: ${error.message}`,
  //       error.stack,
  //     );
  //     return {
  //       success: false,
  //       message: this.getFirebaseErrorMessage(error),
  //       error: 'registration_failed',
  //       statusCode: this.getStatusCodeFromError(error),
  //       details: {
  //         email: registerUser.email,
  //         errorCode: error.code,
  //       },
  //     };
  //   }
  // }

  async signinX(payload: LoginDto): Promise<AuthResponse> {
    this.logger.log(`Attempting sign-in for user: ${payload.email}`);

    try {
      // Validate email format
      if (!this.isValidEmail(payload.email)) {
        throw new AuthError(
          'Please enter a valid email address',
          400,
          { errorCode: 'invalid_email_format' }
        );
      }

      // Attempt authentication
      const authResponse = await this.signInWithEmailAndPassword(
        payload.email,
        payload.password
      ).catch(error => {
        throw AuthError.fromFirebaseError(error, 'Sign-in failed');
      });

      if (!authResponse?.data?.idToken) {
        throw new AuthError(
          'Authentication failed: No token received',
          401,
          { errorCode: 'authentication_failed' }
        );
      }

      // Get user details
      const userResult = await this.getUserFromToken(authResponse.data.idToken);
      if (!userResult.success) {
        throw new AuthError(
          'Unable to retrieve user information',
          401,
          { errorCode: 'user_retrieval_failed' }
        );
      }

      const user = userResult.data;

      // Check email verification status
      if (!user.emailVerified) {
        const verificationResult = await this.sendEmailVerification(payload.email);
        return {
          success: false,
          message: verificationResult.success
            ? "Please verify your email address to continue. We've sent a new verification email to your inbox."
            : 'Please verify your email address to continue. Unable to send verification email at this time.',
          error: 'email_not_verified',
          statusCode: 403,
          data: {
            requiresVerification: true,
            email: payload.email,
            verificationEmailSent: verificationResult.success,
          },
        };
      }

      // Successful authentication
      this.logger.log(`User signed in successfully: ${user.uid}`);
      return {
        success: true,
        message: 'Welcome back! You have been signed in successfully.',
        statusCode: 200,
        data: {
          idToken: authResponse.data.idToken,
          refreshToken: authResponse.data.refreshToken,
          expiresIn: authResponse.data.expiresIn,
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
          },
        },
      };
    } catch (error) {
      this.logger.error(`Sign-in failed for ${payload.email}:`, {
        error: error.message,
        stack: error.stack,
        ...(error instanceof AuthError && { details: error.details }),
      });

      if (error instanceof AuthError) {
        return {
          success: false,
          message: error.message,
          error: error.name,
          statusCode: error.statusCode,
          data: {
            email: payload.email,
            ...error.details,
          },
        };
      }

      // Handle non-AuthError cases
      return {
        success: false,
        message: 'An unexpected error occurred during sign-in',
        error: 'internal_error',
        statusCode: 500,
        data: {
          email: payload.email,
          details: {
            errorMessage: error.message,
          },
        },
      };
    }
  }



  private async signInWithEmailAndPasswordA(email: string, password: string) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`;

    return axios.post(
      url,
      {
        email,
        password,
        returnSecureToken: true,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
        validateStatus: (status) => status < 500, // Don't throw for 4xx errors
      }
    );
  }


  async signin(payload: LoginDto): Promise<AuthResponse> {
    this.logger.log(`Attempting sign-in for user: ${payload.email}`);

    try {
      // Validate email format
      if (!this.isValidEmail(payload.email)) {
        throw new AuthError(
          'Please enter a valid email address',
          400,
          { errorCode: 'invalid_email_format' }
        );
      }

      // Attempt authentication
      const { success, data: authData, error } = await this.signInWithEmailAndPassword(
        payload.email,
        payload.password
      );

      if (!success || !authData?.idToken) {
        throw AuthError.fromFirebaseError(
          error || { message: 'Authentication failed', code: 'auth_failed' },
          'Sign-in failed'
        );
      }

      // Get user details
      const userResult = await this.getUserFromToken(authData.idToken);
      if (!userResult.success) {
        throw new AuthError(
          'Unable to retrieve user information',
          401,
          { errorCode: 'user_retrieval_failed' }
        );
      }

      const user = userResult.data;

      // Check email verification status
      if (!user.emailVerified) {
        const verificationResult = await this.sendEmailVerification(payload.email);
        return {
          success: false,
          message: verificationResult.success
            ? "Please verify your email address to continue. We've sent a new verification email to your inbox."
            : 'Please verify your email address to continue. Unable to send verification email at this time.',
          error: 'email_not_verified',
          statusCode: 403,
          data: {
            requiresVerification: true,
            email: payload.email,
            verificationEmailSent: verificationResult.success,
          },
        };
      }

      // Successful authentication
      this.logger.log(`User signed in successfully: ${user.uid}`);
      return {
        success: true,
        message: 'Welcome back! You have been signed in successfully.',
        statusCode: 200,
        data: {
          idToken: authData.idToken,
          refreshToken: authData.refreshToken,
          expiresIn: authData.expiresIn,
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
          },
        },
      };
    } catch (error) {
      this.logger.error(`Sign-in failed for ${payload.email}:`, {
        error: error.message,
        stack: error.stack,
        ...(error instanceof AuthError && { details: error.details }),
      });

      if (error instanceof AuthError) {
        return {
          success: false,
          message: error.message,
          error: error.name,
          statusCode: error.statusCode,
          data: {
            email: payload.email,
            ...error.details,
          },
        };
      }

      return {
        success: false,
        message: 'An unexpected error occurred during sign-in',
        error: 'internal_error',
        statusCode: 500,
        data: {
          email: payload.email,
          details: {
            errorMessage: error.message,
          },
        },
      };
    }
  }

  private async signInWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    data?: {
      idToken: string;
      refreshToken: string;
      expiresIn: string;
      localId: string;
    };
    error?: any;
  }> {
    try {
      const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`;

      const response = await axios.post(url, {
        email,
        password,
        returnSecureToken: true,
      });

      if (!response.data?.idToken) {
        return {
          success: false,
          error: {
            message: 'Authentication succeeded but no token received',
            code: 'missing_token'
          }
        };
      }

      return {
        success: true,
        data: {
          idToken: response.data.idToken,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn,
          localId: response.data.localId
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || error.message,
          code: error.response?.data?.error?.code || 'auth_error'
        }
      };
    }
  }




  async signInAnonymously(): Promise<AuthResponse> {
    this.logger.log('Attempting anonymous sign-in');
    try {
      const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.FIREBASE_API_KEY}`;

      const response = await axios.post(
        url,
        {
          returnSecureToken: true,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
        },
      );

      if (!response.data?.idToken) {
        return {
          success: false,
          message: 'Authentication failed: No ID token received',
          error: 'no_token_received',
          statusCode: 401,
        };
      }

      const userResult = await this.getUserFromToken(response.data.idToken);
      if (!userResult.success) {
        return {
          success: false,
          message: 'Failed to retrieve anonymous user from token',
          error: 'user_retrieval_failed',
          statusCode: 401,
        };
      }

      this.logger.log(`Anonymous user created: ${userResult.data.uid}`);
      return {
        success: true,
        data: {
          idToken: response.data.idToken,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn,
          user: userResult.data,
        },
        message: 'Anonymous session created successfully',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error(
        `Anonymous sign-in failed: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: error.message || 'Anonymous authentication failed',
        error: 'anonymous_signin_failed',
        statusCode: error.status || 500,
        details: { errorCode: error.code },
      };
    }
  }

  // async signin(payload: LoginDto): Promise<AuthResponse> {
  //   this.logger.log(`Attempting sign-in for user: ${payload.email}`);

  //   try {
  //     // Validate email format
  //     if (!this.isValidEmail(payload.email)) {
  //       return {
  //         success: false,
  //         message: 'Please enter a valid email address',
  //         error: 'invalid_email_format',
  //         statusCode: 400,
  //       };
  //     }

  //     const authResponse = await this.signInWithEmailAndPassword(
  //       payload.email,
  //       payload.password,
  //     );

  //     if (!authResponse?.data?.idToken) {
  //       return {
  //         success: false,
  //         message:
  //           'Sign-in failed. Please check your credentials and try again.',
  //         error: 'authentication_failed',
  //         statusCode: 401,
  //       };
  //     }

  //     const userResult = await this.getUserFromToken(authResponse.data.idToken);
  //     if (!userResult.success) {
  //       return {
  //         success: false,
  //         message:
  //           'Unable to retrieve your account information. Please try signing in again.',
  //         error: 'user_retrieval_failed',
  //         statusCode: 401,
  //       };
  //     }

  //     const user = userResult.data;

  //     // Check if email is verified
  //     if (!user.emailVerified) {
  //       const verificationResult = await this.sendEmailVerification(
  //         payload.email,
  //       );
  //       return {
  //         success: false,
  //         message: verificationResult.success
  //           ? "Please verify your email address to continue. We've sent a new verification email to your inbox."
  //           : 'Please verify your email address to continue. Unable to send verification email at this time.',
  //         error: 'email_not_verified',
  //         statusCode: 403,
  //         data: {
  //           requiresVerification: true,
  //           email: payload.email,
  //           verificationEmailSent: verificationResult.success,
  //         },
  //       };
  //     }

  //     this.logger.log(`User signed in successfully: ${user.uid}`);
  //     return {
  //       success: true,
  //       message: 'Welcome back! You have been signed in successfully.',
  //       statusCode: 200,
  //       data: {
  //         idToken: authResponse.data.idToken,
  //         refreshToken: authResponse.data.refreshToken,
  //         expiresIn: authResponse.data.expiresIn,
  //         user: {
  //           uid: user.uid,
  //           email: user.email,
  //           displayName: user.displayName,
  //           emailVerified: user.emailVerified,
  //         },
  //       },
  //     };
  //   } catch (error) {
  //     this.logger.error(`Sign-in failed: ${error.message}`, error.stack);
  //     return this.handleSignInError(error, payload.email);
  //   }
  // }

  private handleSignInError(error: any, email: string): AuthResponse {
    const baseResponse = {
      success: false,
      data: { email },
      statusCode: error.status || 500,
    };

    switch (error.code) {
      case 'auth/user-not-found':
        return {
          ...baseResponse,
          message:
            'No account found with this email address. Please check your email or create a new account.',
          error: 'user_not_found',
          statusCode: 404,
        };

      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return {
          ...baseResponse,
          message:
            'Incorrect password. Please check your password and try again.',
          error: 'invalid_credentials',
          statusCode: 401,
        };

      case 'auth/user-disabled':
        return {
          ...baseResponse,
          message:
            'Your account has been disabled. Please contact support for assistance.',
          error: 'account_disabled',
          statusCode: 403,
        };

      case 'auth/too-many-requests':
        return {
          ...baseResponse,
          message:
            'Too many failed sign-in attempts. Please wait a few minutes before trying again.',
          error: 'too_many_attempts',
          statusCode: 429,
        };

      case 'auth/invalid-email':
        return {
          ...baseResponse,
          message: 'Please enter a valid email address.',
          error: 'invalid_email',
          statusCode: 400,
        };

      case 'auth/network-request-failed':
        return {
          ...baseResponse,
          message:
            'Network error. Please check your internet connection and try again.',
          error: 'network_error',
          statusCode: 503,
        };

      case 'auth/internal-error':
        return {
          ...baseResponse,
          message: 'An internal error occurred. Please try again later.',
          error: 'internal_error',
          statusCode: 500,
        };

      default:
        return {
          ...baseResponse,
          message:
            'Sign-in failed. Please try again or contact support if the problem persists.',
          error: 'unknown_error',
          statusCode: 500,
          details: {
            errorCode: error.code,
            originalMessage: error.message,
          },
        };
    }
  }

  // private async signInWithEmailAndPassword(email: string, password: string) {
  //   const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`;

  //   return axios.post(
  //     url,
  //     {
  //       email,
  //       password,
  //       returnSecureToken: true,
  //     },
  //     {
  //       headers: { 'Content-Type': 'application/json' },
  //       timeout: 5000,
  //     },
  //   );
  // }

  private async getUserFromToken(idToken: string): Promise<AuthResponse> {
    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      const user = await firebaseAdmin.auth().getUser(decodedToken.uid);
      return {
        success: true,
        data: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          isAnonymous: user.providerData.length === 0,
        },
      };
    } catch (error) {
      this.logger.error('Failed to decode token:', error);
      return {
        success: false,
        message: 'Invalid authentication token',
        error: 'invalid_token',
        statusCode: 401,
      };
    }
  }

  async validateRequest(req): Promise<AuthResponse> {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return {
        success: false,
        message:
          'Authentication required. Please provide a Bearer token in the Authorization header. Format: "Authorization: Bearer <your-token>"',
        error: 'missing_authorization_header',
        statusCode: 401,
        details: {
          message: 'Authorization header not provided',
          hint: 'Add "Authorization: Bearer <token>" to your request headers',
        },
      };
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer') {
      return {
        success: false,
        message:
          'Invalid authorization format. Expected "Bearer <token>" but received different format',
        error: 'invalid_authorization_format',
        statusCode: 401,
        details: {
          message: 'Authorization header must start with "Bearer"',
          received: bearer || 'empty',
          expected: 'Bearer',
          hint: 'Use format: "Authorization: Bearer <your-firebase-token>"',
        },
      };
    }

    if (!token) {
      return {
        success: false,
        message:
          'Bearer token is missing. Please provide a valid Firebase ID token',
        error: 'missing_token',
        statusCode: 401,
        details: {
          message: 'Token not provided after Bearer keyword',
          hint: 'Use format: "Authorization: Bearer <your-firebase-token>"',
        },
      };
    }

    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      this.logger.debug(`Token validated for user: ${decodedToken.uid}`);

      // Attach user info to request for use in controllers
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified,
      };

      return {
        success: true,
        data: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          email_verified: decodedToken.email_verified,
        },
        message: 'Token validated successfully',
        statusCode: 200,
      };
    } catch (error) {
      const firebaseErrorMessage = this.getFirebaseErrorMessage(error);
      const statusCode = this.getStatusCodeFromError(error);

      return {
        success: false,
        message: `Token validation failed: ${firebaseErrorMessage}`,
        error: 'token_validation_failed',
        statusCode,
        details: {
          message: firebaseErrorMessage,
          hint: 'Ensure you are using a valid, non-expired Firebase ID token',
        },
      };
    }
  }

  async refreshAuthToken(refreshToken: string): Promise<AuthResponse> {
    this.logger.log('Attempting to refresh auth token');
    try {
      if (!refreshToken) {
        return {
          success: false,
          message: 'Refresh token is required',
          error: 'missing_refresh_token',
          statusCode: 400,
        };
      }

      const response = await this.sendRefreshAuthTokenRequest(refreshToken);

      if (!response.id_token || !response.refresh_token) {
        return {
          success: false,
          message: 'Invalid token refresh response',
          error: 'invalid_refresh_response',
          statusCode: 500,
        };
      }

      this.logger.log('Auth token refreshed successfully');
      return {
        success: true,
        data: {
          idToken: response.id_token,
          refreshToken: response.refresh_token,
          expiresIn: response.expires_in,
        },
        message: 'Token refreshed successfully',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: this.getFirebaseErrorMessage(error),
        error: 'token_refresh_failed',
        statusCode: this.getStatusCodeFromError(error),
        details: { errorCode: error.code },
      };
    }
  }

  private async sendRefreshAuthTokenRequest(refreshToken: string) {
    const url = `https://securetoken.googleapis.com/v1/token?key=${process.env.FIREBASE_API_KEY}`;
    const payload = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };
    return this.sendPostRequest(url, payload);
  }

  private async sendPostRequest(url: string, payload: any) {
    try {
      const response = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
      });
      return response.data;
    } catch (error) {
      if (error.response?.data?.error) {
        const customError = new Error(error.response.data.error.message);
        (customError as any).code = error.response.data.error.message;
        throw customError;
      }
      throw error;
    }
  }



  private async sendEmailVerification(email: string): Promise<AuthResponse> {
    try {
      const user = await firebaseAdmin.auth().getUserByEmail(email);
      const link = await firebaseAdmin
        .auth()
        .generateEmailVerificationLink(email);

      if (!link) {
        return {
          success: false,
          message: 'Failed to generate email verification link',
          error: 'verification_link_failed',
          statusCode: 500,
        };
      }

      this.logger.log(`Sending verification email to ${email}`);

      await this.emailService.sendVerificationEmail({
        email,
        verificationToken: link,
      });

      this.logger.debug(`Email verification link for ${email}: ${link}`);

      return {
        success: true,
        message: 'Verification email sent successfully',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error(`Failed to send verification email: ${error.message}`);
      return {
        success: false,
        message: 'Failed to send verification email',
        error: 'verification_email_failed',
        statusCode: 500,
        details: {
          email,
          errorCode: error.code,
        },
      };
    }
  }

  private isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private isStrongPassword(password: string): boolean {
    return (
      password.length >= 8 && /\d/.test(password) && /[a-zA-Z]/.test(password)
    );
  }

  private getFirebaseErrorMessage(error: any): string {
    if (error.response?.data?.error) {
      const firebaseError = error.response.data.error;
      switch (firebaseError.message) {
        case 'EMAIL_NOT_FOUND':
          return 'No account found with this email address.';
        case 'INVALID_PASSWORD':
          return 'The password you entered is incorrect.';
        case 'USER_DISABLED':
          return 'This account has been disabled. Please contact support.';
        case 'EMAIL_EXISTS':
          return 'This email address is already in use by another account.';
        case 'INVALID_REFRESH_TOKEN':
          return 'Your session has expired. Please sign in again.';
        case 'TOKEN_EXPIRED':
          return 'Your session has expired. Please sign in again.';
        case 'USER_NOT_FOUND':
          return 'User account not found.';
        case 'CREDENTIAL_TOO_OLD_LOGIN_AGAIN':
          return 'Your session is too old. Please sign in again.';
        case 'INVALID_ID_TOKEN':
          return 'Invalid authentication token. Please sign in again.';
        case 'FEDERATED_USER_ID_ALREADY_LINKED':
          return 'This account is already linked to another user.';
        case 'WEAK_PASSWORD':
          return 'Password should be at least 8 characters with a mix of letters and numbers.';
        case 'INVALID_EMAIL':
          return 'Please enter a valid email address.';
        default:
          return (
            firebaseError.message || 'Authentication failed. Please try again.'
          );
      }
    }
    return error.message || 'An unexpected error occurred. Please try again.';
  }

  private getStatusCodeFromError(error: any): number {
    if (error.code) {
      switch (error.code) {
        case 'auth/invalid-email':
        case 'auth/weak-password':
        case 'auth/invalid-password':
          return 400; // Bad Request
        case 'auth/email-already-exists':
        case 'auth/email-already-in-use':
          return 409; // Conflict
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          return 401; // Unauthorized
        case 'auth/user-disabled':
          return 403; // Forbidden
        case 'auth/operation-not-allowed':
        case 'auth/invalid-credential':
        case 'auth/invalid-verification-code':
        case 'auth/invalid-verification-id':
          return 400; // Bad Request
        case 'auth/expired-action-code':
        case 'auth/invalid-action-code':
          return 410; // Gone
        default:
          return 500; // Internal Server Error
      }
    }
    return error.status || 500;
  }






  async linkAccount(
    credentials: CreateUserDto,
  ): Promise<AuthResponse> {
    this.logger.log(`Attempting to link account for anonymous user`);

    try {
      // 1. Verify anonymous token
      const decodedToken = await firebaseAdmin
        .auth()
        .verifyIdToken(credentials.idToken);
      const anonymousUserId = decodedToken.uid;

      // 2. Get anonymous user details
      const anonymousUser = await firebaseAdmin.auth().getUser(anonymousUserId);

      // 3. Ensure user is truly anonymous
      if (anonymousUser.providerData.length > 0 || anonymousUser.email) {
        return {
          success: false,
          message: 'User is not anonymous or already has credentials',
          error: 'user_not_anonymous',
          statusCode: 400,
        };
      }

      // 4. Validate email format
      if (!this.isValidEmail(credentials.email)) {
        return {
          success: false,
          message: 'Invalid email format',
          error: 'invalid_email_format',
          statusCode: 400,
        };
      }

      // 5. Validate password strength
      if (!this.isStrongPassword(credentials.password)) {
        return {
          success: false,
          message:
            'Password must be at least 8 characters long with a mix of letters and numbers',
          error: 'weak_password',
          statusCode: 400,
        };
      }

      // 6. Check if email already exists
      let emailExists = false;
      try {
        await firebaseAdmin.auth().getUserByEmail(credentials.email);
        emailExists = true;
      } catch (error) {
        if (error.code !== 'auth/user-not-found') {
          this.logger.error(`Error checking email existence: ${error.message}`);
          return {
            success: false,
            message: 'Failed to validate email availability',
            error: 'email_validation_failed',
            statusCode: 500,
          };
        }
      }

      if (emailExists) {
        return {
          success: false,
          message: 'This email is already in use by another account',
          error: 'email_already_exists',
          statusCode: 409,
        };
      }

      // 7. Link using Firebase Admin SDK
      const updateRequest = {
        email: credentials.email,
        password: credentials.password,
      };

      const updatedUser = await firebaseAdmin
        .auth()
        .updateUser(anonymousUserId, updateRequest);

      // 8. Generate custom token for the updated user
      const customToken = await firebaseAdmin
        .auth()
        .createCustomToken(anonymousUserId);

      // 9. Exchange custom token for ID token
      const tokenResult = await this.exchangeCustomTokenForIdToken(customToken);
      if (!tokenResult.success) {
        return {
          success: false,
          message: 'Failed to generate new authentication token after linking',
          error: 'token_generation_failed',
          statusCode: 500,
        };
      }

      // 10. Send verification email
      const verificationResult = await this.sendEmailVerification(
        credentials.email,
      );
      if (!verificationResult.success) {
        this.logger.warn(
          `Failed to send verification email: ${verificationResult.message}`,
        );
      }

      this.logger.log(
        `Successfully linked account for user: ${updatedUser.uid}`,
      );

      return {
        success: true,
        data: {
          idToken: tokenResult.data.idToken,
          refreshToken: tokenResult.data.refreshToken,
          expiresIn: tokenResult.data.expiresIn,
          user: {
            uid: updatedUser.uid,
            email: updatedUser.email,
            displayName: updatedUser.displayName || null,
            emailVerified: updatedUser.emailVerified,
            isAnonymous: false,
          },
        },
        message:
          'Account linked successfully. Please verify your email address.',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error(
        `Account linking failed: ${error.message}`,
        error.stack,
      );

      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-exists') {
        return {
          success: false,
          message: 'This email is already in use by another account',
          error: 'email_already_exists',
          statusCode: 409,
        };
      }

      if (error.code === 'auth/invalid-uid') {
        return {
          success: false,
          message: 'Invalid anonymous user session',
          error: 'invalid_session',
          statusCode: 400,
        };
      }

      return {
        success: false,
        message: error.message || 'Account linking failed',
        error: 'account_linking_failed',
        statusCode: error.status || 500,
        details: {
          email: credentials?.email,
          errorCode: error.code,
        },
      };
    }
  }

  // Helper method to exchange custom token for ID token
  private async exchangeCustomTokenForIdToken(
    customToken: string,
  ): Promise<AuthResponse> {
    try {
      const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.FIREBASE_API_KEY}`;

      const response = await axios.post(
        url,
        {
          token: customToken,
          returnSecureToken: true,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        },
      );

      return {
        success: true,
        data: {
          idToken: response.data.idToken,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn,
        },
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error(`Failed to exchange custom token: ${error.message}`);
      return {
        success: false,
        message: 'Failed to generate authentication tokens',
        error: 'token_exchange_failed',
        statusCode: 500,
      };
    }
  }




  private async encrypt(text: string) {
    const cipher = crypto.createCipheriv('aes-256-cbc',
      Buffer.from(this.ENCRYPTION_KEY), this.IV);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

 private async decrypt({
  encryptedData,
  key,
  iv,
}: {
  encryptedData: string;
  key: Buffer;
  iv: Buffer;
}) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}



  async createPendingVerification(
    credentials: CreateUserDto,
  ): Promise<{
    success: boolean;
    message: string;
    verification?: any;
    error?: string;
    statusCode?: number;
  }> {
    const firestore = this.firestoreService.getFirestore();

    try {
      // Validate input
      if (!credentials?.idToken || !credentials?.email || !credentials?.password) {
        return {
          success: false,
          message: 'Missing required fields',
          error: 'missing_fields',
          statusCode: 400,
        };
      }

      // Validate email format
      if (!this.isValidEmail(credentials.email)) {
        return {
          success: false,
          message: 'Invalid email format',
          error: 'invalid_email',
          statusCode: 400,
        };
      }

      // Validate password strength
      if (!this.isStrongPassword(credentials.password)) {
        return {
          success: false,
          message: 'Password must be at least 8 characters with letters and numbers',
          error: 'weak_password',
          statusCode: 400,
        };
      }

      // Verify the anonymous token is still valid
      try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(credentials.idToken);
        if (!decodedToken?.uid) {
          return {
            success: false,
            message: 'Invalid authentication token',
            error: 'invalid_token',
            statusCode: 401,
          };
        }
      } catch (error) {
        return {
          success: false,
          message: 'Authentication token verification failed',
          error: 'token_verification_failed',
          statusCode: 401,
        };
      }

      // Check if email already exists in the system
      try {
        await firebaseAdmin.auth().getUserByEmail(credentials.email);
        return {
          success: false,
          message: 'Email already in use',
          error: 'email_exists',
          statusCode: 409,
        };
      } catch (error) {
        if (error.code !== 'auth/user-not-found') {
          return {
            success: false,
            message: 'Error checking email availability',
            error: 'email_check_failed',
            statusCode: 500,
          };
        }
      }
      const encryptedPassword = await this.encrypt(credentials.password);

      // Create verification record
      const verification = {
        id: uuidv4(),
        idToken: credentials.idToken,
        completed: false,
        email: credentials.email,
        password: encryptedPassword,
        encryptionKey: this.ENCRYPTION_KEY.toString('hex'),
        iv: this.IV.toString('hex'),
        verificationToken: crypto.randomBytes(32).toString('hex'),
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour expiration
      };

      // Store in Firestore
      await firestore
        .collection('pendingVerifications')
        .doc(verification.id)
        .set(verification);

      // Send verification email
      const emailResponse = await this.emailService.sendPendingVerificationEmail({
        email: verification.email,
        verificationToken: verification.verificationToken,
        verificationId: verification.id,
      });

      if (!emailResponse.success) {
        // Clean up the verification record if email failed
        await firestore.collection('pendingVerifications').doc(verification.id).delete();

        return {
          success: false,
          message: 'Failed to send verification email',
          error: 'email_send_failed',
          statusCode: 500,
        };
      }

      return {
        success: true,
        message: 'Pending verification created successfully',
        verification: {
          id: verification.id,
          email: verification.email,
          expiresAt: verification.expiresAt,
        },
      };

    } catch (error) {
      this.logger.error('Failed to create pending verification', {
        error: error.message,
        stack: error.stack,
        email: credentials?.email,
      });

      return {
        success: false,
        message: 'Internal server error during verification creation',
        error: 'internal_error',
        statusCode: 500,
      };
    }
  }


  async completeVerification(
    verificationId: string,
    verificationToken: string,
  ): Promise<{
    success?: boolean;
    message?: string;
    verification?: any;
    error?: string;
    statusCode?: number;
  }> {
    const logger = new Logger('AuthService');
    const firestore = this.firestoreService.getFirestore();

    try {
      // Validate input parameters
      if (!verificationId || !verificationToken) {
        logger.warn('Missing verification parameters', {
          verificationId,
          hasToken: !!verificationToken,
        });
        return {
          success: false,
          message: 'Missing verification parameters',
          error: 'missing_parameters',
          statusCode: 400,
        };
      }

      // Get the verification document
      const doc = await firestore
        .collection('pendingVerifications')
        .doc(verificationId)
        .get();

      // Check if document exists
      if (!doc.exists) {
        logger.warn('Verification request not found', { verificationId });
        return {
          success: false,
          message: 'Verification request not found or expired',
          error: 'verification_not_found',
          statusCode: 404,
        };
      }

      const verification = doc.data();

      // Validate token
      if (verification?.verificationToken !== verificationToken || verification?.completed === true) {
        // set the completed flag to true

        logger.warn('Invalid verification token attempt', {
          verificationId,
          expectedToken: verification?.verificationToken?.substring(0, 5) + '...', // Log partial token for security
          receivedToken: verificationToken?.substring(0, 5) + '...',
        });
        return {
          success: false,
          message: 'Invalid verification token',
          error: 'invalid_token',
          statusCode: 401,
        };
      }

      // Check expiration
      if (new Date(verification?.expiresAt) < new Date()) {
        logger.warn('Expired verification link', {
          verificationId,
          expiresAt: verification?.expiresAt,
        });
        await doc.ref.delete(); // Clean up expired verification
        return {
          success: false,
          message: 'Verification link has expired',
          error: 'link_expired',
          statusCode: 410,
        };
      }
      await doc.ref.update({ completed: true });

        const decpassword = await  this.decrypt({
    encryptedData: verification.password,
    key: Buffer.from(verification.encryptionKey, 'hex'),
    iv: Buffer.from(verification.iv, 'hex')
  });

      logger.log('Verification successful', { verificationId, email: verification?.email });
      const credentials = {
        email: verification.email,
        idToken: verification.idToken,
        password: decpassword,
      };

      const response = await this.linkAccount(credentials);

      return response;

    } catch (error) {
      logger.error('Verification process failed', {
        error: error.message,
        stack: error.stack,
        verificationId,
      });

      return {
        success: false,
        message: 'Internal server error during verification',
        error: 'internal_error',
        statusCode: 500,
      };
    }
  }




  async cleanupVerification(verificationId: string): Promise<void> {
    const firestore = this.firestoreService.getFirestore();

    await firestore
      .collection('pendingVerifications')
      .doc(verificationId)
      .delete();
  }
}
