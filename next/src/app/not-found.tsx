import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página não encontrada — 404",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 text-center pt-32 pb-20">
      <span className="text-sm font-bold tracking-widest text-primary uppercase mb-2">
        Erro 404
      </span>
      <h1
        className="text-4xl sm:text-5xl font-black text-foreground mb-4"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Página não encontrada
      </h1>
      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
        O conteúdo que você tentou acessar não existe, foi removido ou mudou de endereço na nova plataforma.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-2xl bg-primary text-white font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20"
      >
        Voltar para a página inicial
      </Link>
    </div>
  );
}

