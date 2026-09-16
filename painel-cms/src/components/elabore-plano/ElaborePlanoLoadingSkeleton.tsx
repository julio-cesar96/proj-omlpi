import React from 'react';

export const ElaborePlanoLoadingSkeleton: React.FC = () => {
  return (
    <div style={{ padding: '40px 48px', maxWidth: '700px' }}>
      <div
        style={{
          height: '28px',
          width: '240px',
          background: 'var(--muted)',
          borderRadius: '8px',
          marginBottom: '32px',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ marginBottom: '24px' }}>
          <div
            style={{
              height: '13px',
              width: '120px',
              background: 'var(--muted)',
              borderRadius: '6px',
              marginBottom: '8px',
            }}
          />
          <div
            style={{
              height: i === 3 ? '120px' : '42px',
              background: 'var(--muted)',
              borderRadius: '10px',
            }}
          />
        </div>
      ))}
    </div>
  );
};
