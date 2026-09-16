import React from 'react';

export const FaqsListSkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        style={{
          height: '62px',
          borderRadius: '14px',
          background: 'var(--muted)',
          animation: 'pulse 1.4s ease-in-out infinite',
          opacity: 1 - i * 0.1,
        }}
      />
    ))}
  </div>
);
