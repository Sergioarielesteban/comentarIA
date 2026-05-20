"use client";

import Link from "next/link";
import type { BrandVoiceProfile } from "@/lib/types/reviews-platform";
import { copy } from "@/lib/copy/es";

const LABELS: Record<string, string> = {
  cercano: "Cercano",
  profesional: "Profesional",
  media: "Media",
  alta: "Alta",
  baja: "Baja",
  corta: "Corta",
  larga: "Larga",
  moderado: "Moderados",
  frecuente: "Frecuentes",
  ninguno: "Ninguno",
};

function label(value: string | null | undefined) {
  if (!value) return "—";
  return LABELS[value] ?? value;
}

export function BrandVoiceCard({
  profile,
}: {
  profile: BrandVoiceProfile | null;
}) {
  if (!profile) {
    return (
      <article className="rounded-[24px] border border-dashed border-border bg-card/60 p-6 text-center">
        <p className="text-sm text-ink-soft">{copy.brandVoice.empty}</p>
        <Link
          href="/conectar-google"
          className="mt-4 inline-flex rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-white"
        >
          Conectar Google Business
        </Link>
      </article>
    );
  }

  const rows = [
    { key: "Tono", value: label(profile.tone) },
    { key: "Formalidad", value: label(profile.formality) },
    { key: "Longitud", value: label(profile.response_length) },
    { key: "Emojis", value: label(profile.emoji_usage) },
    {
      key: "Firma",
      value: profile.signature?.trim() || "Sin firma definida",
    },
  ];

  return (
    <article className="rounded-[24px] border border-border bg-card/88 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta">
        {copy.brandVoice.detected}
      </p>
      <h3 className="mt-3 font-display text-3xl font-semibold text-ink">
        {copy.brandVoice.title}
      </h3>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.key}
            className="rounded-[16px] border border-border/80 bg-cream/50 px-4 py-3"
          >
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
              {row.key}
            </dt>
            <dd className="mt-1 font-semibold text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
      <Link
        href="/voz"
        className="mt-5 inline-flex rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-terracotta/30"
      >
        {copy.brandVoice.edit}
      </Link>
    </article>
  );
}
