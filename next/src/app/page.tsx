/**
 * Página raiz — Fase 2: Seções Institucionais
 *
 * Seções implementadas nesta fase:
 *   #inicio       → <Hero />      (server — banners, eixos, stats)
 *   #sobre        → <Sobre />     (server + SobreClient)
 *   #pnipi        → <Pnipi />     (server + PnipiClient)
 *   #midiateca    → <Midiateca /> (server + MidiatecaClient)
 *   #contato      → <Contato />   (client)
 *
 * Fase 3 (não implementada aqui):
 *   #consulta-publica → <ConsultaPublica /> (mapa + dashboards + searchParams)
 *
 * Pendências abertas antes da Fase 3:
 *   - textoindicadors: seção destino ainda não definida (não encaixada aqui)
 *   - Consulta pública: mapa com geojson real + abas com estado em URL
 */

import { Hero } from "@/components/sections/Hero";
import { Sobre } from "@/components/sections/Sobre";
import { Pnipi } from "@/components/sections/Pnipi";
import { Midiateca } from "@/components/sections/Midiateca";
import { Contato } from "@/components/sections/Contato";

export default function Home() {
  return (
    <>
      <Hero />
      <Sobre />
      <Pnipi />
      <Midiateca />

      {/*
       * Fase 3: <ConsultaPublica />
       * Placeholder para âncora do Header funcionar enquanto a seção não existe.
       */}
      <section
        id="consulta-publica"
        aria-label="Consulta pública"
        className="py-20 lg:py-28 bg-muted"
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-10 text-center">
          <span className="inline-block rounded-md bg-muted-foreground/10 px-5 py-3 text-sm text-muted-foreground">
            🚧 Consulta pública — Fase 3 (mapa + dashboards)
          </span>
        </div>
      </section>

      <Contato />
    </>
  );
}
