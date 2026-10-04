"use client";

import { useState, useRef, useId } from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { cn } from "#/lib/utils";

interface MultiSelectOption {
  id: string;
  label: string;
}

interface MultiSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export function MultiSelect({
  value,
  onChange,
  options,
  placeholder = "Search…",
  disabled,
  "aria-label": ariaLabel,
}: MultiSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const available = options.filter(
    (o) => !value.includes(o.id) && o.label.toLowerCase().includes(query.toLowerCase()),
  );

  function select(id: string) {
    onChange([...value, id]);
    setQuery("");
    inputRef.current?.focus();
  }

  function remove(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && query === "" && value.length > 0) {
      const last = value[value.length - 1];
      if (last !== undefined) remove(last);
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
    if (e.key === "Enter" && available.length > 0) {
      e.preventDefault();
      const first = available[0];
      if (first !== undefined) select(first.id);
    }
  }

  const selectedLabels = value.map((id) => {
    const opt = options.find((o) => o.id === id);
    return { id, label: opt?.label ?? id };
  });

  return (
    <PopoverPrimitive.Root open={open && available.length > 0} onOpenChange={setOpen}>
      <div className="relative flex w-full flex-col gap-1.5">
        <PopoverPrimitive.Anchor asChild>
          <div
            className={cn(
              "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-control border border-border bg-surface px-2.5 py-1 text-sm transition-colors",
              "focus-within:border-accent focus-within:ring-1 focus-within:ring-accent-secondary",
            )}
            onClick={() => inputRef.current?.focus()}
          >
            {selectedLabels.map(({ id, label }) => (
              <span
                key={id}
                className="flex items-center gap-1 rounded-[6px] border border-border bg-surface-hover px-2 py-0.5 text-xs text-fg"
              >
                {label}
                <button
                  type="button"
                  aria-label={`Remove ${label}`}
                  disabled={disabled}
                  className="ml-0.5 text-fg-subtle hover:text-fg"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(id);
                  }}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              type="text"
              className="min-w-[6rem] flex-1 bg-transparent text-[14px] text-fg outline-none placeholder:text-fg-subtle"
              placeholder={selectedLabels.length === 0 ? placeholder : ""}
              aria-label={ariaLabel}
              aria-controls={listId}
              aria-expanded={open}
              aria-autocomplete="list"
              role="combobox"
              disabled={disabled}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
            />
          </div>
        </PopoverPrimitive.Anchor>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            side="bottom"
            align="start"
            sideOffset={4}
            collisionPadding={8}
            avoidCollisions={true}
            onOpenAutoFocus={(e) => e.preventDefault()}
            className={cn(
              "z-50 w-[var(--radix-popover-trigger-width)] min-w-44 max-h-[var(--radix-popover-content-available-height,260px)]",
              "overflow-hidden rounded-control border border-border bg-surface shadow-e3",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            )}
          >
            <ul
              id={listId}
              role="listbox"
              className="max-h-56 overflow-y-auto p-1"
            >
              {available.map((opt) => (
                <li
                  key={opt.id}
                  role="option"
                  aria-selected={false}
                  className="flex cursor-pointer items-center justify-between rounded-control px-2.5 py-1.5 text-[14px] text-fg transition-colors hover:bg-surface-hover"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    select(opt.id);
                  }}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </div>
    </PopoverPrimitive.Root>
  );
}
