"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NavIcon } from "@/components/layout/nav-icon";
import { MoreNavSheet } from "@/components/layout/more-nav-sheet";
import { MOBILE_PRIMARY_NAV, isNavActive } from "@/lib/navigation";
import { copy } from "@/lib/copy/es";

const mobileItems = [
  ...MOBILE_PRIMARY_NAV,
  { href: "#more", label: copy.nav.more, icon: "more" as const },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setPendingHref(null), 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 safe-bottom lg:hidden">
        <div className="mx-auto max-w-lg rounded-[28px] border border-border bg-card/86 p-1.5 shadow-[0_18px_48px_rgba(28,26,24,.12)] backdrop-blur-xl">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${mobileItems.length}, minmax(0, 1fr))`,
            }}
          >
            {mobileItems.map((item) => {
              const isMore = item.href === "#more";
              const active = !isMore && isNavActive(pathname, item.href);
              const visuallyActive = active || pendingHref === item.href;

              if (isMore) {
                return (
                  <button
                    key="more"
                    type="button"
                    onClick={() => setMoreOpen(true)}
                    className="flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[22px] px-1 py-2 text-[10px] font-semibold text-ink-soft"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full">
                      <NavIcon name="more" />
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={() => router.prefetch(item.href)}
                  onClick={() => {
                    if (!active) setPendingHref(item.href);
                    setMoreOpen(false);
                  }}
                  className={[
                    "flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[22px] px-1 py-2 text-[10px] font-semibold transition",
                    visuallyActive
                      ? "bg-cream text-terracotta"
                      : "text-ink-soft hover:bg-cream/70",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "grid h-8 w-8 place-items-center rounded-full",
                      visuallyActive ? "bg-terracotta/10 text-terracotta" : "",
                    ].join(" ")}
                  >
                    <NavIcon name={item.icon} />
                  </span>
                  <span className="max-w-full truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      <MoreNavSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
