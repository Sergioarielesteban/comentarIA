"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { copy } from "@/lib/copy/es";

const items = [
  { href: "/insights", label: copy.nav.insights, icon: "📊" },
  { href: "/espejo", label: copy.nav.espejo, icon: "🪞" },
  { href: "/audio", label: copy.nav.audio, icon: "🎧" },
  { href: "/chat", label: copy.nav.chat, icon: "💬" },
  { href: "/ajustes", label: copy.nav.settings, icon: "⚙️" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg justify-around px-1 py-2 safe-bottom">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex min-w-[56px] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors",
                active
                  ? "text-terracotta"
                  : "text-ink-soft hover:text-ink",
              ].join(" ")}
            >
              <span className="text-lg leading-none" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
