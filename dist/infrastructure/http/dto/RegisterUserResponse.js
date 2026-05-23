/**
 * Register User Response DTO
 * Standardized response format for user registration endpoint
 */
export class RegisterUserResponseBuilder {
    static success(userData) {
        return {
            success: true,
            message: 'User registered successfully',
            data: {
                ...userData,
                createdAt: new Date().toISOString(),
            },
        };
    }
    static validationError(errors) {
        return {
            success: false,
            message: 'Validation failed',
            errors,
            timestamp: new Date().toISOString(),
            path: '/api/users/register',
        };
    }
    static conflictError(message = 'User already exists') {
        return {
            success: false,
            message,
            errors: [message],
            timestamp: new Date().toISOString(),
            path: '/api/users/register',
        };
    }
    static internalError() {
        return {
            success: false,
            message: 'Internal server error',
            errors: ['An unexpected error occurred'],
            timestamp: new Date().toISOString(),
            path: '/api/users/register',
        };
    }
}
//# sourceMappingURL=RegisterUserResponse.js.map