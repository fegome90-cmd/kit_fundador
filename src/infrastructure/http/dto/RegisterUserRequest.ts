/**
 * Register User Request DTO
 * Input validation and sanitization for user registration endpoint
 */

export interface RegisterUserRequest {
  email: string;
  name: string;
  password: string;
  role?: 'user' | 'admin';
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
  private static readonly MIN_PASSWORD_LENGTH = 8;
  private static readonly ALLOWED_FIELDS = ['email', 'name', 'password', 'role'];

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
    if (data.role !== undefined && typeof data.role !== 'string')
      errors.push('Role must be a string');
    return errors;
  }

  private static validateFieldValues(data: Record<string, unknown>): string[] {
    const errors: string[] = [];

    this.validateEmailField(data, errors);
    this.validateNameField(data, errors);
    this.validatePasswordField(data, errors);
    this.validateRoleField(data, errors);

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

  private static validateRoleField(data: Record<string, unknown>, errors: string[]): void {
    if (typeof data.role === 'string') {
      const roleValidation = this.validateRole(data.role);
      errors.push(...roleValidation);
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

    if (password.length < this.MIN_PASSWORD_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_PASSWORD_LENGTH} characters long`);
    } else if (password.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }

    return errors;
  }

  private static validateRole(role: string): string[] {
    const errors: string[] = [];
    if (!['user', 'admin'].includes(role)) {
      errors.push('Role must be either "user" or "admin"');
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
      role: data.role ? (data.role as 'user' | 'admin') : 'user',
    };
  }

  static sanitize(input: RegisterUserRequest): RegisterUserRequest {
    return {
      email: input.email.trim().toLowerCase(),
      name: input.name.trim(),
      password: input.password,
      role: input.role || 'user',
    };
  }
}
