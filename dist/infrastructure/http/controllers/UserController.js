/**
 * User HTTP Controller
 * Handles HTTP requests for user-related operations following Clean Architecture
 */
import { buildRegisterUserAccountCommand } from '../../../application/use-cases/register-user-account/RegisterUserAccountCommand';
import { UserAccountAlreadyExistsError } from '../../../application/ports/UserAccountRepository';
import { RegisterUserRequestValidator } from '../dto/RegisterUserRequest';
import { RegisterUserResponseBuilder } from '../dto/RegisterUserResponse';
export class UserController {
    registerUserHandler;
    constructor(registerUserHandler) {
        this.registerUserHandler = registerUserHandler;
    }
    async registerUser(req, res) {
        const validation = this.validateRequest(req.body);
        if (!validation.isValid || !validation.data) {
            const errors = validation.errors || [];
            res.status(400).json(RegisterUserResponseBuilder.validationError(errors));
            return;
        }
        try {
            const { email, name, password, role } = validation.data;
            const normalizedRole = role === 'admin' ? 'admin' : 'user';
            const command = buildRegisterUserAccountCommand({
                email,
                name,
                password,
                role: normalizedRole,
            });
            const result = await this.registerUserHandler.execute(command);
            this.sendSuccessResponse(res, result);
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    validateRequest(body) {
        const validation = RegisterUserRequestValidator.validate(body);
        if (!validation.isValid || !validation.data) {
            return { isValid: false, errors: validation.errors };
        }
        return {
            isValid: true,
            data: {
                email: validation.data.email,
                name: validation.data.name,
                password: validation.data.password,
                role: validation.data.role || 'user',
            },
        };
    }
    sendSuccessResponse(res, result) {
        const role = result.userSnapshot.role === 'guest' ? 'user' : result.userSnapshot.role;
        const userData = {
            userId: result.userSnapshot.id,
            email: result.userSnapshot.email,
            name: result.userSnapshot.name,
            role: role,
        };
        res.status(201).json(RegisterUserResponseBuilder.success(userData));
    }
    handleError(res, error) {
        if (error instanceof UserAccountAlreadyExistsError) {
            res.status(409).json(RegisterUserResponseBuilder.conflictError(error.message));
            return;
        }
        // Log unexpected errors (no console statements for production-grade code)
        this.logError('Registration error', error);
        res.status(500).json(RegisterUserResponseBuilder.internalError());
    }
    logError(message, error) {
        // Log error without sensitive information
        // In production, this would go to a proper logging service
        const errorInfo = {
            timestamp: new Date().toISOString(),
            level: 'error',
            message,
            type: error?.constructor?.name || 'UnknownError',
        };
        // Use process.stderr to avoid linting issues for error logging
        process.stderr.write(JSON.stringify(errorInfo) + '\n');
    }
}
//# sourceMappingURL=UserController.js.map