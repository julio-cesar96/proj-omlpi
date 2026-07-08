import type { Metadata } from "next";
import { Nunito, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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
// Fase 4: substituir pelos valores reais (OG, Twitter, robots, sitemap)
export const metadata: Metadata = {
  title: {
    default: "Observa — Monitoramento de Planos pela Primeira Infância no Brasil",
    template: "%s | Observa",
  },
  description:
    "Plataforma nacional de monitoramento e transparência de Planos Municipais pela Primeira Infância (PNIPI).",
  metadataBase: new URL("https://observa.rnpi.org.br"), // TODO Fase 4: confirmar domínio final
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Observa",
    // TODO Fase 4: adicionar imagem OG, título e descrição finais
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
      </body>
    </html>
  );
}
