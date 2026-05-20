"use client";

import Link from "next/link";
import { ConsultantPromptChip } from "@/components/premium/reputation-components";
import { copy } from "@/lib/copy/es";

export function ConsultantCard({
  onAsk,
}: {
  onAsk?: (question: string) => void;
}) {
  return (
    <article className="rounded-[24px] border border-border bg-card/88 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta">
        {copy.chat.title}
      </p>
      <h3 className="mt-3 font-display text-3xl font-semibold leading-none text-ink">
        Pregunta con contexto real
      </h3>
      <p className="mt-3 text-sm leading-6 text-ink-soft">
        {copy.chat.serverLimitNotice}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {copy.chat.suggestions.map((s) =>
          onAsk ? (
            <ConsultantPromptChip key={s} onClick={() => onAsk(s)}>
              {s}
            </ConsultantPromptChip>
          ) : (
            <Link
              key={s}
              href={`/chat?q=${encodeURIComponent(s)}`}
              className="rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-ink transition hover:border-terracotta/30"
            >
              {s}
            </Link>
          ),
        )}
      </div>
      <Link
        href="/chat"
        className="mt-5 inline-flex rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-white hover:bg-terracotta-dark"
      >
        Abrir consultor
      </Link>
    </article>
  );
}
