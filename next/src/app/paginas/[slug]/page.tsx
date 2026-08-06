import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import { getPaginaInstitucional } from "@/lib/strapi";
import Link from "next/link";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  let pagina = null;
  
  try {
    pagina = await getPaginaInstitucional(slug);
  } catch {
    // Silencia erros de fetch e retorna título genérico
  }

  if (!pagina) {
    return {
      title: "Página não encontrada",
    };
  }

  const parentMeta = await parent;
  const metaTitle = pagina.seo_meta_titulo || pagina.titulo;
  const metaDescription =
    pagina.seo_meta_descricao ||
    pagina.conteudo.replace(/<[^>]*>/g, "").substring(0, 160);

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: `/paginas/${slug}`,
    },
    openGraph: {
      ...parentMeta.openGraph,
      title: `${metaTitle} | Observa`,
      description: metaDescription,
      url: `/paginas/${slug}`,
      images: parentMeta.openGraph?.images || [],
    },
    twitter: {
      ...parentMeta.twitter,
      title: `${metaTitle} | Observa`,
      description: metaDescription,
      images: parentMeta.twitter?.images || [],
    },
  };
}

export default async function PaginaInstitucionalPage({ params }: Props) {
  const { slug } = await params;
  let pagina = null;
  
  try {
    pagina = await getPaginaInstitucional(slug);
  } catch {
    // Silencia erros de fetch e resultará em 404
  }

  if (!pagina) {
    notFound();
  }

  return (
    <article className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-5 lg:px-10">
        {/* Breadcrumb / Botão voltar */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Voltar para o início
          </Link>
        </div>

        {/* Capa Image (se houver) */}
        {pagina.capa?.url && (
          <div
            className="rounded-[2rem] overflow-hidden shadow-md mb-8 w-full"
            style={{ aspectRatio: "21/9", background: "#fff3ee" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pagina.capa.url}
              alt={pagina.titulo}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Título */}
        <h1
          className="text-[32px] lg:text-[42px] font-black text-foreground mb-8 leading-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {pagina.titulo}
        </h1>

        {/* Conteúdo HTML Puro */}
        <div
          className="prose prose-sm max-w-none text-muted-foreground leading-[1.8] [&_h1]:text-foreground [&_h1]:font-black [&_h1]:text-2xl [&_h1]:mb-4 [&_h1]:mt-8 [&_h2]:text-foreground [&_h2]:font-bold [&_h2]:text-xl [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-4 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1.5 [&_a]:text-primary [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: pagina.conteudo }}
        />
      </div>
    </article>
  );
}
