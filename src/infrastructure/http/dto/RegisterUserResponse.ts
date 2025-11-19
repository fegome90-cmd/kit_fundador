/**
 * Register User Response DTO
 * Standardized response format for user registration endpoint
 */

export interface RegisterUserResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    createdAt: string;
  };
  errors?: string[];
}

export interface ApiError {
  success: false;
  message: string;
  errors: string[];
  timestamp: string;
  path: string;
}

export interface UserData {
  userId: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export class RegisterUserResponseBuilder {
  static success(userData: UserData): RegisterUserResponse {
    return {
      success: true,
      message: 'User registered successfully',
      data: {
        ...userData,
        createdAt: new Date().toISOString(),
      },
    };
  }

  static validationError(errors: string[]): ApiError {
    return {
      success: false,
      message: 'Validation failed',
      errors,
      timestamp: new Date().toISOString(),
      path: '/api/users/register',
    };
  }

  static conflictError(message: string = 'User already exists'): ApiError {
    return {
      success: false,
      message,
      errors: [message],
      timestamp: new Date().toISOString(),
      path: '/api/users/register',
    };
  }

  static internalError(): ApiError {
    return {
      success: false,
      message: 'Internal server error',
      errors: ['An unexpected error occurred'],
      timestamp: new Date().toISOString(),
      path: '/api/users/register',
    };
  }
}
