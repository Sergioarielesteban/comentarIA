"use client";

import type { ReactNode } from "react";

type Tone = "terracotta" | "olive" | "mustard";

const toneText: Record<Tone, string> = {
  terracotta: "text-terracotta",
  olive: "text-olive",
  mustard: "text-mustard",
};

export function ExecutiveMetricCard({
  label,
  value,
  detail,
  trend,
  tone = "terracotta",
  children,
  footer,
}: {
  label: string;
  value: string;
  detail?: string;
  trend?: { value: string; positive?: boolean };
  tone?: Tone;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <article className="flex min-h-[168px] flex-col rounded-[24px] border border-border bg-card/88 p-5 transition duration-300 hover:-translate-y-0.5 hover:bg-card">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
        {label}
      </p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p
          className={[
            "font-display text-5xl font-semibold leading-none",
            toneText[tone],
          ].join(" ")}
        >
          {value}
        </p>
        {trend ? (
          <span
            className={[
              "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
              trend.positive
                ? "bg-olive/12 text-olive"
                : "bg-mustard/12 text-mustard",
            ].join(" ")}
          >
            {trend.value}
          </span>
        ) : null}
      </div>
      {detail ? (
        <p className="mt-2 text-sm leading-5 text-ink-soft">{detail}</p>
      ) : null}
      {children ? <div className="mt-4 flex-1">{children}</div> : null}
      {footer ? <div className="mt-4">{footer}</div> : null}
    </article>
  );
}
