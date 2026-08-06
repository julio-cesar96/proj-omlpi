import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useRoles } from '../../hooks/usuarios/useRoles';
import type { StrapiUsuario, UsuarioPayload, UsuarioUpdatePayload, RoleLookup } from '../../lib/strapi';

// IDs confirmados em produção: Administrador=3, Editor=4, Revisor=5
const ROLE_COLORS: Record<string, string> = {
  Administrador: 'var(--warning, #ca8a04)',
  Editor: 'var(--success, #16a34a)',
  Revisor: '#7c3aed',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  Administrador: 'Acesso total: conteúdo, usuários e configurações.',
  Editor: 'Cria e edita conteúdo, sem permissão de exclusão.',
  Revisor: 'Revisa e aprova conteúdo, sem exclusão ou gestão de usuários.',
};

interface UsuarioDrawerProps {
  isOpen: boolean;
  usuario: StrapiUsuario | null;
  isSelf: boolean; // usuário sendo editado é o próprio logado?
  onClose: () => void;
  onCreate: (payload: Omit<UsuarioPayload, 'password'>) => Promise<void>;
  onUpdate: (id: number, payload: UsuarioUpdatePayload) => Promise<void>;
  onToggleBloqueio: (id: number, blocked: boolean) => Promise<void>;
}

