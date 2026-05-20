"use client";

import { PageShell } from "@/components/layout/page-shell";
import { ReputationCenter } from "@/components/reputation";

/** Bandeja completa de reseñas — misma experiencia que el centro sin límite. */
export default function ResenasPage() {
  return (
    <PageShell>
      <ReputationCenter showSidebar={false} maxReviews={120} />
    </PageShell>
  );
}
