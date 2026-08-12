import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

//`cn` solo concatena, no resuelve conflictos de Tailwind, asi que cada
//variante trae su propio set de clases en vez de sobreescribir la base
const VARIANTS: Record<ButtonVariant, string> = {
  //la accion principal del producto lleva el color del producto
  primary: "bg-brand text-paper hover:bg-brand-strong",
  secondary: "border border-border bg-paper text-ink hover:bg-surface",
  //el rojo aqui es semantico, no de marca
  danger: "border border-danger bg-paper text-danger hover:bg-danger/5",
};

export default function Button({
  children,
  className,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
