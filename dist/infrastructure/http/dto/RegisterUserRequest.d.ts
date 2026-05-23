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
export declare class RegisterUserRequestValidator {
    private static readonly EMAIL_REGEX;
    private static readonly MAX_EMAIL_LENGTH;
    private static readonly MAX_NAME_LENGTH;
    private static readonly MIN_PASSWORD_LENGTH;
    private static readonly ALLOWED_FIELDS;
    static validate(input: unknown): ValidationResult;
    private static isValidObject;
    private static collectValidationErrors;
    private static validateRequiredFields;
    private static validateFieldTypes;
    private static validateFieldValues;
    private static validateEmailField;
    private static validateNameField;
    private static validatePasswordField;
    private static validateRoleField;
    private static validateEmail;
    private static validateName;
    private static validatePassword;
    private static validateRole;
    private static validateUnexpectedFields;
    private static createSanitizedData;
    static sanitize(input: RegisterUserRequest): RegisterUserRequest;
}
//# sourceMappingURL=RegisterUserRequest.d.ts.map