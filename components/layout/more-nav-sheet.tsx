"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "@/components/layout/nav-icon";
import { NAV_ITEMS, MOBILE_PRIMARY_NAV, isNavActive } from "@/lib/navigation";
import { copy } from "@/lib/copy/es";

export function MoreNavSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const primaryHrefs = new Set(MOBILE_PRIMARY_NAV.map((i) => i.href));
  const moreItems = NAV_ITEMS.filter((i) => !primaryHrefs.has(i.href));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-[#2A211B]/35 backdrop-blur-sm"
        aria-label="Cerrar menú"
        onClick={onClose}
      />
      <div className="absolute inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] max-h-[70vh] overflow-y-auto rounded-[28px] border border-border bg-card p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-xl font-semibold text-ink">
            {copy.nav.more}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm text-ink-soft"
          >
            Cerrar
          </button>
        </div>
        <ul className="grid gap-1 sm:grid-cols-2">
          {moreItems.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={[
                    "flex items-center gap-3 rounded-[16px] px-3 py-3 text-sm font-medium",
                    active ? "bg-cream text-terracotta" : "text-ink hover:bg-cream/70",
                  ].join(" ")}
                >
                  <NavIcon name={item.icon} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
