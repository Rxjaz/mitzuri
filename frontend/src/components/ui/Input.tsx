import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-border px-4 py-3 text-ink outline-none transition focus:border-brand focus:ring-1 focus:ring-brand",
        className
      )}
      {...props}
    />
  );
}
