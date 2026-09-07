import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  label: string;
}

export function IconButton({
  label,
  className,
  children,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-border bg-surface text-foreground transition-colors duration-[var(--transition-fast)] hover:bg-surface-secondary",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
