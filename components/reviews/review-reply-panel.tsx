"use client";

import { useEffect, useState } from "react";
import type { ReviewRow } from "@/lib/types/reviews-platform";

type ReplyTone = "cercano" | "formal" | "breve";
type DraftStatus = "none" | "draft" | "approved";

const TONES: { id: ReplyTone; label: string }[] = [
  { id: "cercano", label: "Cercano" },
  { id: "formal", label: "Formal" },
  { id: "breve", label: "Breve" },
];

interface Draft {
  id: string;
  suggested_reply: string;
  status?: string;
}

export function ReviewReplyPanel({
  review,
  open,
  onClose,
  onSaved,
}: {
  review: ReviewRow | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [text, setText] = useState("");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [tone, setTone] = useState<ReplyTone>("cercano");
  const [status, setStatus] = useState<DraftStatus>("none");
  const [loading, setLoading] = useState<
    "suggest" | "save" | "approve" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setText("");
      setDraftId(null);
      setStatus("none");
      setError(null);
      setTone("cercano");
    }
  }, [open, review?.id]);

  if (!open || !review) return null;

  async function suggest() {
    setLoading("suggest");
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${review!.id}/suggest-reply`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tone }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message ?? "No se pudo sugerir respuesta.");
      }
      const draft = data.draft as Draft;
      setDraftId(draft.id);
      setText(draft.suggested_reply);
      setStatus("draft");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al sugerir.");
    } finally {
      setLoading(null);
    }
  }

  async function saveDraft(approve = false) {
    if (!text.trim()) return;
    setLoading(approve ? "approve" : "save");
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${review!.id}/save-draft`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          replyText: text.trim(),
          draftId,
          status: approve ? "approved" : "draft",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message ?? "No se pudo guardar.");
      }
      const draft = data.draft as Draft;
      setDraftId(draft.id);
      setStatus(approve ? "approved" : "draft");
      if (approve) onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#2A211B]/40 p-3 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reply-panel-title"
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[28px] border border-border bg-card p-6 shadow-[0_24px_60px_-20px_rgba(28,26,24,0.35)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-terracotta">
              Respuesta asistida por IA
            </p>
            <h2
              id="reply-panel-title"
              className="mt-2 font-display text-2xl font-semibold text-ink"
            >
              {review.author_name ?? "Cliente"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm text-ink-soft hover:bg-cream"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-4 rounded-[18px] border border-border/80 bg-cream/50 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Reseña original
          </p>
          <p className="mt-2 text-sm leading-6 text-ink">{review.text}</p>
        </div>

        <div className="mt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            Tono de respuesta
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id)}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  tone === t.id
                    ? "bg-ink text-cream"
                    : "border border-border bg-card text-ink-soft",
                ].join(" ")}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <label className="mt-5 block">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            Respuesta sugerida
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="Genera o escribe tu respuesta…"
            className="mt-2 w-full resize-none rounded-[20px] border border-border bg-cream/50 px-4 py-3 text-sm leading-6 text-ink outline-none focus:border-terracotta/40"
          />
        </label>

        {status !== "none" ? (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-olive">
            Estado:{" "}
            {status === "approved" ? "Aprobada (sin publicar)" : "Borrador generado"}
          </p>
        ) : (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-mustard">
            Sin responder
          </p>
        )}

        {error ? <p className="mt-3 text-sm text-terracotta">{error}</p> : null}

        <p className="mt-3 text-xs leading-5 text-ink-soft">
          La publicación en Google estará disponible pronto. Por ahora puedes
          guardar y aprobar borradores.
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => void suggest()}
            disabled={loading !== null}
            className="rounded-full border border-border bg-cream px-4 py-3 text-sm font-semibold text-ink hover:bg-cream-muted disabled:opacity-50"
          >
            {loading === "suggest" ? "Generando…" : "Regenerar"}
          </button>
          <button
            type="button"
            onClick={() => void saveDraft(false)}
            disabled={loading !== null || !text.trim()}
            className="rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold text-ink disabled:opacity-50"
          >
            {loading === "save" ? "Guardando…" : "Guardar borrador"}
          </button>
          <button
            type="button"
            onClick={() => void saveDraft(true)}
            disabled={loading !== null || !text.trim()}
            className="sm:col-span-2 rounded-full bg-terracotta px-4 py-3 text-sm font-semibold text-white hover:bg-terracotta-dark disabled:opacity-50"
          >
            {loading === "approve" ? "Aprobando…" : "Aprobar respuesta"}
          </button>
        </div>
      </div>
    </div>
  );
}
