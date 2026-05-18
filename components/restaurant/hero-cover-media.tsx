"use client";

import { RestaurantCover } from "@/components/restaurant/restaurant-cover";
import type { CoverTheme } from "@/hooks/use-cover-theme";

interface HeroCoverMediaProps {
  src?: string | null;
  alt: string;
  theme: CoverTheme;
}

export function HeroCoverMedia({ src, alt, theme }: HeroCoverMediaProps) {
  const overlayClass =
    theme === "light"
      ? "bg-gradient-to-l from-cream/92 via-cream/55 to-transparent md:from-cream/88"
      : "bg-gradient-to-l from-[#2A211B]/88 via-[#2A211B]/35 to-transparent md:from-[#2A211B]/75";

  return (
    <div className="relative min-h-[200px] md:absolute md:inset-y-0 md:right-0 md:w-[46%] md:min-h-full">
      <div className="relative h-full min-h-[200px] md:min-h-full">
        <RestaurantCover
          src={src}
          alt={alt}
          layout="fill"
          priority
          className="z-0"
        />
        <div
          className={[
            "absolute inset-0 z-[1] pointer-events-none",
            overlayClass,
          ].join(" ")}
          aria-hidden
        />
      </div>
    </div>
  );
}
