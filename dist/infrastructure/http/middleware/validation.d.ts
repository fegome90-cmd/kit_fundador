/**
 * Input Validation Middleware
 * Validates HTTP request headers, content-type, and request structure
 */
import { Request, Response, NextFunction } from 'express';
export declare class ValidationMiddleware {
    static readonly validateContentType: (req: Request, res: Response, next: NextFunction) => void;
    static readonly validateContentLength: (req: Request, res: Response, next: NextFunction) => void;
    static readonly validateRequestStructure: (req: Request, res: Response, next: NextFunction) => void;
    private static shouldValidateContent;
    private static isValidContentType;
    private static isValidBodyStructure;
    private static getBodyValidationError;
}
//# sourceMappingURL=validation.d.ts.map