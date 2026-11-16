/**
 * Página raiz — One-page Observa
 *
 * Seções implementadas:
 *   #inicio          → <Hero />          (server — banners, eixos, stats)
 *   #sobre           → <Sobre />         (server + SobreClient)
 *   #historico       → <Historico />     (server + HistoricoClient)
 *   #pnipi           → <Pnipi />         (server + PnipiClient)
 *   #referencia      → <Referencia />    (server + ReferenciaClient)
 *   #consulta-publica → <ConsultaPublica /> (server estático + ConsultaPublicaView client)
 *   #contato         → <Contato />       (client)
 *
 * Navegação institucional: âncoras simples (#sobre, #historico, #pnipi…)
 * Consulta pública: estado em query string (?tab=…&location_id=…&area=…)
 * Lido no client (useSearchParams) para manter a home estática/ISR;
 * sincronizado ao interagir (router.replace).
 */

import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Hero } from "@/components/sections/Hero";
import { Sobre } from "@/components/sections/Sobre";
import { Historico } from "@/components/sections/Historico";
// import { Pnipi } from "@/components/sections/Pnipi"; // ocultada a pedido do cliente
import { ElaborePlano } from "@/components/sections/ElaborePlano";
import { Referencia } from "@/components/sections/Referencia";
import { ConsultaPublica } from "@/components/consulta-publica/ConsultaPublica";

const Contato = dynamic(
  () => import("@/components/sections/Contato").then((mod) => mod.Contato)
);

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

// Home estática com ISR: regenerada a cada 1h (mesmo TTL dos fetches do Strapi).
// Nada aqui pode depender da requisição (searchParams, cookies, headers) —
// o estado da Consulta pública é lido no client (ConsultaPublicaView).
export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Hero />
      <Sobre />
      <Historico />
      <ConsultaPublica />
      {/* <Pnipi /> — seção Legislação ocultada a pedido do cliente */}
      <ElaborePlano />
      <Referencia />
      <Contato />
    </>
  );
}
