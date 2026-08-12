import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full resize-y rounded-xl border border-border px-4 py-3 text-ink outline-none transition focus:border-brand focus:ring-1 focus:ring-brand",
        className
      )}
      {...props}
    />
  );
}
