import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

//`ComponentProps` en vez de `InputHTMLAttributes` porque incluye `ref`: en
//React 19 la ref es una prop normal y la galeria la necesita para enfocar el
//campo de texto alternativo de la imagen recien subida
type InputProps = ComponentProps<"input">;

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
