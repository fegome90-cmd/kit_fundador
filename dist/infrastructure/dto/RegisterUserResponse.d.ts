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
export declare class RegisterUserResponseBuilder {
    static success(userData: UserData): RegisterUserResponse;
    static validationError(errors: string[]): ApiError;
    static conflictError(message?: string): ApiError;
    static internalError(): ApiError;
}
//# sourceMappingURL=RegisterUserResponse.d.ts.map