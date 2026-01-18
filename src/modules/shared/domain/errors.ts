export type AppErrorType =
  | "AuthError"
  | "ValidationError"
  | "NotFoundError"
  | "PermissionDeniedError"
  | "ConflictError"
  | "UnknownError";

export class AppError extends Error {
  type: AppErrorType;
  context?: Record<string, unknown>;

  constructor(
    type: AppErrorType,
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.type = type;
    this.context = context;
  }
}

export const toAuthError = (message: string, context?: Record<string, unknown>) =>
  new AppError("AuthError", message, context);

export const toUnknownError = (
  message: string,
  context?: Record<string, unknown>
) => new AppError("UnknownError", message, context);
