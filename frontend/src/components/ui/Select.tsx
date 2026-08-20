import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

type SelectProps = ComponentProps<"select">;

export default function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-border bg-paper px-4 py-3 text-ink outline-none transition focus:border-brand focus:ring-1 focus:ring-brand",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
