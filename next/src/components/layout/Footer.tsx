/**
 * Footer — Server Component
 *
 * Fase 2:
 *   - Layout expandido: 3 colunas (logo + descrição / Navegação / Iniciativa)
 *   - Busca getPrivacyPolicy() e passa o conteúdo para PrivacyPolicyModal (client)
 *   - Background #444525, texto muted sobre fundo escuro
 *
 * O PrivacyPolicyModal é um client component renderizado aqui como filho —
 * padrão correto do App Router (server pode importar client components como filhos).
 */

import Image from "next/image";
import { getPrivacyPolicy } from "@/lib/strapi";
import { PrivacyPolicyModal } from "@/components/sections/PrivacyPolicyModal";

const CURRENT_YEAR = new Date().getFullYear();

const NAV_LINKS = [
  { href: "#inicio", label: "Início" },
  { href: "#sobre", label: "Sobre" },
  { href: "#historico", label: "Histórico" },
  { href: "#consulta-publica", label: "Consulte os Planos" },
  { href: "#pnipi", label: "Legislação" },
  { href: "#midiateca", label: "Conteúdos e recursos" },
  { href: "#contato", label: "Contato" },
] as const;

export async function Footer() {
  let privacyContent = "";

  try {
    const policy = await getPrivacyPolicy();
    privacyContent = policy.content ?? "";
  } catch {
    // Sem API configurada: modal abre com fallback gracioso
  }

  return (
    <footer style={{ background: "var(--foreground)" }}>
      <div className="max-w-7xl mx-auto px-5 lg:px-10 pt-14 pb-8">
        {/* Colunas */}
        <div className="grid sm:grid-cols-3 gap-8 mb-10">
          {/* Logo + descrição */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo-icon.png"
                alt=""
                aria-hidden="true"
                width={38}
                height={38}
                className="object-contain"
              />
              <span className="font-black text-white text-xl" style={{ fontFamily: "var(--font-heading)" }}>
                Observa<span className="text-[#F25D27]">.</span>
              </span>
            </div>
            <p className="text-sm text-white/70 leading-[1.7]">
              Monitorando planos pela Primeira Infância em todo o Brasil com
              dados abertos e acessíveis.
            </p>
          </div>

          {/* Navegação */}
          <div>
            <div
              className="font-bold text-white text-sm mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Navegação
            </div>
            <nav aria-label="Links de rodapé">
              <ul className="space-y-2 list-none m-0 p-0">
                {NAV_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Iniciativa */}
          <div>
            <div
              className="font-bold text-white text-sm mb-4"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Uma iniciativa da
            </div>
            <p className="text-sm text-white/70 leading-[1.7] mb-4">
              Rede Nacional Primeira Infância (RNPI), com o apoio de parceiros
              institucionais comprometidos com os direitos das crianças de 0 a 6
              anos.
            </p>
            <div className="text-sm text-white/70">
              observa@rnpi.org.br
            </div>
          </div>
        </div>

        {/* Tarja de logos parceiros */}
        <div className="mb-8 pb-8 border-b border-white/10">
          <Image
            src="/tarja-logos.jpeg"
            alt="Logos dos parceiros institucionais"
            width={1600}
            height={234}
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Rodapé inferior */}
        <div className="flex flex-col items-center gap-3 text-xs text-white/70 text-center">
          <p>
            © {CURRENT_YEAR} Plataforma Observa · RNPI — Rede Nacional Primeira
            Infância · Dados abertos sob licença Creative Commons
          </p>
          <nav aria-label="Links legais">
            <ul className="flex items-center gap-4 list-none m-0 p-0">
              <li>
                <PrivacyPolicyModal content={privacyContent} />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