export const UsuarioDrawer: React.FC<UsuarioDrawerProps> = ({
  isOpen,
  usuario,
  isSelf,
  onClose,
  onCreate,
  onUpdate,
  onToggleBloqueio,
}) => {
  const isEdit = usuario !== null;

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const { data: roles = [] } = useRoles();

  // Preencher ao abrir em modo edição
  useEffect(() => {
    if (usuario) {
      setUsername(usuario.username || '');
      setEmail(usuario.email || '');
      setRoleId(usuario.role?.id ?? null);
    } else {
      setUsername('');
      setEmail('');
      setRoleId(null);
    }
    setFieldError(null);
  }, [usuario, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    if (!username.trim()) return 'Nome é obrigatório.';
    if (!email.trim() || !email.includes('@')) return 'E-mail inválido.';
    if (roleId === null) return 'Selecione um perfil de acesso.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setFieldError(err); return; }
    setFieldError(null);
    setIsSubmitting(true);
    try {
      if (isEdit && usuario) {
        const payload: UsuarioUpdatePayload = {};
        if (username !== usuario.username) payload.username = username;
        if (email !== usuario.email) payload.email = email;
        // Só atualiza role se não for o próprio usuário (proteção anti-lockout)
        if (!isSelf && roleId !== usuario.role?.id) payload.role = roleId!;
        await onUpdate(usuario.id, payload);
      } else {
        await onCreate({
          username: username.trim(),
          email: email.trim(),
          role: roleId!,
          confirmed: true,
          blocked: false,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBloqueio = async () => {
    if (!usuario || isSelf) return;
    setIsSubmitting(true);
    try {
      await onToggleBloqueio(usuario.id, !usuario.blocked);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const STRAPI_ADMIN_URL =
    (import.meta.env.VITE_STRAPI_URL || 'https://omlpi-strapi.rnpiobserva.org.br') + '/admin';

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(44,44,20,.28)',
          zIndex: 200,
          animation: 'fadeIn .2s ease',
        }}
      />

      {/* Drawer */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: '440px',
          maxWidth: '100vw',
          background: 'var(--card)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight .25s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '17px',
              fontWeight: 800,
              color: 'var(--text-h)',
              margin: 0,
              letterSpacing: '-.3px',
            }}
          >
            {isEdit ? 'Editar usuário' : 'Novo usuário'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-soft)',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form
          id="usuario-drawer-form"
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Campo: Nome (username) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="usuario-username"
              style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}
            >
              Nome de usuário
            </label>
            <input
              id="usuario-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ex: maria.silva"
              style={{
                height: '40px',
                padding: '0 12px',
                borderRadius: '10px',
                border: '1.5px solid var(--border)',
                background: 'var(--input, var(--muted))',
                color: 'var(--text)',
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                transition: 'border-color .15s ease',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* Campo: E-mail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="usuario-email"
              style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}
            >
              E-mail
            </label>
            <input
              id="usuario-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: maria@observa.org.br"
              style={{
                height: '40px',
                padding: '0 12px',
                borderRadius: '10px',
                border: '1.5px solid var(--border)',
                background: 'var(--input, var(--muted))',
                color: 'var(--text)',
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                outline: 'none',
                transition: 'border-color .15s ease',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {/* Cards de Role */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}
            >
              Perfil de acesso
              {isSelf && (
                <span
                  style={{
                    marginLeft: '8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-soft)',
                  }}
                >
                  (não editável — seu próprio perfil)
                </span>
              )}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {roles.map((role: RoleLookup) => {
                const isSelected = roleId === role.id;
                const color = ROLE_COLORS[role.name] || 'var(--primary)';
                const disabled = isSelf; // proteção anti-lockout
                return (
                  <button
                    key={role.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setRoleId(role.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: isSelected ? `2px solid ${color}` : '1.5px solid var(--border)',
                      background: isSelected ? `${color}12` : 'var(--card)',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.55 : 1,
                      textAlign: 'left',
                      transition: 'border-color .15s, background .15s',
                    }}
                  >
                    {/* Radio visual */}
                    <span
                      style={{
                        marginTop: '2px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: isSelected ? `5px solid ${color}` : '2px solid var(--border)',
                        flexShrink: 0,
                        transition: 'border .15s',
                      }}
                    />
                    <div>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: isSelected ? color : 'var(--text)',
                        }}
                      >
                        {role.name}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-soft)',
                          lineHeight: 1.4,
                        }}
                      >
                        {ROLE_DESCRIPTIONS[role.name] || ''}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Link para permissões detalhadas */}
            <a
              href={`${STRAPI_ADMIN_URL}/settings/roles`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '12px',
                color: 'var(--primary)',
                textDecoration: 'none',
                marginTop: '4px',
                opacity: 0.85,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
              onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
            >
              Ver permissões detalhadas no Strapi Admin →
            </a>
          </div>

          {/* Ação de bloqueio (só em edição, não para o próprio usuário) */}
          {isEdit && !isSelf && (
            <div
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: '1.5px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: 700,
                    color: usuario?.blocked ? 'var(--destructive)' : 'var(--text)',
                  }}
                >
                  {usuario?.blocked ? 'Usuário bloqueado' : 'Usuário ativo'}
                </p>
                <p
                  style={{
                    margin: '2px 0 0',
                    fontSize: '12px',
                    color: 'var(--text-soft)',
                  }}
                >
                  {usuario?.blocked
                    ? 'Desbloquear restaura o acesso imediatamente.'
                    : 'Bloquear impede o login sem apagar o usuário.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleBloqueio}
                disabled={isSubmitting}
                style={{
                  height: '36px',
                  padding: '0 16px',
                  borderRadius: '9px',
                  border: 'none',
                  background: usuario?.blocked ? 'var(--success, #16a34a)' : 'var(--destructive)',
                  color: '#fff',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'opacity .2s',
                  opacity: isSubmitting ? 0.6 : 1,
                }}
              >
                {usuario?.blocked ? 'Desbloquear' : 'Bloquear'}
              </button>
            </div>
          )}

          {/* Alerta de auto-lockout */}
          {isSelf && isEdit && (
            <p
              style={{
                fontSize: '12px',
                color: 'var(--text-soft)',
                margin: 0,
                padding: '10px 14px',
                background: 'var(--muted)',
                borderRadius: '8px',
                borderLeft: '3px solid var(--warning, #ca8a04)',
              }}
            >
              ⚠️ Você está editando o seu próprio usuário. Trocar o perfil e bloquear sua
              conta estão desabilitados para evitar perda de acesso.
            </p>
          )}

          {/* Erro de validação */}
          {fieldError && (
            <p
              style={{
                fontSize: '13px',
                color: 'var(--destructive)',
                margin: 0,
                fontWeight: 600,
              }}
            >
              {fieldError}
            </p>
          )}
        </form>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              height: '40px',
              padding: '0 18px',
              borderRadius: '11px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="usuario-drawer-form"
            disabled={isSubmitting}
            style={{
              height: '40px',
              padding: '0 22px',
              borderRadius: '11px',
              background: 'var(--primary)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              border: 'none',
              boxShadow: 'var(--shadow-btn)',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.65 : 1,
              transition: 'opacity .2s',
            }}
          >
            {isSubmitting
              ? isEdit ? 'Salvando…' : 'Criando…'
              : isEdit ? 'Salvar usuário' : 'Criar usuário'}
          </button>
        </div>
      </aside>
    </>
  );
};
