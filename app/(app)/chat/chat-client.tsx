"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/components/providers/app-provider";
import {
  ConsultantPromptChip,
  PremiumSectionTitle,
} from "@/components/premium/reputation-components";
import { copy } from "@/lib/copy/es";
import type { ChatMessage } from "@/lib/types";

const MAX_INPUT_LENGTH = 1000;
const HISTORY_SIZE = 20;

export function ChatClient() {
  const { place } = useApp();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prefilledRef = useRef(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !prefilledRef.current) {
      prefilledRef.current = true;
      setInput(q);
    }
  }, [searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const clean = text.trim().slice(0, MAX_INPUT_LENGTH);
    if (!clean || loading || limitReached) return;

    const userMsg: ChatMessage = { role: "user", content: clean };
    const next = [...messages, userMsg].slice(-HISTORY_SIZE);
    setMessages(next);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: next }),
    });

    setLoading(false);

    if (res.status === 429) {
      setLimitReached(true);
      setMessages([
        ...next,
        { role: "assistant", content: copy.chat.limitReached },
      ]);
      return;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg =
        (err as { error?: { message?: string } })?.error?.message ||
        copy.errors.generic;
      setMessages([...next, { role: "assistant", content: msg }]);
      return;
    }

    const data = await res.json();
    const reply =
      (data as { content?: { text?: string }[] })?.content?.[0]?.text ||
      "No pude generar respuesta.";
    setMessages([...next, { role: "assistant", content: reply }]);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr]">
      <aside className="space-y-6">
        <PremiumSectionTitle
          eyebrow="Consultor IA"
          title="Habla con tu consultor de reputación"
          body={`Preguntas con contexto real de ${place?.nombre || "tu restaurante"} y sus reseñas.`}
        />
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
            Preguntas rápidas
          </p>
          <div className="flex flex-wrap gap-2">
            {copy.chat.suggestions.map((s) => (
              <ConsultantPromptChip key={s} onClick={() => send(s)}>
                {s}
              </ConsultantPromptChip>
            ))}
          </div>
        </div>
        {messages.length > 0 ? (
          <div className="rounded-[24px] border border-border bg-card/70 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
              Historial de consultas
            </p>
            <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm text-ink-soft">
              {messages
                .filter((m) => m.role === "user")
                .slice(-5)
                .map((m, i) => (
                  <li key={i} className="line-clamp-2">
                    · {m.content}
                  </li>
                ))}
            </ul>
          </div>
        ) : null}
        <div className="rounded-[24px] border border-border bg-card/70 p-5">
          <p className="font-display text-2xl font-semibold leading-none text-ink">
            Sesión segura
          </p>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            {copy.chat.serverLimitNotice}
          </p>
        </div>
      </aside>

      <section className="rounded-[28px] border border-border bg-card/78 p-4 sm:p-6">
        <div className="min-h-[58vh] space-y-4">
          {!messages.length ? (
            <div className="flex min-h-[42vh] flex-col justify-center rounded-[24px] bg-cream-muted/35 p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-terracotta">
                Sesión preparada
              </p>
              <h2 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-none text-ink">
                Empieza por el punto que más te inquieta esta semana.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-ink-soft">
                El consultor prioriza riesgos, detecta oportunidades en carta y
                convierte reseñas en decisiones concretas.
              </p>
            </div>
          ) : null}
          {messages.map((m, i) => (
            <div
              key={`${m.role}-${i}`}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={[
                  "max-w-[88%] rounded-[22px] px-4 py-3 text-sm leading-6",
                  m.role === "user"
                    ? "bg-ink text-cream"
                    : "border border-border bg-cream text-ink",
                ].join(" ")}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
              Consultor pensando...
            </p>
          ) : null}
          <div ref={bottomRef} />
        </div>

        {limitReached ? (
          <p className="mb-3 text-center text-sm text-ink-soft">
            {copy.chat.limitReached}
          </p>
        ) : null}

        <form
          onSubmit={onSubmit}
          className="mt-5 flex items-center gap-2 rounded-full border border-border bg-cream px-4 py-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
            placeholder={copy.chat.placeholder}
            disabled={limitReached || loading}
            maxLength={MAX_INPUT_LENGTH}
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-ink outline-none placeholder:text-ink-soft/70"
          />
          <button
            type="submit"
            disabled={limitReached || loading || !input.trim()}
            aria-label="Enviar pregunta"
            className="grid h-10 w-10 place-items-center rounded-full bg-terracotta text-white transition hover:bg-terracotta-dark disabled:opacity-45"
          >
            <span aria-hidden>→</span>
          </button>
        </form>
      </section>
    </div>
  );
}
