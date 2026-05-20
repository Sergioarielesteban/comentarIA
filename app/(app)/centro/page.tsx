"use client";

import { PageShell } from "@/components/layout/page-shell";
import { ReputationCenter } from "@/components/reputation";

export default function CentroReputacionPage() {
  return (
    <PageShell>
      <ReputationCenter showSidebar />
    </PageShell>
  );
}
