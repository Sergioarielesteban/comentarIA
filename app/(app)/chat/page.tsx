"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STORAGE_KEYS } from "@/lib/constants";
import {
  getChatCountToday,
  incrementChatCount,
  isChatLimitReached,
} from "@/lib/chat/daily-limit";
import { copy } from "@/lib/copy/es";
import type { ChatMessage } from "@/lib/types";

function loadHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.chatHistory);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(messages: ChatMessage[]) {
  localStorage.setItem(STORAGE_KEYS.chatHistory, JSON.stringify(messages));
}

export default function ChatPage() {
  const { place, analysis } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadHistory());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading || isChatLimitReached()) return;

    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        place,
        analysis,
        messages: next,
      }),
    });

    setLoading(false);
    incrementChatCount();

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const assistant: ChatMessage = {
        role: "assistant",
        content:
          (err as { error?: { message?: string } })?.error?.message ||
          copy.errors.generic,
      };
      const updated = [...next, assistant];
      setMessages(updated);
      saveHistory(updated);
      return;
    }

    const data = await res.json();
    const reply =
      (data as { content?: { text?: string }[] })?.content?.[0]?.text ||
      "No pude generar respuesta.";
    const assistant: ChatMessage = { role: "assistant", content: reply };
    const updated = [...next, assistant];
    setMessages(updated);
    saveHistory(updated);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  const limitReached = isChatLimitReached();

  return (
    <PageShell title={copy.chat.title} subtitle={place?.nombre}>
      <div className="mb-3 flex flex-wrap gap-2">
        {copy.chat.suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => send(s)}
            className="rounded-full border border-border bg-card px-3 py-1 text-xs text-ink-soft hover:border-terracotta/40"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="min-h-[50vh] space-y-3">
        {messages.map((m, i) => (
          <div
            key={`${m.role}-${i}`}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={[
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-terracotta text-white"
                  : "border border-border bg-card text-ink",
              ].join(" ")}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading ? (
          <p className="text-sm text-ink-soft">Consultor pensando…</p>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {limitReached ? (
        <p className="mb-3 text-center text-sm text-ink-soft">
          {copy.chat.limitReached} ({getChatCountToday()}/30)
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={copy.chat.placeholder}
          disabled={limitReached || loading}
        />
        <Button type="submit" disabled={limitReached || loading || !input.trim()}>
          →
        </Button>
      </form>
    </PageShell>
  );
}
