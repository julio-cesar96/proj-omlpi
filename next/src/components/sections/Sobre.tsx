/**
 * Sobre — Server Component (seção Sobre / Quem somos)
 *
 * Busca os registros da collection `sobres` ordenados por `created_at:asc`.
 * Filtra apenas as abas institucionais de "Quem somos" (a seção "Histórico"
 * agora possui seu próprio componente independente <Historico />).
 *
 * Passa os dados para SobreClient para gerenciamento de abas client-side.
 * Cache: revalidate 3600s (dado estático, muda raramente).
 */

import { getSobres, StrapiSobre } from "@/lib/strapi";
import { SobreClient } from "./SobreClient";

export async function Sobre() {
  let abas: StrapiSobre[] = [];

  try {
    const todasAbas = await getSobres({ _sort: "created_at:asc" });

    // Filtra apenas as abas pertencentes a "Quem somos" (exclui Histórico)
    abas = todasAbas.filter((aba) => {
      const t = aba.title?.toLowerCase() ?? "";
      const txt = aba.text ?? "";
      const isHist =
        t.includes("histórico") ||
        t.includes("historico") ||
        t.includes("memória") ||
        t.includes("memoria") ||
        txt.includes("section_label: Memória") ||
        txt.includes("section_label: Memoria") ||
        txt.includes("section_title: Histórico") ||
        txt.includes("section_title: Historico");
      return !isHist;
    });
  } catch (error) {
    console.error("[Sobre] Falha ao buscar getSobres():", error);
  }

  return <SobreClient abas={abas} />;
}
