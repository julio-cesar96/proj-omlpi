import React from 'react';
import { Download, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../ui/Avatar';

interface TopbarProps {
  onImportClick?: () => void;
  onCreateClick?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onImportClick, onCreateClick }) => {
  const { user, logout } = useAuth();

  const userName = user?.username || user?.email?.split('@')[0] || 'Usuário';
  const roleName = user?.role?.name || 'Administrador';

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        flexShrink: 0,
        background: 'rgba(255,255,240,.85)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Botão Importar */}
        <button
          onClick={onImportClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            height: '38px',
            padding: '0 14px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'background 0.15s ease',
          }}
        >
          <Download size={16} strokeWidth={2} />
          Importar
        </button>

        {/* Botão Criar */}
        <button
          onClick={onCreateClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            height: '38px',
            padding: '0 16px',
            borderRadius: '10px',
            background: 'var(--primary)',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 700,
            boxShadow: 'var(--shadow-btn)',
            transition: 'background 0.15s ease',
          }}
        >
          <Plus size={16} strokeWidth={2.4} />
          Criar
        </button>

        <div style={{ width: '1px', height: '26px', background: 'var(--border)', margin: '0 4px' }} />

        {/* Info do Usuário */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '4px 6px 4px 4px' }}>
          <Avatar name={userName} roleName={roleName} size={34} />
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700 }}>{userName}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-soft)' }}>{roleName}</div>
          </div>
        </div>

        {/* Botão Sair */}
        <button
          onClick={logout}
          title="Sair da conta"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-soft)',
            marginLeft: '4px',
          }}
        >
          <LogOut size={16} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
};
