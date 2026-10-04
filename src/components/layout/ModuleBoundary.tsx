"use client";

import { useContext, type ReactNode } from "react";
import { AlertTriangle, Lock, RefreshCw } from "lucide-react";
import { GuildContext } from "#/core/guild/GuildContext";
import { getModuleById } from "#/modules/registry";
import { Alert } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";
import { SkeletonRows } from "#/components/skeletons";
import {
  AppError,
  ModuleUnavailableError,
  PermissionDeniedError,
  UnauthorizedError,
} from "#/core/errors/AppError";
import type { Capability } from "#/domain/permissions/Capability";

export interface ModuleBoundaryProps {
  moduleId?: string;
  capability?: Capability;
  isLoading?: boolean;
  error?: Error | AppError | null;
  fallback?: ReactNode;
  onRetry?: () => void;
  className?: string;
  children: ReactNode;
}

export function ModuleBoundary({
  moduleId,
  capability,
  isLoading = false,
  error = null,
  fallback,
  onRetry,
  className,
  children,
}: ModuleBoundaryProps) {
  const guildCtx = useContext(GuildContext);

  // 1. Check Disabled / Not Installed
  const isModuleUnavailableByError =
    error instanceof ModuleUnavailableError ||
    (error instanceof AppError && error.code === "MODULE_UNAVAILABLE");

  const registeredModule = moduleId ? getModuleById(moduleId) : undefined;
  const isModuleDisabledByContext =
    Boolean(guildCtx && registeredModule?.isAvailable && !registeredModule.isAvailable(guildCtx));

  if (isModuleUnavailableByError || isModuleDisabledByContext) {
    const moduleName = registeredModule?.name ?? moduleId ?? "This module";
    return (
      <div className={className} data-slot="module-boundary-disabled">
        <Alert variant="warning" icon={AlertTriangle}>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-fg">{moduleName} is not enabled</span>
            <span>
              This module is currently disabled or unavailable for this server. Enable it in the module settings to continue.
            </span>
          </div>
        </Alert>
      </div>
    );
  }

  // 2. Check Permission Denied / No Permission
  const isForbiddenByError =
    error instanceof PermissionDeniedError ||
    error instanceof UnauthorizedError ||
    (error instanceof AppError &&
      (error.code === "FORBIDDEN" || error.code === "UNAUTHORIZED"));

  const isForbiddenByContext = Boolean(
    guildCtx && capability && !guildCtx.hasCapability(capability),
  );

  if (isForbiddenByError || isForbiddenByContext) {
    return (
      <div className={className} data-slot="module-boundary-permission-denied">
        <Alert variant="danger" icon={Lock}>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-fg">Access Denied</span>
            <span>
              You do not have the required permissions
              {capability ? ` (${capability})` : ""} to view or configure this module.
            </span>
          </div>
        </Alert>
      </div>
    );
  }

  // 3. Check Loading state
  if (isLoading) {
    if (fallback) {
      return <div className={className}>{fallback}</div>;
    }
    return (
      <div
        className={className}
        aria-busy
        role="status"
        aria-label="Loading module content"
        data-slot="module-boundary-loading"
      >
        <SkeletonRows rows={3} />
      </div>
    );
  }

  // 4. Check Error state (with retry)
  if (error) {
    const handleRetry = () => {
      if (onRetry) {
        onRetry();
      } else if (typeof window !== "undefined") {
        window.location.reload();
      }
    };

    return (
      <div className={className} data-slot="module-boundary-error">
        <Alert variant="danger" icon={AlertTriangle}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-fg">Failed to load module</span>
              <span className="text-[13px] text-fg-muted">
                {error.message || "An unexpected error occurred while loading this section."}
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRetry}
              className="self-start sm:self-auto shrink-0"
            >
              <RefreshCw className="mr-1.5 size-3.5" aria-hidden />
              Retry
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  // 5. Available (render children)
  return <div className={className}>{children}</div>;
}
