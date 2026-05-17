import Link from "next/link";
import { copy } from "@/lib/copy/es";

export function Header({
  title,
  subtitle,
  showBrand = true,
}: {
  title?: string;
  subtitle?: string;
  showBrand?: boolean;
}) {
  return (
    <header className="border-b border-border bg-cream/80 px-4 py-4 backdrop-blur-sm">
      {showBrand && !title ? (
        <Link href="/insights" className="block">
          <p className="font-display text-2xl font-semibold tracking-tight text-ink">
            {copy.brand.name}
          </p>
          <p className="text-xs text-ink-soft">{copy.brand.tagline}</p>
        </Link>
      ) : (
        <div>
          <p className="font-display text-xl font-semibold text-ink">
            {title}
          </p>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>
          ) : null}
        </div>
      )}
    </header>
  );
}
