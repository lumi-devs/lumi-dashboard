"use client"

import * as React from "react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"

import { cn } from "#/lib/utils"

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  align = "start",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        collisionPadding={8}
        avoidCollisions={true}
        className={cn(
          "z-50 min-w-48 max-h-[var(--radix-dropdown-menu-content-available-height,320px)] overflow-x-hidden overflow-y-auto rounded-panel border border-border bg-surface p-1.5 text-fg shadow-e3",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/dropdown-menu-item relative flex cursor-pointer items-center gap-2 rounded-control px-2.5 py-1.5 text-[14px] text-fg outline-none select-none transition-colors duration-fast",
        "hover:bg-surface-hover hover:text-fg focus:bg-surface-hover focus:text-fg",
        "data-[variant=destructive]:text-danger hover:data-[variant=destructive]:bg-danger-soft hover:data-[variant=destructive]:text-danger focus:data-[variant=destructive]:bg-danger-soft focus:data-[variant=destructive]:text-danger",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-fg-subtle group-hover/dropdown-menu-item:[&_svg]:text-fg group-focus/dropdown-menu-item:[&_svg]:text-fg",
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2.5 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-fg-subtle uppercase data-inset:pl-8",
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1.5 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator };
