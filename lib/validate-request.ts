/**
 * Request validation layer
 * Validates input BEFORE any database queries
 * All validation failures return 400 Bad Request
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

/**
 * Validate UUID format
 * Returns true if valid, false otherwise
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validate required string field
 */
export function isValidString(
  value: any,
  minLength: number = 1,
  maxLength: number = 10000
): boolean {
  if (typeof value !== "string") return false;
  if (value.length < minLength) return false;
  if (value.length > maxLength) return false;
  return true;
}

/**
 * Validate required number field
 */
export function isValidNumber(value: any, min?: number, max?: number): boolean {
  if (typeof value !== "number") return false;
  if (isNaN(value)) return false;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

/**
 * Validate boolean field
 */
export function isValidBoolean(value: any): boolean {
  return typeof value === "boolean";
}

/**
 * Validate request has required fields
 */
export function validateRequired(
  body: any,
  requiredFields: string[]
): ValidationResult {
  const errors: ValidationError[] = [];

  for (const field of requiredFields) {
    if (!(field in body) || body[field] === null || body[field] === undefined) {
      errors.push({
        field,
        message: `${field} is required`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate UUID in request
 */
export function validateUUID(id: string, fieldName: string = "id"): ValidationResult {
  if (!isValidUUID(id)) {
    return {
      valid: false,
      errors: [
        {
          field: fieldName,
          message: `${fieldName} must be a valid UUID`,
        },
      ],
    };
  }
  return { valid: true };
}

/**
 * Format validation errors for response
 */
export function formatValidationError(errors: ValidationError[]): string {
  if (errors.length === 1) {
    return errors[0].message;
  }
  return `Validation failed: ${errors.map((e) => e.message).join(", ")}`;
}
