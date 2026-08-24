/**
 * Sobre — Server Component (seção Sobre)
 *
 * Busca os registros da collection `sobres` ordenados por `created_at:asc`.
 * Cada registro = uma aba (Quem somos / Resultados do levantamento / Histórico).
 * Confirmado na Fase 1: N registros, um por aba.
 *
 * ⚠️ O schema real do `sobre` não tem campo `order`. Usa `created_at:asc`
 * como proxy de ordem de inserção. Se a ordem das abas precisar ser
 * controlável via CMS, será necessário adicionar campo `order` ao schema
 * (decisão de escopo do redesign do CMS, fora desta migração).
 *
 * Passa os dados para SobreClient para gerenciamento de estado client-side.
 * Cache: revalidate 3600s (dado estático, muda raramente).
 */

import { getSobres, StrapiSobre } from "@/lib/strapi";
import { SobreClient } from "./SobreClient";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-6 h-0.5 bg-primary rounded-full" />
      <span className="text-xs font-bold uppercase tracking-widest text-primary">
        {children}
      </span>
    </div>
  );
}

export async function Sobre() {
  let abas: StrapiSobre[] = [];

  try {
    abas = await getSobres({ _sort: "created_at:asc" });
  } catch (error) {
    console.error("[Sobre] Falha ao buscar getSobres():", error);
  }

  return <SobreClient abas={abas} />;
}
