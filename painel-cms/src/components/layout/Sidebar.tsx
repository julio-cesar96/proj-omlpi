import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  FileText,
  FolderOpen,
  HelpCircle,
  FileCode,
  Users,
  Settings,
  Eye,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navPrincipal = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/planos', label: 'Planos', icon: FileText, badge: '128' },
    { to: '/midiateca', label: 'Midiateca', icon: FolderOpen },
    { to: '/faqs', label: 'FAQs', icon: HelpCircle },
    { to: '/textos', label: 'Textos Institucionais', icon: FileCode },
  ];

  const navAdmin = [
    { to: '/usuarios', label: 'Usuários', icon: Users },
    { to: '/configuracoes', label: 'Configurações', icon: Settings },
  ];

  const linkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '11px',
    fontSize: '14px',
    fontWeight: 600,
    textAlign: 'left',
    background: isActive ? 'var(--primary)' : 'transparent',
    color: isActive ? '#FFFFFF' : 'var(--text)',
    transition: 'background 0.15s ease, color 0.15s ease',
  });

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        flexShrink: 0,
        background: 'var(--card)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '22px 22px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '11px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: 'var(--shadow-btn)',
          }}
        >
          <Eye size={22} color="#FFFFFF" strokeWidth={2.4} />
        </div>
        <div style={{ lineHeight: 1.1 }}>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              fontSize: '16px',
              letterSpacing: '-.3px',
            }}
          >
            Observa RNPI
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-soft)',
              fontWeight: 600,
              letterSpacing: '.4px',
            }}
          >
            PAINEL DE CONTEÚDO
          </div>
        </div>
      </div>

      {/* Grupo 1: PRINCIPAL */}
      <div
        style={{
          padding: '6px 14px 4px',
          fontSize: '10.5px',
          fontWeight: 700,
          letterSpacing: '.9px',
          color: 'var(--text-soft)',
        }}
      >
        PRINCIPAL
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '2px 12px' }}>
        {navPrincipal.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} style={linkStyle}>
              {({ isActive }) => (
                <>
                  <Icon size={19} color={isActive ? '#FFFFFF' : 'currentColor'} strokeWidth={2} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--muted)',
                        color: isActive ? '#FFFFFF' : 'var(--text-soft)',
                        padding: '1px 8px',
                        borderRadius: '20px',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Grupo 2: ADMINISTRAÇÃO */}
      <div
        style={{
          padding: '14px 14px 4px',
          fontSize: '10.5px',
          fontWeight: 700,
          letterSpacing: '.9px',
          color: 'var(--text-soft)',
        }}
      >
        ADMINISTRAÇÃO
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '2px 12px' }}>
        {navAdmin.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} style={linkStyle}>
              {({ isActive }) => (
                <>
                  <Icon size={19} color={isActive ? '#FFFFFF' : 'currentColor'} strokeWidth={2} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Rodapé: Card de Armazenamento */}
      <div style={{ marginTop: 'auto', padding: '16px' }}>
        <div style={{ background: 'var(--muted)', borderRadius: '14px', padding: '14px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700 }}>Armazenamento</span>
            <span style={{ fontSize: '12px', color: 'var(--text-soft)', fontWeight: 600 }}>
              6,4 / 20 GB
            </span>
          </div>
          <div
            style={{
              height: '7px',
              background: 'rgba(164,154,135,.25)',
              borderRadius: '20px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: '32%',
                background: 'var(--primary)',
                borderRadius: '20px',
              }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
