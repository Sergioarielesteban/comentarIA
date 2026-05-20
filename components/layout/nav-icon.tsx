import type { NavIconName } from "@/lib/navigation";

const common = {
  className: "h-[18px] w-[18px]",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export function NavIcon({ name }: { name: NavIconName }) {
  if (name === "summary") {
    return (
      <svg {...common}>
        <path d="M5 7h14" />
        <path d="M5 12h9" />
        <path d="M5 17h12" />
      </svg>
    );
  }
  if (name === "center" || name === "reviews") {
    return (
      <svg {...common}>
        <path d="M12 3l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7Z" />
        <path d="M5 19h14" />
      </svg>
    );
  }
  if (name === "replies") {
    return (
      <svg {...common}>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        <path d="M8 12h8" />
      </svg>
    );
  }
  if (name === "mirror") {
    return (
      <svg {...common}>
        <path d="M12 3v18" />
        <path d="M8 7h8" />
        <path d="M7 17h10" />
      </svg>
    );
  }
  if (name === "plan") {
    return (
      <svg {...common}>
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
      </svg>
    );
  }
  if (name === "briefing") {
    return (
      <svg {...common}>
        <path d="M7 5v14" />
        <path d="M17 5v14" />
        <path d="M4 9v6" />
        <path d="M20 9v6" />
        <path d="M11 7v10" />
        <path d="M13 7v10" />
      </svg>
    );
  }
  if (name === "consultant") {
    return (
      <svg {...common}>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
      </svg>
    );
  }
  if (name === "competition") {
    return (
      <svg {...common}>
        <path d="M6 20V10" />
        <path d="M12 20V4" />
        <path d="M18 20v-6" />
      </svg>
    );
  }
  if (name === "evolution") {
    return (
      <svg {...common}>
        <path d="M3 17l6-6 4 4 8-10" />
        <path d="M14 5h7v7" />
      </svg>
    );
  }
  if (name === "voice") {
    return (
      <svg {...common}>
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <path d="M12 19v3" />
      </svg>
    );
  }
  if (name === "more") {
    return (
      <svg {...common}>
        <path d="M5 12h.01" />
        <path d="M12 12h.01" />
        <path d="M19 12h.01" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.37" />
    </svg>
  );
}
