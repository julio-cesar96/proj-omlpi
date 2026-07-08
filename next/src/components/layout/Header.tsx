/**
 * Header — componente de servidor (sem "use client")
 *
 * Fase 1: estrutura semântica com links de âncora para cada seção.
 * Fase 2: adicionar logo real, highlight de seção ativa (IntersectionObserver
 *         no client), comportamento de scroll e versão mobile (hambúrguer).
 */

const NAV_LINKS = [
  { href: "#inicio", label: "Início" },
  { href: "#sobre", label: "Sobre" },
  { href: "#pnipi", label: "PNIPI" },
  { href: "#midiateca", label: "Midiateca" },
  { href: "#consulta-publica", label: "Consulta pública" },
  { href: "#contato", label: "Contato" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo — placeholder; substituir por <Image> na Fase 2 */}
        <a
          href="#inicio"
          aria-label="Observa — ir para o início"
          className="flex items-center gap-2 font-heading font-bold text-primary text-xl tracking-tight"
        >
          {/* TODO Fase 2: trocar por logo SVG real */}
          Observa
        </a>

        {/* Navegação principal */}
        <nav aria-label="Navegação principal">
          <ul className="hidden md:flex items-center gap-6 list-none m-0 p-0">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* TODO Fase 2: implementar menu hambúrguer para mobile */}
          <button
            aria-label="Abrir menu"
            className="flex md:hidden items-center justify-center rounded-md p-2 text-foreground/80 hover:bg-muted"
            type="button"
          >
            {/* Ícone inline simples para não depender de lib de ícones na Fase 1 */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
}
