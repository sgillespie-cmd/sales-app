import { NextResponse } from "next/server";

export type ErrorResponse = {
  data: null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function ensureErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unexpected server error";
}

export const formatUnknownError = ensureErrorMessage;

export function errorResponse(
  code: string,
  message: string,
  status = 500,
  details?: unknown,
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      data: null,
      error: { code, message, details },
    },
    { status },
  );
}

export function badRequest(message: string, details?: unknown): NextResponse<ErrorResponse> {
  return errorResponse("BAD_REQUEST", message, 400, details);
}

export function unauthorized(message = "Authentication required"): NextResponse<ErrorResponse> {
  return errorResponse("UNAUTHORIZED", message, 401);
}

export function notFound(message = "Resource not found"): NextResponse<ErrorResponse> {
  return errorResponse("NOT_FOUND", message, 404);
}

export function internalServerError(
  message = "Unexpected server error",
  details?: unknown,
): NextResponse<ErrorResponse> {
  return errorResponse("INTERNAL_SERVER_ERROR", message, 500, details);
}

export function validationError(message: string, details?: unknown): NextResponse<ErrorResponse> {
  return errorResponse("VALIDATION_ERROR", message, 400, details);
}

export function validationErrorResponse(
  message: string,
  details?: unknown,
): NextResponse<ErrorResponse> {
  return validationError(message, details);
}

export function apiSuccess<T>(
  data: T,
  status = 200,
): NextResponse<{ data: T; error: null }> {
  return NextResponse.json({ data, error: null }, { status });
}

export function apiErrorResponse(
  code: string,
  message: string,
  status = 500,
  details?: unknown,
): NextResponse<ErrorResponse> {
  return errorResponse(code, message, status, details);
}

export function apiError(
  code: string,
  message: string,
  status = 500,
  details?: unknown,
): NextResponse<ErrorResponse> {
  return errorResponse(code, message, status, details);
}

export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  return internalServerError(ensureErrorMessage(error));
}

export function mapUnknownError(
  error: unknown,
  defaultMessage = "Unexpected server error",
): NextResponse<ErrorResponse> {
  return internalServerError(defaultMessage, ensureErrorMessage(error));
}

// Backward-compatible aliases
export const internalError = internalServerError;
export const apiBadRequest = badRequest;
export const apiUnauthorized = unauthorized;
export const apiNotFound = notFound;
export const apiInternalError = internalServerError;
