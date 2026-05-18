import { type HTMLAttributes } from "react";

export function Card({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "rounded-2xl border border-border bg-card/82 p-4 shadow-[0_1px_12px_var(--shadow)]",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
