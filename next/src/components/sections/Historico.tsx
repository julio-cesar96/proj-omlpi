/**
 * Historico — Server Component (seção Memória / Histórico)
 *
 * Busca o registro de Histórico da collection `sobres`.
 * Passa os dados para HistoricoClient para renderização com suporte
 * a títulos customizados (section_label e section_title via frontmatter).
 * Cache: revalidate 3600s (dado institucional estático).
 */

import { getSobres, StrapiSobre } from "@/lib/strapi";
import { HistoricoClient } from "./HistoricoClient";

export async function Historico() {
  let sobres: StrapiSobre[] = [];

  try {
    sobres = await getSobres({ _sort: "created_at:asc" });
  } catch (error) {
    console.error("[Historico] Falha ao buscar getSobres():", error);
  }

  // Identifica o registro de Histórico/Memória
  const historicoAbas = sobres.filter((aba) => {
    const t = aba.title?.toLowerCase() ?? "";
    const txt = aba.text ?? "";
    return (
      t.includes("histórico") ||
      t.includes("historico") ||
      t.includes("memória") ||
      t.includes("memoria") ||
      txt.includes("section_label: Memória") ||
      txt.includes("section_label: Memoria") ||
      txt.includes("section_title: Histórico") ||
      txt.includes("section_title: Historico") ||
      txt.search(/^##\s*(Histórico|Memória)/m) !== -1
    );
  });

  return <HistoricoClient abas={historicoAbas} />;
}
