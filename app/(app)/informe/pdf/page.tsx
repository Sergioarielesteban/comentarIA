"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { copy } from "@/lib/copy/es";
import { placeholders } from "@/lib/placeholders";

export default function InformePdfPage() {
  const { place, analysis } = useApp();

  useEffect(() => {
    // Auto-print opcional: descomentar cuando el diseño esté cerrado
    // window.print();
  }, []);

  return (
    <div className="mx-auto max-w-2xl bg-white p-8 text-black print:p-12">
      <div className="no-print mb-6 flex gap-3">
        <Link href="/ajustes" className="text-sm text-terracotta underline">
          ← Volver
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="text-sm font-medium text-terracotta"
        >
          Imprimir / Guardar PDF
        </button>
      </div>

      <header className="border-b border-neutral-200 pb-4">
        <p className="text-xs uppercase tracking-widest text-neutral-500">
          {copy.brand.name} · {copy.brand.mirror}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold">
          {place?.nombre || "Restaurante"}
        </h1>
        <p className="text-sm text-neutral-600">{place?.direccion}</p>
      </header>

      {analysis ? (
        <div className="mt-6 space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-semibold">Resumen semanal</h2>
            <p className="mt-2">{analysis.briefing}</p>
          </section>
          <section>
            <h2 className="font-semibold">{copy.espejo.positive}</h2>
            <p className="mt-2">{analysis.datoPositivo}</p>
          </section>
          <section>
            <h2 className="font-semibold">{copy.insights.strengths}</h2>
            <ul className="mt-2 list-disc pl-5">
              {analysis.temasPositivos.map((t) => (
                <li key={t.tema}>
                  {t.tema} ({t.menciones}) — {t.accion}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-semibold">{copy.insights.weaknesses}</h2>
            <ul className="mt-2 list-disc pl-5">
              {analysis.temasNegativos.map((t) => (
                <li key={t.tema}>
                  {t.tema} [{t.impacto}] — {t.accion}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-semibold">{copy.espejo.title}</h2>
            {analysis.espejo.map((e) => (
              <div key={e.tema} className="mt-3 border-t border-neutral-100 pt-3">
                <p className="font-medium">{e.tema}</p>
                <p>
                  <strong>{copy.espejo.owner}:</strong> {e.dueno}
                </p>
                <p>
                  <strong>{copy.espejo.clients}:</strong> {e.clientes}
                </p>
                <p className="text-neutral-600">{e.consejo}</p>
              </div>
            ))}
          </section>
        </div>
      ) : (
        <p className="mt-8 text-neutral-600">
          No hay análisis disponible. Genera uno desde Insights.
        </p>
      )}

      <footer className="mt-12 border-t border-neutral-200 pt-4 text-xs text-neutral-500">
        {copy.brand.footer} · {placeholders.reactPdfExport}
      </footer>
    </div>
  );
}
