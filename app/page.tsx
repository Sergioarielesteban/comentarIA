import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { copy } from "@/lib/copy/es";

export default function LandingPage() {
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col px-5 py-10">
      <p className="font-display text-sm uppercase tracking-[0.2em] text-terracotta">
        {copy.brand.name}
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-ink">
        {copy.landing.heroTitle}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink-soft">
        {copy.landing.heroSubtitle}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/login?mode=register" className="flex-1">
          <Button fullWidth>{copy.landing.ctaPrimary}</Button>
        </Link>
        <Link href="/login" className="flex-1">
          <Button variant="secondary" fullWidth>
            {copy.landing.ctaSecondary}
          </Button>
        </Link>
      </div>

      <div className="mt-10 space-y-3">
        {copy.landing.features.map((f) => (
          <Card key={f.title}>
            <h2 className="font-display text-lg font-semibold text-ink">
              {f.title}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">{f.body}</p>
          </Card>
        ))}
      </div>

      <footer className="mt-auto pt-12 text-center text-xs text-ink-soft">
        {copy.brand.footer}
      </footer>
    </div>
  );
}
