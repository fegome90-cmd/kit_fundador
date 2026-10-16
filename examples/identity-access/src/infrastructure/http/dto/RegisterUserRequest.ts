/**
 * Public registration DTO. Privileged properties are rejected.
 */
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_BYTES } from '../../../domain/value-objects/Password';

export interface RegisterUserRequest {
  email: string;
  name: string;
  password: string;
}

export interface ValidationResult {
  isValid: boolean;
  data?: RegisterUserRequest;
  errors?: string[];
}

export class RegisterUserRequestValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MAX_EMAIL_LENGTH = 255;
  private static readonly MAX_NAME_LENGTH = 100;
  private static readonly ALLOWED_FIELDS = ['email', 'name', 'password'];

  static validate(input: unknown): ValidationResult {
    if (!this.isValidObject(input)) {
      return { isValid: false, errors: ['Request body must be a valid JSON object'] };
    }

    const errors = this.collectValidationErrors(input as Record<string, unknown>);

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    const sanitizedData = this.createSanitizedData(input as Record<string, unknown>);
    return { isValid: true, data: sanitizedData, errors: [] };
  }

  private static isValidObject(input: unknown): boolean {
    return (
      input !== null && input !== undefined && typeof input === 'object' && !Array.isArray(input)
    );
  }

  private static collectValidationErrors(data: Record<string, unknown>): string[] {
    const errors: string[] = [];
    const fieldErrors = this.validateRequiredFields(data);
    errors.push(...fieldErrors);

    if (fieldErrors.length === 0) {
      const typeErrors = this.validateFieldTypes(data);
      errors.push(...typeErrors);

      if (typeErrors.length === 0) {
        const valueErrors = this.validateFieldValues(data);
        errors.push(...valueErrors);
      }
    }

    const unexpectedErrors = this.validateUnexpectedFields(data);
    errors.push(...unexpectedErrors);

    return errors;
  }

  private static validateRequiredFields(data: Record<string, unknown>): string[] {
    const errors: string[] = [];
    if (!data.email) errors.push('Email is required');
    if (!data.name) errors.push('Name is required');
    if (!data.password) errors.push('Password is required');
    return errors;
  }

  private static validateFieldTypes(data: Record<string, unknown>): string[] {
    const errors: string[] = [];
    if (data.email && typeof data.email !== 'string') errors.push('Email must be a string');
    if (data.name && typeof data.name !== 'string') errors.push('Name must be a string');
    if (data.password && typeof data.password !== 'string')
      errors.push('Password must be a string');
    return errors;
  }

  private static validateFieldValues(data: Record<string, unknown>): string[] {
    const errors: string[] = [];

    this.validateEmailField(data, errors);
    this.validateNameField(data, errors);
    this.validatePasswordField(data, errors);

    return errors;
  }

  private static validateEmailField(data: Record<string, unknown>, errors: string[]): void {
    if (typeof data.email === 'string') {
      const emailValidation = this.validateEmail(data.email);
      errors.push(...emailValidation);
    }
  }

  private static validateNameField(data: Record<string, unknown>, errors: string[]): void {
    if (typeof data.name === 'string') {
      const nameValidation = this.validateName(data.name);
      errors.push(...nameValidation);
    }
  }

  private static validatePasswordField(data: Record<string, unknown>, errors: string[]): void {
    if (typeof data.password === 'string') {
      const passwordValidation = this.validatePassword(data.password);
      errors.push(...passwordValidation);
    }
  }

  private static validateEmail(email: string): string[] {
    const errors: string[] = [];
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedEmail.length === 0) {
      errors.push('Email cannot be empty');
    } else if (trimmedEmail.length > this.MAX_EMAIL_LENGTH) {
      errors.push(`Email must not exceed ${this.MAX_EMAIL_LENGTH} characters`);
    } else if (!this.EMAIL_REGEX.test(trimmedEmail)) {
      errors.push('Email must be a valid email address');
    }

    return errors;
  }

  private static validateName(name: string): string[] {
    const errors: string[] = [];
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      errors.push('Name cannot be empty');
    } else if (trimmedName.length > this.MAX_NAME_LENGTH) {
      errors.push(`Name must not exceed ${this.MAX_NAME_LENGTH} characters`);
    }

    return errors;
  }

  private static validatePassword(password: string): string[] {
    const errors: string[] = [];

    if (password.trim().length < MIN_PASSWORD_LENGTH) {
      errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
    } else if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
      errors.push(`Password must not exceed ${MAX_PASSWORD_BYTES} UTF-8 bytes`);
    }

    return errors;
  }

  private static validateUnexpectedFields(data: Record<string, unknown>): string[] {
    const errors: string[] = [];
    const unexpectedFields = Object.keys(data).filter((key) => !this.ALLOWED_FIELDS.includes(key));
    if (unexpectedFields.length > 0) {
      errors.push(`Unexpected fields: ${unexpectedFields.join(', ')}`);
    }
    return errors;
  }

  private static createSanitizedData(data: Record<string, unknown>): RegisterUserRequest {
    return {
      email: (data.email as string).trim().toLowerCase(),
      name: (data.name as string).trim(),
      password: data.password as string,
    };
  }

  static sanitize(input: RegisterUserRequest): RegisterUserRequest {
    return {
      email: input.email.trim().toLowerCase(),
      name: input.name.trim(),
      password: input.password,
    };
  }
}
