import React from 'react';
import { blurDefaultBorder, focusPrimaryBorder, labelStyle } from './sobreFormStyles';

// Texto de ajuda de sintaxe Markdown (decisão B2)
const MARKDOWN_HELP = `Formatação disponível:
  **negrito**   → texto em negrito
  *itálico*     → texto em itálico
  ## Título     → subtítulo
  - item        → lista com marcadores
  [texto](https://url.com "Dica ao passar o mouse") → link com tooltip`;

interface SobreTextFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const SobreTextField: React.FC<SobreTextFieldProps> = ({ value, onChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={labelStyle}>Texto</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite o conteúdo da aba…"
        rows={8}
        style={{
          padding: '12px 14px',
          borderRadius: '11px',
          border: '1px solid var(--border)',
          background: 'var(--bg)',
          fontSize: '13.5px',
          color: 'var(--text)',
          outline: 'none',
          resize: 'vertical',
          minHeight: '140px',
          fontFamily: 'var(--font-body)',
          lineHeight: 1.55,
          transition: 'border-color .15s ease',
          boxSizing: 'border-box',
          width: '100%',
        }}
        onFocus={focusPrimaryBorder}
        onBlur={blurDefaultBorder}
      />
      {/* Ajuda de sintaxe Markdown (decisão B2) */}
      <pre
        style={{
          margin: 0,
          padding: '10px 14px',
          borderRadius: '9px',
          background: 'var(--muted)',
          fontSize: '11.5px',
          color: 'var(--text-soft)',
          fontFamily: 'monospace',
          lineHeight: 1.65,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {MARKDOWN_HELP}
      </pre>
    </div>
  );
};
