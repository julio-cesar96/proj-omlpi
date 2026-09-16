import React from 'react';
import { blurDefaultBorder, focusPrimaryBorder, inputStyle, labelStyle } from './sobreFormStyles';

interface SobreSectionCustomizationFieldsProps {
  sectionLabel: string;
  sectionTitle: string;
  onSectionLabelChange: (value: string) => void;
  onSectionTitleChange: (value: string) => void;
  defaultSectionType?: 'sobre' | 'historico';
}

export const SobreSectionCustomizationFields: React.FC<SobreSectionCustomizationFieldsProps> = ({
  sectionLabel,
  sectionTitle,
  onSectionLabelChange,
  onSectionTitleChange,
  defaultSectionType,
}) => {
  const smallInputStyle: React.CSSProperties = {
    ...inputStyle,
    height: '38px',
    fontSize: '13px',
    background: 'var(--card)',
  };

  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        background: 'var(--muted)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            display: 'inline-block',
            width: '18px',
            height: '3px',
            background: 'var(--primary)',
            borderRadius: '2px',
          }}
        />
        <span
          style={{
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '.5px',
            color: 'var(--primary)',
          }}
        >
          Personalização Visual no Site
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Rótulo da tarja laranja */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ ...labelStyle, fontSize: '12px' }}>
            Texto ao lado da tarja laranja
          </label>
          <input
            type="text"
            value={sectionLabel}
            onChange={(e) => onSectionLabelChange(e.target.value)}
            placeholder="Ex: Memória ou Sobre"
            style={smallInputStyle}
            onFocus={focusPrimaryBorder}
            onBlur={blurDefaultBorder}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-soft)' }}>
            Padrão:{' '}
            <em>{defaultSectionType === 'historico' ? 'Memória' : 'Sobre'}</em>
          </span>
        </div>

        {/* Título principal H2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ ...labelStyle, fontSize: '12px' }}>
            Título da seção (H2)
          </label>
          <input
            type="text"
            value={sectionTitle}
            onChange={(e) => onSectionTitleChange(e.target.value)}
            placeholder="Ex: Histórico ou Quem somos"
            style={smallInputStyle}
            onFocus={focusPrimaryBorder}
            onBlur={blurDefaultBorder}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-soft)' }}>
            Padrão:{' '}
            <em>{defaultSectionType === 'historico' ? 'Histórico' : 'Quem somos'}</em>
          </span>
        </div>
      </div>
    </div>
  );
};
