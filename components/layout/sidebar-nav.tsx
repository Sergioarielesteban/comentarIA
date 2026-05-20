"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComentarIALogo } from "@/components/brand/comentaria-logo";
import { NavIcon } from "@/components/layout/nav-icon";
import { RestaurantAvatar } from "@/components/restaurant/restaurant-avatar";
import { useApp } from "@/components/providers/app-provider";
import { NAV_ITEMS, isNavActive } from "@/lib/navigation";
import { copy } from "@/lib/copy/es";

export function SidebarNav() {
  const pathname = usePathname();
  const { place } = useApp();

  return (
    <aside className="hidden lg:flex lg:w-[260px] lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-card/50">
      <div className="border-b border-border px-5 py-5">
        <ComentarIALogo size="md" />
        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.24em] text-ink-soft">
          Reputación inteligente
        </p>
        {place ? (
          <div className="mt-4 flex items-center gap-3">
            <RestaurantAvatar
              src={place.cover_image_url}
              name={place.nombre}
              size="sm"
            />
            <p className="min-w-0 truncate text-sm font-semibold text-ink">
              {place.nombre}
            </p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "border-l-[3px] border-l-terracotta bg-cream text-terracotta"
                      : "text-ink-soft hover:bg-cream/80 hover:text-ink",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="shrink-0" aria-hidden>
                    <NavIcon name={item.icon} />
                  </span>
                  <span className="min-w-0 truncate">{item.label}</span>
                  {item.badge ? (
                    <span className="ml-auto rounded-full bg-olive/15 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-olive">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
          Plan Profesional
        </p>
        <p className="mt-1 text-xs text-ink-soft">{copy.brand.footer}</p>
      </div>
    </aside>
  );
}
