import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { AnalyticsScripts } from "@/components/layout/AnalyticsScripts";
import { BackToTopButton } from "@/components/ui/BackToTopButton";

// ─── Fontes locais (self-hosted, zero requisições externas ao Google no build/CI) ─
// Nunito: títulos (headings) — preload desativado para liberar 38 KB de banda para a imagem LCP
const nunito = localFont({
  src: "../fonts/nunito-latin.woff2",
  variable: "--font-nunito",
  display: "swap",
  preload: false,
});

// Plus Jakarta Sans: corpo de texto (acima da dobra no Hero)
const plusJakartaSans = localFont({
  src: "../fonts/plus-jakarta-sans-latin.woff2",
  variable: "--font-plus-jakarta-sans",
  display: "swap",
  preload: true,
});

// ─── Metadata base ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "Observa — Monitoramento dos Planos pela Primeira Infância",
    template: "%s | Observa",
  },
  description:
    "Plataforma de monitoramento e transparência dos Planos Municipais pela Primeira Infância (PNIPI). Acompanhe o status dos planos em todo o Brasil.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.rnpiobserva.org.br"
  ),
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
    title: "Observa — Monitoramento dos Planos pela Primeira Infância",
    description:
      "Plataforma de monitoramento e transparência dos Planos Municipais pela Primeira Infância (PNIPI). Acompanhe o status dos planos em todo o Brasil.",
    url: "/",
    images: [
      {
        url: "/og-image.jpg?v=2",
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
    title: "Observa — Monitoramento dos Planos pela Primeira Infância",
    description:
      "Plataforma de monitoramento e transparência dos Planos Municipais pela Primeira Infância (PNIPI). Acompanhe o status dos planos em todo o Brasil.",
    images: ["/og-image.jpg?v=2"],
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
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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

