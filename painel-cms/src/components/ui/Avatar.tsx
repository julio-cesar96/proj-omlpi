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
    if (!role) return 'bg-primary';
    const r = role.toLowerCase();
    if (r.includes('admin')) return 'bg-primary';
    if (r.includes('editor')) return 'bg-secondary';
    if (r.includes('revis')) return 'bg-[var(--badge-purple-color)]';
    return 'bg-primary';
  };

  const initials = getInitials(name || 'Usuário');
  const bgClass = getRoleBg(roleName);

  return (
    <div
      className={`rounded-full ${bgClass} text-white flex items-center justify-center font-extrabold font-heading shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
};
