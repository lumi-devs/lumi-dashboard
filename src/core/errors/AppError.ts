export type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "GUILD_NOT_FOUND"
  | "MODULE_UNAVAILABLE"
  | "VALIDATION_FAILED"
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE"
  | "CONTRACT_MISMATCH"
  | "RPC_COMMUNICATION_ERROR"
  | "INTERNAL_ERROR";

export interface AppErrorDetails {
  [key: string]: unknown;
}

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly status: number;
  public readonly details?: AppErrorDetails;

  constructor(
    message: string,
    code: AppErrorCode = "INTERNAL_ERROR",
    status = 500,
    details?: AppErrorDetails,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      status: this.status,
      details: this.details,
    };
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required", details?: AppErrorDetails) {
    super(message, "UNAUTHORIZED", 401, details);
    this.name = "UnauthorizedError";
  }
}

export class PermissionDeniedError extends AppError {
  constructor(message = "Permission denied", details?: AppErrorDetails) {
    super(message, "FORBIDDEN", 403, details);
    this.name = "PermissionDeniedError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details?: AppErrorDetails) {
    super(message, "NOT_FOUND", 404, details);
    this.name = "NotFoundError";
  }
}

export class GuildNotFoundError extends NotFoundError {
  constructor(guildId: string, details?: AppErrorDetails) {
    super(`Guild '${guildId}' not found`, { guildId, ...details });
    this.name = "GuildNotFoundError";
  }
}

export class ModuleUnavailableError extends AppError {
  constructor(moduleName: string, message?: string, details?: AppErrorDetails) {
    super(
      message ?? `Module '${moduleName}' is unavailable or disabled`,
      "MODULE_UNAVAILABLE",
      400,
      { moduleName, ...details },
    );
    this.name = "ModuleUnavailableError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: AppErrorDetails) {
    super(message, "VALIDATION_FAILED", 400, details);
    this.name = "ValidationError";
  }
}

export class RateLimitedError extends AppError {
  constructor(message = "Rate limit exceeded", details?: AppErrorDetails) {
    super(message, "RATE_LIMITED", 429, details);
    this.name = "RateLimitedError";
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service unavailable", details?: AppErrorDetails) {
    super(message, "SERVICE_UNAVAILABLE", 503, details);
    this.name = "ServiceUnavailableError";
  }
}

export class ContractMismatchError extends AppError {
  constructor(message = "RPC contract mismatch", details?: AppErrorDetails) {
    super(message, "CONTRACT_MISMATCH", 502, details);
    this.name = "ContractMismatchError";
  }
}

export class RpcCommunicationError extends AppError {
  constructor(
    message = "Failed to communicate with RPC service",
    details?: AppErrorDetails,
  ) {
    super(message, "RPC_COMMUNICATION_ERROR", 502, details);
    this.name = "RpcCommunicationError";
  }
}
