import { type HTMLAttributes } from "react";

export function Card({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "rounded-2xl border border-border bg-card p-4 shadow-[0_8px_24px_var(--shadow)]",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
