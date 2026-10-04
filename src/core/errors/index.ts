export {
  AppError,
  UnauthorizedError,
  PermissionDeniedError,
  NotFoundError,
  GuildNotFoundError,
  ModuleUnavailableError,
  ValidationError,
  RateLimitedError,
  ServiceUnavailableError,
  ContractMismatchError,
  RpcCommunicationError,
} from "./AppError";
export type { AppErrorCode, AppErrorDetails } from "./AppError";
