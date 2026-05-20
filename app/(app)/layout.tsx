"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppProvider, useApp } from "@/components/providers/app-provider";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Spinner } from "@/components/ui/spinner";

function AppGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, place, userId } = useApp();

  useEffect(() => {
    if (loading || !userId) return;
    const onOnboarding = pathname === "/onboarding";
    if (!place && !onOnboarding) {
      router.replace("/onboarding");
    } else if (place && onOnboarding) {
      router.replace("/insights");
    }
  }, [loading, place, pathname, router, userId]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg items-center justify-center">
        <Spinner label="Cargando tu espacio…" />
      </div>
    );
  }

  const hideNav = pathname === "/onboarding" || pathname.startsWith("/informe");

  return (
    <div className="min-h-dvh bg-cream">
      <div className="mx-auto flex min-h-dvh w-full lg:max-w-[1400px]">
        {!hideNav ? <SidebarNav /> : null}
        <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
          {children}
          {!hideNav ? <BottomNav /> : null}
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppGate>{children}</AppGate>
    </AppProvider>
  );
}
