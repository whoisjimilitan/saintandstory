import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "DATABASE_ERROR"
  | "AUTH_ERROR"
  | "UNKNOWN_ERROR";

export type ApiErrorSource = "prisma" | "google" | "crm" | "validation" | "auth" | "unknown";

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  source: ApiErrorSource;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string | ApiError;
}

/**
 * Success response - maintains backward compatibility with frontend
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Error response - maps to expected error format for frontend
 */
export function errorResponse(
  code: ApiErrorCode,
  message: string,
  source: ApiErrorSource,
  status: number
) {
  // For frontend compatibility, return simple error message
  // Frontend only reads error.message from catch blocks
  return NextResponse.json(
    { error: message },
    { status }
  );
}

/**
 * Handle 400 validation errors
 */
export function validationError(message: string) {
  return errorResponse("VALIDATION_ERROR", message, "validation", 400);
}

/**
 * Handle 404 not found
 */
export function notFoundError(message: string = "Not found") {
  return errorResponse("NOT_FOUND", message, "unknown", 404);
}

/**
 * Handle 500 database errors (safely)
 */
export function databaseError(source: "prisma" | "google" | "crm" = "prisma") {
  // Never expose raw database error to client
  const message = "Database operation failed";
  return errorResponse("DATABASE_ERROR", message, source, 500);
}

/**
 * Handle 403 auth errors
 */
export function authError(message: string = "Forbidden") {
  return errorResponse("AUTH_ERROR", message, "auth", 403);
}
