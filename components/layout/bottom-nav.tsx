"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { copy } from "@/lib/copy/es";

const items = [
  { href: "/insights", label: copy.nav.insights, icon: "summary" },
  { href: "/espejo", label: copy.nav.espejo, icon: "mirror" },
  { href: "/audio", label: copy.nav.audio, icon: "briefing" },
  { href: "/chat", label: copy.nav.chat, icon: "consultant" },
  { href: "/ajustes", label: copy.nav.settings, icon: "settings" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [pressedHref, setPressedHref] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setPendingHref(null);
      setPressedHref(null);
    }, 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 safe-bottom">
      <div className="mx-auto max-w-lg rounded-[28px] border border-border bg-card/86 p-1.5 shadow-[0_18px_48px_rgba(28,26,24,.12)] backdrop-blur-xl">
        <div className="grid grid-cols-5 gap-1">
          {items.map((item) => {
            const active = pathname === item.href;
            const visuallyActive = active || pendingHref === item.href;
            const pressed = pressedHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                aria-current={active ? "page" : undefined}
                onMouseEnter={() => router.prefetch(item.href)}
                onTouchStart={() => router.prefetch(item.href)}
                onPointerDown={() => {
                  router.prefetch(item.href);
                  setPressedHref(item.href);
                }}
                onPointerUp={() => setPressedHref(null)}
                onPointerLeave={() => setPressedHref(null)}
                onPointerCancel={() => setPressedHref(null)}
                onClick={() => {
                  if (!active) setPendingHref(item.href);
                }}
                className={[
                  "group relative flex min-h-[58px] min-w-0 touch-manipulation select-none flex-col items-center justify-center gap-1 overflow-hidden rounded-[22px] px-1.5 py-2 text-[10px] font-semibold transition duration-200 ease-out",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta",
                  visuallyActive
                    ? "bg-cream text-terracotta shadow-[0_8px_22px_rgba(196,83,31,.12)]"
                    : "text-ink-soft hover:bg-cream/70 hover:text-ink",
                  pressed ? "scale-[.96]" : "scale-100",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute left-1/2 top-1.5 h-1 w-7 -translate-x-1/2 rounded-full bg-terracotta transition duration-200",
                    visuallyActive ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                  aria-hidden
                />
                <span
                  className={[
                    "relative grid h-8 w-8 place-items-center rounded-full transition duration-200",
                    visuallyActive
                      ? "bg-terracotta/10 text-terracotta"
                      : "text-ink-soft group-hover:bg-cream-muted/70 group-hover:text-ink",
                  ].join(" ")}
                  aria-hidden
                >
                  <NavIcon name={item.icon} />
                </span>
                <span className="relative max-w-full truncate leading-none">
                  {item.label}
                </span>
                {pendingHref === item.href ? (
                  <span
                    className="absolute bottom-1.5 h-1 w-1 rounded-full bg-terracotta/70"
                    aria-hidden
                  />
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function NavIcon({ name }: { name: (typeof items)[number]["icon"] }) {
  const common = {
    className: "h-[18px] w-[18px]",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };

  if (name === "summary") {
    return (
      <svg {...common}>
        <path d="M5 7h14" />
        <path d="M5 12h9" />
        <path d="M5 17h12" />
      </svg>
    );
  }
  if (name === "mirror") {
    return (
      <svg {...common}>
        <path d="M8 4h8a2 2 0 0 1 2 2v14H6V6a2 2 0 0 1 2-2Z" />
        <path d="M9 8h6" />
        <path d="M9 12h4" />
      </svg>
    );
  }
  if (name === "briefing") {
    return (
      <svg {...common}>
        <path d="M7 5v14" />
        <path d="M17 5v14" />
        <path d="M4 9v6" />
        <path d="M20 9v6" />
        <path d="M11 7v10" />
        <path d="M13 7v10" />
      </svg>
    );
  }
  if (name === "consultant") {
    return (
      <svg {...common}>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.37a1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.08a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.63 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.08a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.63a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.08a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.37 9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.08a1.7 1.7 0 0 0-1.52 1Z" />
    </svg>
  );
}
