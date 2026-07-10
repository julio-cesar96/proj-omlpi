/**
 * Página raiz — One-page Observa
 *
 * Seções implementadas:
 *   #inicio          → <Hero />          (server — banners, eixos, stats)
 *   #sobre           → <Sobre />         (server + SobreClient)
 *   #pnipi           → <Pnipi />         (server + PnipiClient)
 *   #midiateca       → <Midiateca />     (server + MidiatecaClient)
 *   #consulta-publica → <ConsultaPublica /> (server, lê searchParams — Fase 3a)
 *   #contato         → <Contato />       (client)
 *
 * Navegação institucional: âncoras simples (#sobre, #pnipi…)
 * Consulta pública: estado em query string (?tab=…&location_id=…&area=…)
 * Lido no server para SSR; sincronizado no client ao interagir (router.replace).
 */

import { Hero } from "@/components/sections/Hero";
import { Sobre } from "@/components/sections/Sobre";
import { Pnipi } from "@/components/sections/Pnipi";
import { Midiateca } from "@/components/sections/Midiateca";
import { Contato } from "@/components/sections/Contato";
import { ConsultaPublica } from "@/components/consulta-publica/ConsultaPublica";

// Next.js App Router: searchParams disponível em Server Components de página
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <>
      <Hero />
      <Sobre />
      <Pnipi />
      <Midiateca />
      <ConsultaPublica searchParams={params} />
      <Contato />
    </>
  );
}
