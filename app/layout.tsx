import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Mono, Outfit } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "ComentarIA — Consultor de reseñas",
    template: "%s · ComentarIA",
  },
  description:
    "Analiza reseñas, detecta fortalezas y puntos ciegos, y alinea tu percepción con la voz de tus clientes.",
  applicationName: "ComentarIA",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#c4531f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${outfit.variable} ${dmMono.variable} h-full`}
    >
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
