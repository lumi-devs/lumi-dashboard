"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { buttonVariants } from "./button-variants";
import { cn } from "#/lib/utils";

export function Pagination({
  page,
  pageSize,
  total,
  itemLabel = "results",
  pageParam = "page",
  className,
}: {
  page: number;
  pageSize: number;
  total: number;
  itemLabel?: string;
  pageParam?: string;
  className?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (total === 0) return null;

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  function hrefFor(target: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (target <= 1) params.delete(pageParam);
    else params.set(pageParam, String(target));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2",
        className,
      )}
    >
      <p className="text-[14px] text-fg-muted">
        <span className="tabular text-fg">
          {first}–{last}
        </span>{" "}
        of <span className="tabular text-fg">{total}</span> {itemLabel}
      </p>

      {pageCount > 1 ? (
        <div className="flex items-center gap-2">
          <PageStep
            href={hrefFor(page - 1)}
            disabled={page <= 1}
            label="Previous page"
          >
            <ChevronLeft aria-hidden />
            Previous
          </PageStep>
          <span className="font-display text-[14px] tracking-[0.02em] text-fg-muted">
            Page <span className="tabular text-fg">{page}</span> of{" "}
            <span className="tabular text-fg">{pageCount}</span>
          </span>
          <PageStep
            href={hrefFor(page + 1)}
            disabled={page >= pageCount}
            label="Next page"
          >
            Next
            <ChevronRight aria-hidden />
          </PageStep>
        </div>
      ) : null}
    </nav>
  );
}

/**
 * For the keyset-paginated lists (audit, cases, appeals, config history) —
 * there is no page count, only "load more" via `nextCursor` and a reset back
 * to the first, cursor-less request.
 */
export function CursorPagination({
  cursor,
  nextCursor,
  total,
  itemLabel = "results",
  cursorParam = "cursor",
  className,
}: {
  cursor: string;
  nextCursor: string | null;
  total?: number;
  itemLabel?: string;
  cursorParam?: string;
  className?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!cursor && !nextCursor) return null;

  function hrefFor(target: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (target) params.set(cursorParam, target);
    else params.delete(cursorParam);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2",
        className,
      )}
    >
      <p className="text-[14px] text-fg-muted">
        {total !== undefined ? (
          <>
            <span className="tabular text-fg">{total}</span> {itemLabel} total
          </>
        ) : (
          `More ${itemLabel} available`
        )}
      </p>
      <div className="flex items-center gap-2">
        {cursor ? (
          <Link
            href={hrefFor(null)}
            aria-label="Back to first page"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
            scroll={false}
          >
            <RotateCcw aria-hidden />
            Back to first page
          </Link>
        ) : null}
        {nextCursor ? (
          <Link
            href={hrefFor(nextCursor)}
            aria-label="Next page"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
            scroll={false}
          >
            Next
            <ChevronRight aria-hidden />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

function PageStep({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const className = buttonVariants({ variant: "secondary", size: "sm" });
  if (disabled) {
    return (
      <span aria-hidden className={cn(className, "opacity-45")}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className={className} scroll={false}>
      {children}
    </Link>
  );
}
