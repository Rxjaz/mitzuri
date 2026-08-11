import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full resize-y rounded-xl border border-stone-300 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-500",
        className
      )}
      {...props}
    />
  );
}
