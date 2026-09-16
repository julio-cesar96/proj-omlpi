import React from 'react';

interface TextoPublicacaoCardProps {
  isPublished: boolean;
  updatedAt: string | undefined;
}

export const TextoPublicacaoCard: React.FC<TextoPublicacaoCardProps> = ({
  isPublished,
  updatedAt,
}) => {
  const formattedDate = updatedAt ? new Date(updatedAt).toLocaleDateString('pt-BR') : '-';

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow)',
        padding: '16px 18px',
      }}
    >
      <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px' }}>Publicação</div>

      <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', marginBottom: '10px', width: '100%', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--text-soft)', fontWeight: 600 }}>Status</span>
        <span
          style={{
            fontWeight: 700,
            color: isPublished ? '#009045' : '#7a7663',
            background: isPublished ? 'var(--accent)' : 'var(--muted)',
            padding: '2px 10px',
            borderRadius: '20px',
            fontSize: '12px',
          }}
        >
          {isPublished ? 'Publicado' : 'Rascunho'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', marginBottom: '10px', width: '100%', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--text-soft)', fontWeight: 600 }}>Visibilidade</span>
        <span style={{ fontWeight: 700 }}>Pública</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', width: '100%', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--text-soft)', fontWeight: 600 }}>Atualizado</span>
        <span style={{ fontWeight: 700 }}>{formattedDate}</span>
      </div>
    </div>
  );
};
