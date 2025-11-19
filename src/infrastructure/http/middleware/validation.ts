/**
 * Input Validation Middleware
 * Validates HTTP request headers, content-type, and request structure
 */

import { Request, Response, NextFunction } from 'express';
import { RegisterUserResponseBuilder } from '../dto/RegisterUserResponse';

export class ValidationMiddleware {
  static readonly validateContentType = (req: Request, res: Response, next: NextFunction): void => {
    if (this.shouldValidateContent(req.method)) {
      const contentType = req.headers['content-type'];

      if (!this.isValidContentType(contentType)) {
        res
          .status(415)
          .json(
            RegisterUserResponseBuilder.validationError(['Content-Type must be application/json'])
          );
        return;
      }
    }

    next();
  };

  static readonly validateContentLength = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
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

  static readonly validateRequestStructure = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (this.shouldValidateContent(req.method)) {
      if (!this.isValidBodyStructure(req.body)) {
        res
          .status(400)
          .json(
            RegisterUserResponseBuilder.validationError([this.getBodyValidationError(req.body)])
          );
        return;
      }
    }

    next();
  };

  private static shouldValidateContent(method: string): boolean {
    return method === 'POST' || method === 'PUT' || method === 'PATCH';
  }

  private static isValidContentType(contentType: string | undefined): boolean {
    return !!contentType && contentType.includes('application/json');
  }

  private static isValidBodyStructure(body: unknown): boolean {
    return body !== undefined && body !== null && typeof body === 'object' && !Array.isArray(body);
  }

  private static getBodyValidationError(body: unknown): string {
    if (body === undefined || body === null) {
      return 'Request body is required';
    }

    if (typeof body !== 'object') {
      return 'Request body must be a JSON object';
    }

    return 'Invalid request body structure';
  }
}
