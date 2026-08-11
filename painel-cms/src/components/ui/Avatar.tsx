import React from 'react';

interface AvatarProps {
  name: string;
  roleName?: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ name, roleName, size = 34 }) => {
  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const getRoleBg = (role?: string) => {
    if (!role) return 'var(--primary)';
    const r = role.toLowerCase();
    if (r.includes('admin')) return 'var(--primary)';
    if (r.includes('editor')) return 'var(--secondary)';
    if (r.includes('revis')) return '#8a6bd6';
    return 'var(--primary)';
  };

  const initials = getInitials(name || 'Usuário');
  const bg = getRoleBg(roleName);

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: bg,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: `${size * 0.38}px`,
        fontFamily: 'var(--font-heading)',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
};
