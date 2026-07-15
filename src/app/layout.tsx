import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, EB_Garamond, Space_Mono } from "next/font/google";
import "./globals.css";

// Fallback tipográfico (README §5). Ideal de pago: IvyOra Display / IvyOra Text / Söhne Mono.
// TODO: al recibir las licenciadas, sustituir por next/font/local desde public/fonts/.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Cliff Club · Cotizador & CRM",
  description: "Cotizador de propuestas y CRM privado — The Cliff Club Residences at Quivira.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#2A2724" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${ebGaramond.variable} ${spaceMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
