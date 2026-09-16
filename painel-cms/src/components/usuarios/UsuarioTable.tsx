import React from 'react';
import type { StrapiUsuario } from '../../lib/strapi';
import { getRoleBadgeStyle } from '../../lib/roles';

interface UsuarioTableProps {
  usuarios: StrapiUsuario[];
  isLoading: boolean;
  error: unknown;
  currentUserId?: number;
  onEdit: (usuario: StrapiUsuario) => void;
}

export const UsuarioTable: React.FC<UsuarioTableProps> = ({
  usuarios,
  isLoading,
  error,
  currentUserId,
  onEdit,
}) => {
  return (
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

      {error ? (
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
      ) : null}

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
              const badge = getRoleBadgeStyle(u.role?.name);
              const self = u.id === currentUserId;

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
                      onClick={() => onEdit(u)}
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
  );
};
