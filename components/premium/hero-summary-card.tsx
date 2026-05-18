"use client";

import { HeroCoverMedia } from "@/components/restaurant/hero-cover-media";
import { useCoverTheme } from "@/hooks/use-cover-theme";
import { resolveRestaurantCoverUrl } from "@/lib/restaurant/cover-image";

export function HeroSummaryCard({
  reviewsTotal,
  restaurantName,
  coverImageUrl,
  coverImageSource,
}: {
  reviewsTotal: number;
  restaurantName?: string;
  coverImageUrl?: string | null;
  coverImageSource?: string | null;
}) {
  const isLogoUpload = coverImageSource === "upload";

  if (isLogoUpload) {
    return (
      <HeroSummaryLogoCard
        reviewsTotal={reviewsTotal}
        restaurantName={restaurantName}
        coverImageUrl={coverImageUrl}
      />
    );
  }

  return (
    <HeroSummaryPhotoCard
      reviewsTotal={reviewsTotal}
      restaurantName={restaurantName}
      coverImageUrl={coverImageUrl}
    />
  );
}

function LogoFrame({
  src,
  alt,
  size = "lg",
  className = "",
}: {
  src: string;
  alt: string;
  size?: "sm" | "lg";
  className?: string;
}) {
  const imgClass =
    size === "sm"
      ? "h-11 w-auto max-w-[120px] object-contain"
      : "h-[88px] w-auto max-w-[min(100%,220px)] object-contain sm:h-[104px] md:h-[120px]";

  return (
    <div className={["relative shrink-0", className].join(" ")}>
      <div
        className="absolute inset-0 -m-3 rounded-[22px] bg-white/70 blur-lg"
        aria-hidden
      />
      <div className="relative flex items-center justify-center rounded-[20px] border border-border/50 bg-white/92 p-3 shadow-[0_12px_32px_-18px_rgba(28,26,24,0.2)] sm:rounded-[24px] sm:p-5 md:p-7">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={imgClass}
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}

function HeroSummaryLogoCard({
  reviewsTotal,
  restaurantName,
  coverImageUrl,
}: {
  reviewsTotal: number;
  restaurantName?: string;
  coverImageUrl?: string | null;
}) {
  const logoUrl = resolveRestaurantCoverUrl(coverImageUrl);
  const alt = restaurantName
    ? `Logo de ${restaurantName}`
    : "Logo del restaurante";

  return (
    <section
      id="resumen-completo"
      className="fade-in relative overflow-hidden rounded-[32px] border border-border/60 bg-gradient-to-br from-card via-cream to-cream-muted shadow-[0_24px_60px_-32px_rgba(28,26,24,0.18)]"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-terracotta/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-mustard/10 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-8 p-7 sm:p-10 md:flex-row md:items-stretch md:gap-12">
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-10">
          <div>
            <div className="flex items-start justify-between gap-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-terracotta/90">
                Resumen semanal
              </p>
              {logoUrl ? (
                <LogoFrame
                  src={logoUrl}
                  alt={alt}
                  size="sm"
                  className="md:hidden"
                />
              ) : null}
            </div>
            {restaurantName ? (
              <p className="mt-4 font-display text-2xl font-semibold text-ink sm:text-3xl">
                {restaurantName}
              </p>
            ) : null}
            <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-[.92] tracking-normal text-ink sm:text-5xl">
              Lo más importante de tus clientes
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-ink-soft">
              Analizamos {reviewsTotal.toLocaleString("es")} reseñas y detectamos
              patrones que te ayudan a tomar mejores decisiones esta semana.
            </p>
          </div>
          <a
            href="#plan-semanal"
            className="inline-flex w-fit items-center justify-center rounded-full bg-terracotta px-5 py-3 text-sm font-semibold text-white transition hover:bg-terracotta-dark"
          >
            Ver plan de esta semana
          </a>
        </div>

        {logoUrl ? (
          <div className="hidden shrink-0 items-center justify-center md:flex md:w-[min(42%,240px)]">
            <LogoFrame src={logoUrl} alt={alt} size="lg" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function HeroSummaryPhotoCard({
  reviewsTotal,
  restaurantName,
  coverImageUrl,
}: {
  reviewsTotal: number;
  restaurantName?: string;
  coverImageUrl?: string | null;
}) {
  const alt = restaurantName
    ? `Imagen de ${restaurantName}`
    : "Imagen del restaurante";
  const { theme, ready, isLight } = useCoverTheme(coverImageUrl);

  const text = isLight
    ? {
        eyebrow: "text-terracotta/90",
        title: "text-ink",
        body: "text-ink-soft",
        name: "text-ink",
        panel: "bg-cream/94 md:bg-cream/90",
      }
    : {
        eyebrow: "text-white/62",
        title: "text-white",
        body: "text-white/72",
        name: "text-white/95",
        panel: "bg-[#2A211B]/82 md:bg-[#2A211B]/78",
      };

  return (
    <section
      id="resumen-completo"
      className={[
        "fade-in relative overflow-hidden rounded-[32px] transition-colors duration-500",
        ready ? "" : "opacity-95",
        isLight ? "bg-cream" : "bg-[#2A211B]",
      ].join(" ")}
    >
      <div className="relative grid min-h-[420px] md:grid-cols-[1fr_0.9fr]">
        <HeroCoverMedia src={coverImageUrl} alt={alt} theme={theme} />

        <div
          className={[
            "relative z-10 flex flex-col justify-between gap-10 p-7 sm:p-10",
            "md:col-start-1 md:row-start-1 md:max-w-[58%]",
            text.panel,
            "backdrop-blur-[2px] md:backdrop-blur-md",
          ].join(" ")}
        >
          <div>
            <p
              className={[
                "font-mono text-[10px] uppercase tracking-[0.26em]",
                text.eyebrow,
              ].join(" ")}
            >
              Resumen semanal
            </p>
            {restaurantName ? (
              <p
                className={[
                  "mt-4 font-display text-2xl font-semibold sm:text-3xl",
                  text.name,
                ].join(" ")}
              >
                {restaurantName}
              </p>
            ) : null}
            <h1
              className={[
                "mt-4 max-w-xl font-display text-4xl font-semibold leading-[.92] tracking-normal sm:text-5xl",
                text.title,
              ].join(" ")}
            >
              Lo más importante de tus clientes
            </h1>
            <p className={["mt-5 max-w-md text-base leading-7", text.body].join(" ")}>
              Analizamos {reviewsTotal.toLocaleString("es")} reseñas y detectamos
              patrones que te ayudan a tomar mejores decisiones esta semana.
            </p>
          </div>
          <a
            href="#plan-semanal"
            className="inline-flex w-fit items-center justify-center rounded-full bg-terracotta px-5 py-3 text-sm font-semibold text-white transition hover:bg-terracotta-dark"
          >
            Ver plan de esta semana
          </a>
        </div>
      </div>
    </section>
  );
}
