"use client";

import { useState } from "react";
import {
  RESTAURANT_COVER_GRADIENT,
  restaurantInitial,
  resolveRestaurantCoverUrl,
} from "@/lib/restaurant/cover-image";

interface RestaurantAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md";
}

export function RestaurantAvatar({
  src,
  name,
  size = "sm",
}: RestaurantAvatarProps) {
  const resolved = resolveRestaurantCoverUrl(src);
  const [failed, setFailed] = useState(false);
  const dim = size === "md" ? "h-10 w-10" : "h-9 w-9";
  const textSize = size === "md" ? "text-sm" : "text-xs";

  if (resolved && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved}
        alt=""
        className={`${dim} shrink-0 rounded-full border-2 border-white/90 object-cover shadow-sm`}
        onError={() => setFailed(true)}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`${dim} grid shrink-0 place-items-center rounded-full border-2 border-white/90 font-display font-semibold text-cream shadow-sm ${textSize}`}
      style={{ background: RESTAURANT_COVER_GRADIENT }}
      aria-hidden
    >
      {restaurantInitial(name)}
    </div>
  );
}
