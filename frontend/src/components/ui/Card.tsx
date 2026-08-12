import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export default function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-paper p-6 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
