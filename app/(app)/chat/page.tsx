import { Suspense } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { ChatClient } from "@/app/(app)/chat/chat-client";
import { Spinner } from "@/components/ui/spinner";

export default function ChatPage() {
  return (
    <PageShell>
      <Suspense fallback={<Spinner label="Cargando consultor…" />}>
        <ChatClient />
      </Suspense>
    </PageShell>
  );
}
