export class AuthError extends Error {
  public readonly statusCode: number;
  public readonly details: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    details: Record<string, any> = {},
  ) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.details = details;

    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }
  }

  toJSON() {
    return {
      success: false,
      error: this.name,
      message: this.message,
      statusCode: this.statusCode,
      ...(Object.keys(this.details).length > 0 && { details: this.details }),
    };
  }

  static fromFirebaseError(
    error: any,
    defaultMessage: string = 'Authentication failed',
  ): AuthError {
    let message = defaultMessage;
    let statusCode = 500;
    const details: Record<string, any> = {};

    if (error.code) {
      details.errorCode = error.code;

      // Map Firebase error codes to messages and status codes
      switch (error.code) {
        case 'auth/invalid-email':
          message = 'Invalid email address format';
          statusCode = 400;
          break;
        case 'auth/weak-password':
          message =
            'Password should be at least 8 characters with a mix of letters and numbers';
          statusCode = 400;
          break;
        case 'auth/email-already-in-use':
          message = 'Email address is already in use by another account';
          statusCode = 409;
          break;
        case 'auth/user-not-found':
          message = 'No user found with this email address';
          statusCode = 404;
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password';
          statusCode = 401;
          break;
        case 'auth/user-disabled':
          message = 'This account has been disabled';
          statusCode = 403;
          break;
        case 'auth/operation-not-allowed':
          message = 'This authentication method is not allowed';
          statusCode = 403;
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later';
          statusCode = 429;
          break;
        case 'auth/invalid-verification-code':
        case 'auth/invalid-verification-id':
          message = 'Invalid verification code';
          statusCode = 400;
          break;
        case 'auth/expired-action-code':
          message = 'The action code has expired';
          statusCode = 410;
          break;
      }
    }

    if (error.response?.data?.error?.message) {
      details.firebaseMessage = error.response.data.error.message;
    }

    return new AuthError(message, statusCode, details);
  }
}
