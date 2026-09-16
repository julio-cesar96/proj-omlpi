// Cores e descrições dos 3 perfis de acesso do painel.
// Fonte única — antes duplicada em UsuarioDrawer.tsx e pages/Usuarios.tsx.
export const ROLE_COLOR_HEX: Record<string, string> = {
  Administrador: '#ca8a04',
  Editor: '#16a34a',
  Revisor: '#7c3aed',
};

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  Administrador: 'Acesso total: conteúdo, usuários e configurações.',
  Editor: 'Cria e edita conteúdo, sem permissão de exclusão.',
  Revisor: 'Revisa e aprova conteúdo, sem exclusão ou gestão de usuários.',
};

/** Badge {bg, color} para o nome de um role, derivado de ROLE_COLOR_HEX. */
export function getRoleBadgeStyle(roleName?: string): { bg: string; color: string } {
  const hex = roleName ? ROLE_COLOR_HEX[roleName] : undefined;
  if (!hex) {
    return { bg: 'var(--muted)', color: 'var(--text-soft)' };
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { bg: `rgba(${r}, ${g}, ${b}, .12)`, color: hex };
}
