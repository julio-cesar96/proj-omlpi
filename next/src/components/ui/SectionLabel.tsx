/**
 * SectionLabel — kicker padrão das seções (tarja laranja + rótulo)
 *
 * Extraído das 6 cópias idênticas que viviam em Hero, Pnipi, Referencia,
 * ElaborePlano, SobreClient e HistoricoClient (mais uma inline em Contato).
 *
 * Server Component: é markup puro, sem estado nem eventos.
 */

export function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-6 h-0.5 bg-primary rounded-full" aria-hidden="true" />
      <span className="text-xs font-bold uppercase tracking-widest text-primary">
        {children}
      </span>
    </div>
  );
}
