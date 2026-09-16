import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useUsuarios } from '../hooks/usuarios/useUsuarios';
import { useUsuarioMutations } from '../hooks/usuarios/useUsuarioMutations';
import { useAuth } from '../hooks/useAuth';
import { UsuarioDrawer } from '../components/usuarios/UsuarioDrawer';
import { UsuarioTable } from '../components/usuarios/UsuarioTable';
import { SenhaTemporariaDialog } from '../components/usuarios/SenhaTemporariaDialog';
import type { StrapiUsuario, UsuarioPayload, UsuarioUpdatePayload } from '../lib/strapi';

export const Usuarios: React.FC = () => {
  const { user: authUser } = useAuth();
  const { data: usuarios = [], isLoading, error } = useUsuarios();
  const { createUsuario, updateUsuario, toggleBloqueio, redefinirSenha } = useUsuarioMutations();

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

  const handleRedefinirSenha = async (id: number): Promise<string> => {
    const result = await redefinirSenha.mutateAsync({ id });
    setSenhaModal({ open: true, senha: result.senhaTemporaria });
    return result.senhaTemporaria;
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
      <UsuarioTable
        usuarios={usuarios}
        isLoading={isLoading}
        error={error}
        currentUserId={authUser?.id}
        onEdit={openEdit}
      />

      {/* Drawer */}
      <UsuarioDrawer
        isOpen={drawerOpen}
        usuario={selectedUsuario}
        isSelf={selectedUsuario !== null && isSelf(selectedUsuario)}
        onClose={() => setDrawerOpen(false)}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onToggleBloqueio={handleToggleBloqueio}
        onRedefinirSenha={handleRedefinirSenha}
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
