import { type InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={[
        "w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-ink",
        "placeholder:text-ink-soft/70 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
