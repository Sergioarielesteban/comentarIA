"use client";

import { useState } from "react";
import {
  DEFAULT_RESTAURANT_COVER,
  RESTAURANT_COVER_GRADIENT,
  resolveRestaurantCoverUrl,
} from "@/lib/restaurant/cover-image";

interface RestaurantCoverProps {
  src?: string | null;
  alt: string;
  className?: string;
  layout?: "fill" | "banner";
  priority?: boolean;
}

type CoverPhase = "loading" | "ready" | "local" | "gradient";

export function RestaurantCover({
  src,
  alt,
  className = "",
  layout = "fill",
  priority = false,
}: RestaurantCoverProps) {
  const resolved = resolveRestaurantCoverUrl(src);
  const [phase, setPhase] = useState<CoverPhase>(
    resolved ? "loading" : "local",
  );
  const [currentSrc, setCurrentSrc] = useState<string | null>(resolved);

  const positionClass =
    layout === "fill"
      ? "absolute inset-0 h-full w-full"
      : "relative h-full w-full min-h-[180px]";

  function handleError() {
    if (currentSrc && currentSrc !== DEFAULT_RESTAURANT_COVER) {
      setCurrentSrc(DEFAULT_RESTAURANT_COVER);
      setPhase("local");
      return;
    }
    setCurrentSrc(null);
    setPhase("gradient");
  }

  return (
    <div className={`${positionClass} ${className}`}>
      {phase === "loading" ? (
        <div
          className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,#2A211B_8%,#3d3028_18%,#2A211B_33%)] bg-[length:200%_100%]"
          aria-hidden
        />
      ) : null}

      {phase === "gradient" ? (
        <div
          className="absolute inset-0"
          style={{ background: RESTAURANT_COVER_GRADIENT }}
          aria-hidden
        />
      ) : currentSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- dominios externos dinámicos
        <img
          src={currentSrc}
          alt={alt}
          className={[
            "h-full w-full object-cover transition-opacity duration-500",
            phase === "ready" || phase === "local" ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onLoad={() => setPhase("ready")}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: RESTAURANT_COVER_GRADIENT }}
          aria-hidden
        />
      )}
    </div>
  );
}
