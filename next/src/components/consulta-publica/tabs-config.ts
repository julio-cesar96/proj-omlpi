/**
 * tabs-config.ts — configuração das abas da Consulta Pública
 *
 * Arquivo sem diretiva "use client" para poder ser importado tanto por
 * Server Components (ConsultaPublica.tsx) quanto por Client Components (TabsNav.tsx).
 * TABS precisa ser definido aqui, fora de qualquer Client Component,
 * pois exports de runtime de Client Components não são serializáveis para o servidor.
 */

export const TABS = [
  { id: "mapa", label: "Mapa" },
  { id: "municipais", label: "Municipais" },
  { id: "estaduais", label: "Estaduais / Distrital" },
] as const;

export type TabId = (typeof TABS)[number]["id"] | "nacional" | "monitoramento";
