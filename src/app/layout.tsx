import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/**
 * ── POLICES (auto-hébergées par next/font, zéro requête vers Google) ──
 * Chaque police expose une variable CSS consommée par tailwind.config.ts :
 *   --font-inter          → font-sans     (corps de texte)
 *   --font-space-grotesk  → font-display  (titres futuristes)
 *   --font-jetbrains-mono → font-mono     (données chiffrées / HUD)
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Us — across the ocean",
  description: "Notre espace privé pour rester connectés, Paris ↔ Raleigh.",
};

// Meta viewport (Next 16 : le viewport se déclare séparément des metadata)
export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `dark` force le thème sombre ; les variables de police sont injectées ici
    <html
      lang="fr"
      className={`dark ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
