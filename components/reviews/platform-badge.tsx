import type { ReviewPlatform } from "@/lib/types/reviews-platform";

const LABELS: Record<ReviewPlatform, string> = {
  google: "Google",
  tripadvisor: "TripAdvisor",
  thefork: "TheFork",
  booking: "Booking",
};

export function PlatformBadge({ platform }: { platform: ReviewPlatform }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-cream/80 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
      {LABELS[platform] ?? platform}
    </span>
  );
}
