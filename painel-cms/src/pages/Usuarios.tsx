import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useUsuarios } from '../hooks/usuarios/useUsuarios';
import { useUsuarioMutations } from '../hooks/usuarios/useUsuarioMutations';
import { useAuth } from '../hooks/useAuth';
import { UsuarioDrawer } from '../components/usuarios/UsuarioDrawer';
import { SenhaTemporariaDialog } from '../components/usuarios/SenhaTemporariaDialog';
import type { StrapiUsuario, UsuarioPayload, UsuarioUpdatePayload } from '../lib/strapi';

// Cores dos badges de role (mesmas do Drawer)
const ROLE_BADGE: Record<string, { bg: string; color: string }> = {
  Administrador: { bg: 'rgba(202,138,4,.12)',  color: '#ca8a04' },
  Editor:        { bg: 'rgba(22,163,74,.12)',   color: '#16a34a' },
  Revisor:       { bg: 'rgba(124,58,237,.12)',  color: '#7c3aed' },
};

export const Usuarios: React.FC = () => {
  const { user: authUser } = useAuth();
  const { data: usuarios = [], isLoading, error } = useUsuarios();
  const { createUsuario, updateUsuario, toggleBloqueio } = useUsuarioMutations();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<StrapiUsuario | null>(null);

  // Modal de senha — só exibido imediatamente após criação; não reabre
  const [senhaModal, setSenhaModal] = useState<{ open: boolean; senha: string }>({
    open: false,
    senha: '',
  });

  const openCreate = () => {
    setSelectedUsuario(null);
    setDrawerOpen(true);
  };

  const openEdit = (u: StrapiUsuario) => {
    setSelectedUsuario(u);
    setDrawerOpen(true);
  };

  const isSelf = (u: StrapiUsuario) => authUser?.id === u.id;

  // Callbacks para o drawer
  const handleCreate = async (payload: Omit<UsuarioPayload, 'password'>) => {
    const result = await createUsuario.mutateAsync(payload);
    // Exibir senha temporária em modal de visualização única
    setSenhaModal({ open: true, senha: result.senhaTemporaria });
  };

  const handleUpdate = async (id: number, payload: UsuarioUpdatePayload) => {
    await updateUsuario.mutateAsync({ id, payload });
  };

  const handleToggleBloqueio = async (id: number, blocked: boolean) => {
    await toggleBloqueio.mutateAsync({ id, blocked });
  };

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '24px',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '26px',
              fontWeight: 800,
              letterSpacing: '-.5px',
              color: 'var(--text-h)',
              margin: 0,
            }}
          >
            Usuários
          </h1>
          <p style={{ color: 'var(--text-soft)', fontSize: '14px', margin: '4px 0 0' }}>
            Perfis e permissões — Administrador, Editor e Revisor.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            height: '40px',
            padding: '0 18px',
            borderRadius: '11px',
            background: 'var(--primary)',
            color: '#fff',
            fontSize: '13.5px',
            fontWeight: 800,
            border: 'none',
            boxShadow: 'var(--shadow-btn)',
            cursor: 'pointer',
            transition: 'background .2s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary)'; }}
        >
          <UserPlus size={15} />
          Novo usuário
        </button>
      </div>

      {/* Tabela */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}
      >
        {isLoading && (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--text-soft)',
              fontSize: '14px',
            }}
          >
            Carregando usuários…
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '32px 24px',
              textAlign: 'center',
              color: 'var(--destructive)',
              fontSize: '14px',
            }}
          >
            {(error as Error).message}
          </div>
        )}

        {!isLoading && !error && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Usuário', 'Perfil', 'Status', 'Ações'].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: '12px 20px',
                      textAlign: 'left',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '.06em',
                      color: 'var(--text-soft)',
                      background: 'var(--muted)',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      padding: '40px 24px',
                      textAlign: 'center',
                      color: 'var(--text-soft)',
                      fontSize: '14px',
                    }}
                  >
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
              {usuarios.map((u) => {
                const badge = ROLE_BADGE[u.role?.name ?? ''] ?? {
                  bg: 'var(--muted)',
                  color: 'var(--text-soft)',
                };
                const self = isSelf(u);

                return (
                  <tr
                    key={u.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    {/* Usuário: avatar + email */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Avatar inicial */}
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {(u.username?.[0] ?? u.email?.[0] ?? '?').toUpperCase()}
                        </div>
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '13.5px',
                              fontWeight: 700,
                              color: 'var(--text)',
                            }}
                          >
                            {u.username}
                            {self && (
                              <span
                                style={{
                                  marginLeft: '6px',
                                  fontSize: '10.5px',
                                  fontWeight: 600,
                                  color: 'var(--text-soft)',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid var(--border)',
                                }}
                              >
                                você
                              </span>
                            )}
                          </p>
                          <p
                            style={{
                              margin: '1px 0 0',
                              fontSize: '12px',
                              color: 'var(--text-soft)',
                            }}
                          >
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Perfil: badge colorido */}
                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          background: badge.bg,
                          color: badge.color,
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        {u.role?.name ?? 'Sem perfil'}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          color: u.blocked ? 'var(--destructive)' : 'var(--success, #16a34a)',
                        }}
                      >
                        <span
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: u.blocked ? 'var(--destructive)' : 'var(--success, #16a34a)',
                          }}
                        />
                        {u.blocked ? 'Inativo' : 'Ativo'}
                      </span>
                    </td>

                    {/* Ações */}
                    <td style={{ padding: '14px 20px' }}>
                      <button
                        type="button"
                        onClick={() => openEdit(u)}
                        style={{
                          height: '32px',
                          padding: '0 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          background: 'var(--card)',
                          color: 'var(--text)',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'background .15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--muted)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--card)';
                        }}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Drawer */}
      <UsuarioDrawer
        isOpen={drawerOpen}
        usuario={selectedUsuario}
        isSelf={selectedUsuario !== null && isSelf(selectedUsuario)}
        onClose={() => setDrawerOpen(false)}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onToggleBloqueio={handleToggleBloqueio}
      />

      {/* Modal senha temporária */}
      <SenhaTemporariaDialog
        open={senhaModal.open}
        senha={senhaModal.senha}
        onClose={() => setSenhaModal({ open: false, senha: '' })}
      />
    </div>
  );
};
