/**
 * Register User Request DTO
 * Input validation and sanitization for user registration endpoint
 */
export class RegisterUserRequestValidator {
    static EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    static MAX_EMAIL_LENGTH = 255;
    static MAX_NAME_LENGTH = 100;
    static MIN_PASSWORD_LENGTH = 8;
    static ALLOWED_FIELDS = ['email', 'name', 'password', 'role'];
    static validate(input) {
        if (!this.isValidObject(input)) {
            return { isValid: false, errors: ['Request body must be a valid JSON object'] };
        }
        const errors = this.collectValidationErrors(input);
        if (errors.length > 0) {
            return { isValid: false, errors };
        }
        const sanitizedData = this.createSanitizedData(input);
        return { isValid: true, data: sanitizedData, errors: [] };
    }
    static isValidObject(input) {
        return (input !== null && input !== undefined && typeof input === 'object' && !Array.isArray(input));
    }
    static collectValidationErrors(data) {
        const errors = [];
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
    static validateRequiredFields(data) {
        const errors = [];
        if (!data.email)
            errors.push('Email is required');
        if (!data.name)
            errors.push('Name is required');
        if (!data.password)
            errors.push('Password is required');
        return errors;
    }
    static validateFieldTypes(data) {
        const errors = [];
        if (data.email && typeof data.email !== 'string')
            errors.push('Email must be a string');
        if (data.name && typeof data.name !== 'string')
            errors.push('Name must be a string');
        if (data.password && typeof data.password !== 'string')
            errors.push('Password must be a string');
        if (data.role !== undefined && typeof data.role !== 'string')
            errors.push('Role must be a string');
        return errors;
    }
    static validateFieldValues(data) {
        const errors = [];
        this.validateEmailField(data, errors);
        this.validateNameField(data, errors);
        this.validatePasswordField(data, errors);
        this.validateRoleField(data, errors);
        return errors;
    }
    static validateEmailField(data, errors) {
        if (typeof data.email === 'string') {
            const emailValidation = this.validateEmail(data.email);
            errors.push(...emailValidation);
        }
    }
    static validateNameField(data, errors) {
        if (typeof data.name === 'string') {
            const nameValidation = this.validateName(data.name);
            errors.push(...nameValidation);
        }
    }
    static validatePasswordField(data, errors) {
        if (typeof data.password === 'string') {
            const passwordValidation = this.validatePassword(data.password);
            errors.push(...passwordValidation);
        }
    }
    static validateRoleField(data, errors) {
        if (typeof data.role === 'string') {
            const roleValidation = this.validateRole(data.role);
            errors.push(...roleValidation);
        }
    }
    static validateEmail(email) {
        const errors = [];
        const trimmedEmail = email.trim().toLowerCase();
        if (trimmedEmail.length === 0) {
            errors.push('Email cannot be empty');
        }
        else if (trimmedEmail.length > this.MAX_EMAIL_LENGTH) {
            errors.push(`Email must not exceed ${this.MAX_EMAIL_LENGTH} characters`);
        }
        else if (!this.EMAIL_REGEX.test(trimmedEmail)) {
            errors.push('Email must be a valid email address');
        }
        return errors;
    }
    static validateName(name) {
        const errors = [];
        const trimmedName = name.trim();
        if (trimmedName.length === 0) {
            errors.push('Name cannot be empty');
        }
        else if (trimmedName.length > this.MAX_NAME_LENGTH) {
            errors.push(`Name must not exceed ${this.MAX_NAME_LENGTH} characters`);
        }
        return errors;
    }
    static validatePassword(password) {
        const errors = [];
        if (password.length < this.MIN_PASSWORD_LENGTH) {
            errors.push(`Password must be at least ${this.MIN_PASSWORD_LENGTH} characters long`);
        }
        else if (password.length > 128) {
            errors.push('Password must not exceed 128 characters');
        }
        return errors;
    }
    static validateRole(role) {
        const errors = [];
        if (!['user', 'admin'].includes(role)) {
            errors.push('Role must be either "user" or "admin"');
        }
        return errors;
    }
    static validateUnexpectedFields(data) {
        const errors = [];
        const unexpectedFields = Object.keys(data).filter((key) => !this.ALLOWED_FIELDS.includes(key));
        if (unexpectedFields.length > 0) {
            errors.push(`Unexpected fields: ${unexpectedFields.join(', ')}`);
        }
        return errors;
    }
    static createSanitizedData(data) {
        return {
            email: data.email.trim().toLowerCase(),
            name: data.name.trim(),
            password: data.password,
            role: data.role ? data.role : 'user',
        };
    }
    static sanitize(input) {
        return {
            email: input.email.trim().toLowerCase(),
            name: input.name.trim(),
            password: input.password,
            role: input.role || 'user',
        };
    }
}
//# sourceMappingURL=RegisterUserRequest.js.map