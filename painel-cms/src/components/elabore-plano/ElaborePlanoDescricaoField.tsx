import React from 'react';
import { inputStyle, labelStyle } from './elaborePlanoFormStyles';

const MARKDOWN_HELP = `Formatação disponível em Descrição:
  **negrito**   → texto em negrito
  *itálico*     → texto em itálico
  ## Título     → subtítulo
  - item        → lista com marcadores
  [texto](https://url.com "Dica ao passar o mouse") → link com tooltip`;

interface ElaborePlanoDescricaoFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export const ElaborePlanoDescricaoField: React.FC<ElaborePlanoDescricaoFieldProps> = ({
  value,
  onChange,
  disabled,
}) => {
  return (
    <div>
      <label htmlFor="descricao" style={labelStyle}>
        Descrição (Richtext / Markdown)
      </label>
      <textarea
        id="descricao"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={7}
        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
        placeholder="Texto descritivo do guia..."
      />
      <pre
        style={{
          marginTop: '8px',
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
