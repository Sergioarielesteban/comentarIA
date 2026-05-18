"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-cream/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg justify-around px-2 py-2 safe-bottom">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex min-w-[58px] flex-col items-center gap-1 rounded-full px-2 py-1.5 text-[10px] font-medium transition duration-200",
                active ? "text-terracotta" : "text-ink-soft hover:text-ink",
              ].join(" ")}
            >
              <span
                className={[
                  "grid h-6 w-6 place-items-center rounded-full transition",
                  active ? "bg-terracotta/10" : "",
                ].join(" ")}
                aria-hidden
              >
                <NavIcon name={item.icon} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function NavIcon({ name }: { name: (typeof items)[number]["icon"] }) {
  const common = {
    className: "h-4 w-4",
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
