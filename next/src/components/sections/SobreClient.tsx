/**
 * SobreClient — Client Component
 *
 * Gerencia a aba ativa da seção Sobre e renderiza o conteúdo de cada registro.
 * Os dados já chegam prontos como prop (buscados pelo Server Component Sobre.tsx).
 *
 * Cada aba corresponde a um registro `sobres` do Strapi (order:asc).
 * O campo `title` define o label da aba; `content` é markdown renderizado como HTML.
 */

"use client";

import { useState } from "react";
import { StrapiSobre } from "@/lib/strapi";

// Renderização simples de markdown para HTML (sem dependência extra)
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[h|u|o|l])(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");
}

interface Props {
  abas: StrapiSobre[];
}

export function SobreClient({ abas }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeAba = abas[activeIndex];

  if (abas.length === 0) {
    return (
      <p className="text-muted-foreground">
        Conteúdo institucional em breve.
      </p>
    );
  }

  return (
    <>
      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap mb-10 p-1.5 bg-white rounded-2xl shadow-sm border border-border w-fit">
        {abas.map((aba, i) => (
          <button
            key={aba.id}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              activeIndex === i
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background"
            }`}
            aria-pressed={activeIndex === i}
          >
            {aba.title ?? `Aba ${i + 1}`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeAba && (
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Imagem da aba (se houver) */}
          {(activeAba as { image?: { url: string } }).image?.url && (
            <div
              className="rounded-[2rem] overflow-hidden shadow-md flex-shrink-0"
              style={{ aspectRatio: "4/3", background: "#fff3ee" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={(activeAba as { image?: { url: string } }).image!.url}
                alt={activeAba.title ?? ""}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div
            className={
              (activeAba as { image?: { url: string } }).image?.url
                ? ""
                : "col-span-full max-w-3xl"
            }
          >
            {activeAba.title && (
              <h3
                className="text-2xl font-black text-foreground mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {activeAba.title}
              </h3>
            )}
            {activeAba.content && (
              <div
                className="prose prose-sm max-w-none text-muted-foreground leading-[1.75] [&_p]:mb-4 [&_h2]:text-foreground [&_h2]:font-bold [&_h3]:text-foreground [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(activeAba.content),
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
