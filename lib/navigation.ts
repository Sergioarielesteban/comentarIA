import { copy } from "@/lib/copy/es";

export type NavIconName =
  | "summary"
  | "center"
  | "reviews"
  | "replies"
  | "mirror"
  | "plan"
  | "briefing"
  | "consultant"
  | "competition"
  | "evolution"
  | "voice"
  | "settings"
  | "more";

export type NavItem = {
  href: string;
  label: string;
  icon: NavIconName;
  /** Visible en la barra inferior móvil (máx. 4 + Más) */
  mobilePrimary?: boolean;
  badge?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/insights", label: copy.nav.summary, icon: "summary", mobilePrimary: true },
  {
    href: "/centro",
    label: copy.nav.reputationCenter,
    icon: "center",
    mobilePrimary: true,
  },
  { href: "/resenas", label: copy.nav.resenas, icon: "reviews", mobilePrimary: true },
  { href: "/respuestas", label: copy.nav.replies, icon: "replies" },
  { href: "/espejo", label: copy.nav.mirror, icon: "mirror" },
  { href: "/plan-semanal", label: copy.nav.weeklyPlan, icon: "plan" },
  {
    href: "/audio",
    label: copy.nav.briefing,
    icon: "briefing",
    mobilePrimary: true,
    badge: "NUEVO",
  },
  { href: "/chat", label: copy.nav.consultant, icon: "consultant" },
  { href: "/competencia", label: copy.nav.competition, icon: "competition" },
  { href: "/evolucion", label: copy.nav.evolution, icon: "evolution" },
  { href: "/voz", label: copy.nav.brandVoice, icon: "voice" },
  { href: "/ajustes", label: copy.nav.settings, icon: "settings" },
];

export const MOBILE_PRIMARY_NAV = NAV_ITEMS.filter((item) => item.mobilePrimary);

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/insights") return pathname === "/insights";
  return pathname === href || pathname.startsWith(`${href}/`);
}
