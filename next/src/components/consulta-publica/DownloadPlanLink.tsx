"use client";

/**
 * DownloadPlanLink — Client Component
 *
 * Renderiza o link de download de um plano/lei estadual.
 * Isolado como Client Component para poder usar onClick (e.stopPropagation),
 * que é necessário para evitar que o clique dispare também o link-overlay
 * do card pai (PainelEstadual — Server Component).
 *
 * z-10 garante que fique clicável por cima do link-overlay (z-0) do card.
 */

interface DownloadPlanLinkProps {
  url: string;
  label: string;
}

export function DownloadPlanLink({ url, label }: DownloadPlanLinkProps) {
  return (
    <div className="mt-2 pt-2 border-t border-border">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 text-xs text-primary font-medium hover:underline"
      >
        ↓ {label}
      </a>
    </div>
  );
}
