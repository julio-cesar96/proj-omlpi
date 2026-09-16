import React from 'react';
import { ExternalLink } from 'lucide-react';

const SITE_URL = import.meta.env.VITE_SITE_URL as string | undefined;

export const ElaborePlanoHeader: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '32px',
        gap: '16px',
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '24px',
            fontWeight: 900,
            letterSpacing: '-.4px',
            color: 'var(--text)',
            margin: '0 0 6px',
          }}
        >
          Elabore o Plano
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-soft)', fontWeight: 500 }}>
          Edite as informações da seção "Elabore o plano do seu município" exibida na página inicial.
        </p>
      </div>

      {SITE_URL && (
        <a
          href={`${SITE_URL}#elabore-plano`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '9px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            color: 'var(--text-soft)',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            flexShrink: 0,
            transition: 'border-color 0.15s ease, color 0.15s ease',
          }}
        >
          Ver no site
          <ExternalLink size={13} />
        </a>
      )}
    </div>
  );
};
