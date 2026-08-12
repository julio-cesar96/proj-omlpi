import type { Metadata } from "next";
import { Nunito, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { AnalyticsScripts } from "@/components/layout/AnalyticsScripts";
import { BackToTopButton } from "@/components/ui/BackToTopButton";

// ─── Fontes ──────────────────────────────────────────────────────────────────
// Nunito: títulos (headings)
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

// Plus Jakarta Sans: corpo de texto
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// ─── Metadata base ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "Observa — Monitoramento de Planos pela Primeira Infância no Brasil",
    template: "%s | Observa",
  },
  description:
    "Plataforma nacional de monitoramento e transparência de Planos Municipais pela Primeira Infância (PNIPI). Acompanhe o status dos planos em todos os municípios e estados do Brasil.",
  metadataBase: new URL("https://observa.rnpi.org.br"), // placeholder de fase anterior
  alternates: {
    canonical: "/",
  },
  keywords: [
    "primeira infância",
    "PNIPI",
    "planos municipais",
    "monitoramento",
    "transparência",
    "RNPI",
    "Observa",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Observa",
    title: "Observa — Monitoramento de Planos pela Primeira Infância no Brasil",
    description:
      "Plataforma nacional de monitoramento e transparência de Planos Municipais pela Primeira Infância (PNIPI). Acompanhe o status dos planos em todos os municípios e estados do Brasil.",
    url: "/",
    images: [
      {
        url: "/facebook.jpg", // Imagem do FB copiada do omlpi-www
        width: 1200,
        height: 630,
        alt: "Observa — Plataforma nacional de monitoramento de PNIPI",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@rnpiobserva",
    creator: "@rnpiobserva",
    title: "Observa — Monitoramento de Planos pela Primeira Infância no Brasil",
    description:
      "Plataforma nacional de monitoramento e transparência de Planos Municipais pela Primeira Infância (PNIPI). Acompanhe o status dos planos em todos os municípios e estados do Brasil.",
    images: ["/twitter.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon/favicon.ico",
    other: [
      { rel: "mask-icon", url: "/favicon/safari-pinned-tab.svg" },
      { rel: "manifest", url: "/favicon/site.webmanifest" },
    ],
  },
  other: {
    "msapplication-TileColor": "#00aba9",
    "msapplication-config": "/favicon/browserconfig.xml",
    "theme-color": "#ffffff",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ─── Layout raiz ─────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${nunito.variable} ${plusJakartaSans.variable}`}
    >
      <body>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
        <BackToTopButton />
        <AnalyticsScripts />
      </body>
    </html>
  );
}

