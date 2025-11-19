/**
 * OpenAPI Schema Validator
 * Provides validation helpers for API responses against OpenAPI 3.1.0 schema
 */

export class OpenAPIValidator {
  constructor(private debugMode: boolean = false) {
    if (this.debugMode) {
      console.log('OpenAPI validator initialized (simplified mode)');
    }
  }

  /**
   * Validate user response against OpenAPI schema
   */
  validateUserResponse(data: any): { valid: boolean; errors?: string[] } {
    // Enhanced validation with stricter type checking and email format validation
    const requiredFields = ['success', 'data'];
    const errors: string[] = [];

    if (this.debugMode) {
      console.log('OpenAPI validator: validating response', data);
    }

    // Check required fields
    for (const field of requiredFields) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Check data types with stricter validation
    if (typeof data.success !== 'boolean') {
      errors.push('success must be boolean');
    }

    if (!data.data || typeof data.data !== 'object') {
      errors.push('data must be object');
    }

    // Check timestamp - puede estar en root o en data.createdAt
    const hasTimestamp = typeof data.timestamp === 'string' ||
                         (data.data && typeof data.data.createdAt === 'string');
    if (!hasTimestamp) {
      errors.push('timestamp must be string (in root or data.createdAt)');
    }

    // Check data structure with enhanced validation
    if (data.data) {
      if (!data.data.userId) {
        errors.push('data.userId is required');
      }

      if (!data.data.email) {
        errors.push('data.email is required');
      }

      // Enhanced: Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (data.data.email && typeof data.data.email === 'string' && !emailRegex.test(data.data.email)) {
        errors.push('data.email must be valid email format');
      }
    }

    if (this.debugMode) {
      console.log('OpenAPI validator: validation result', {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
      });
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Validate that response has proper structure for error responses
   */
  validateErrorStructure(data: any): { valid: boolean; errors?: string[] } {
    const requiredFields = ['success', 'timestamp', 'path'];
    const errors: string[] = [];

    // Check required fields
    for (const field of requiredFields) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Check data types
    if (typeof data.success !== 'boolean') {
      errors.push('success must be boolean');
    }

    if (typeof data.timestamp !== 'string') {
      errors.push('timestamp must be string');
    }

    if (typeof data.path !== 'string') {
      errors.push('path must be string');
    }

    // Check timestamp format (ISO 8601)
    if (data.timestamp) {
      const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      if (!timestampRegex.test(data.timestamp)) {
        errors.push('timestamp must be valid ISO 8601 format');
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}