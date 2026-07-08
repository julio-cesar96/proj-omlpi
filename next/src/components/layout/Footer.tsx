/**
 * Footer — componente de servidor (sem "use client")
 *
 * Fase 1: estrutura semântica mínima.
 *
 * Fase 2 — pendências confirmadas:
 * - Política de privacidade: implementar como modal (client component separado)
 *   acionado pelo link abaixo. Conteúdo vem de getPrivacyPolicy() (Strapi).
 * - Formulário de contato: por enquanto redireciona para WhatsApp (número a
 *   definir). Substituir por endpoint real quando backend confirmar.
 * - Logos de parceiros e redes sociais.
 */

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-muted/50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        {/* Créditos */}
        <p className="text-center sm:text-left">
          &copy; {CURRENT_YEAR} Observa — Rede Nacional Primeira Infância (RNPI). Todos os
          direitos reservados.
        </p>

        {/* Links utilitários */}
        <nav aria-label="Links do rodapé">
          <ul className="flex items-center gap-4 list-none m-0 p-0">
            {/*
             * Fase 2: substituir este <a> por um botão que abre o
             * <PrivacyPolicyModal /> (client component).
             * Conteúdo: getPrivacyPolicy() do Strapi (collection privacy-policy).
             */}
            <li>
              <a
                href="#"
                className="transition-colors hover:text-primary"
                aria-label="Política de privacidade"
              >
                Política de privacidade
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
