/**
 * Input Validation Middleware
 * Validates HTTP request headers, content-type, and request structure
 */
import { RegisterUserResponseBuilder } from '../dto/RegisterUserResponse';
export class ValidationMiddleware {
    static validateContentType = (req, res, next) => {
        if (this.shouldValidateContent(req.method)) {
            const contentType = req.headers['content-type'];
            if (!this.isValidContentType(contentType)) {
                res
                    .status(415)
                    .json(RegisterUserResponseBuilder.validationError(['Content-Type must be application/json']));
                return;
            }
        }
        next();
    };
    static validateContentLength = (req, res, next) => {
        const contentLength = Number.parseInt(req.headers['content-length'] || '0', 10);
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (contentLength > maxSize) {
            res
                .status(413)
                .json(RegisterUserResponseBuilder.validationError(['Request payload too large']));
            return;
        }
        next();
    };
    static validateRequestStructure = (req, res, next) => {
        if (this.shouldValidateContent(req.method)) {
            if (!this.isValidBodyStructure(req.body)) {
                res
                    .status(400)
                    .json(RegisterUserResponseBuilder.validationError([this.getBodyValidationError(req.body)]));
                return;
            }
        }
        next();
    };
    static shouldValidateContent(method) {
        return method === 'POST' || method === 'PUT' || method === 'PATCH';
    }
    static isValidContentType(contentType) {
        return !!contentType && contentType.includes('application/json');
    }
    static isValidBodyStructure(body) {
        return body !== undefined && body !== null && typeof body === 'object' && !Array.isArray(body);
    }
    static getBodyValidationError(body) {
        if (body === undefined || body === null) {
            return 'Request body is required';
        }
        if (typeof body !== 'object') {
            return 'Request body must be a JSON object';
        }
        return 'Invalid request body structure';
    }
}
//# sourceMappingURL=validation.js.map