/**
 * Página raiz — placeholder Fase 1.
 *
 * Fase 2 em diante: substituir pelo conjunto de seções institucionais
 * (Hero, Sobre, PNIPI, Midiateca, Contato) e pelo bloco ConsultaPublica.
 *
 * Os ids de âncora já estão reservados aqui para que os links do Header
 * funcionem assim que as seções forem adicionadas.
 */
export default function Home() {
  return (
    <>
      {/* Âncoras reservadas — substituídas pelas seções reais na Fase 2/3 */}
      <section id="inicio" aria-label="Início" className="min-h-screen flex items-center justify-center">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="font-heading text-4xl font-bold text-foreground">
            Observa
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Plataforma de monitoramento dos Planos Municipais pela Primeira
            Infância no Brasil.
          </p>
          <p className="mt-8 inline-block rounded-md bg-muted px-4 py-2 text-sm text-muted-foreground">
            🚧 Em construção — Fase 1 (fundação) concluída.
          </p>
        </div>
      </section>

      {/* Fase 2: <Sobre /> */}
      <section id="sobre" aria-label="Sobre" />

      {/* Fase 2: <Pnipi /> */}
      <section id="pnipi" aria-label="PNIPI" />

      {/* Fase 2: <Midiateca /> */}
      <section id="midiateca" aria-label="Midiateca" />

      {/* Fase 3: <ConsultaPublica /> */}
      <section id="consulta-publica" aria-label="Consulta pública" />

      {/* Fase 2: <Contato /> */}
      <section id="contato" aria-label="Contato" />
    </>
  );
}
