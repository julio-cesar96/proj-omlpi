import React from 'react';
import { blurDefaultBorder, focusPrimaryBorder, inputStyle, labelStyle } from './sobreFormStyles';

interface SobreLinksSectionProps {
  expanded: boolean;
  onToggle: () => void;
  link: string;
  linkTitle: string;
  link2: string;
  link2Title: string;
  onLinkChange: (value: string) => void;
  onLinkTitleChange: (value: string) => void;
  onLink2Change: (value: string) => void;
  onLink2TitleChange: (value: string) => void;
}

export const SobreLinksSection: React.FC<SobreLinksSectionProps> = ({
  expanded,
  onToggle,
  link,
  linkTitle,
  link2,
  link2Title,
  onLinkChange,
  onLinkTitleChange,
  onLink2Change,
  onLink2TitleChange,
}) => {
  const smallInputStyle: React.CSSProperties = { ...inputStyle, height: '38px', fontSize: '13px' };

  return (
    <div
      style={{
        borderRadius: '11px',
        border: '1px solid var(--border)',
        overflow: 'visible',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'var(--muted)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 700,
          color: 'var(--text)',
          fontFamily: 'var(--font-body)',
          borderRadius: expanded ? '11px 11px 0 0' : '11px',
        }}
      >
        <span>Links opcionais</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-soft)',
              fontStyle: 'italic',
            }}
          >
            não exibidos no site atualmente
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform .2s ease',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {expanded && (
        <div
          style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            background: 'var(--card)',
            borderRadius: '0 0 11px 11px',
          }}
        >
          {/* Link 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ ...labelStyle, fontSize: '12px' }}>URL do link 1</label>
              <input
                type="url"
                value={link}
                onChange={(e) => onLinkChange(e.target.value)}
                placeholder="https://…"
                style={smallInputStyle}
                onFocus={focusPrimaryBorder}
                onBlur={blurDefaultBorder}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ ...labelStyle, fontSize: '12px' }}>Rótulo do link 1</label>
              <input
                type="text"
                value={linkTitle}
                onChange={(e) => onLinkTitleChange(e.target.value)}
                placeholder="Ex: Conheça mais a RNPI"
                style={smallInputStyle}
                onFocus={focusPrimaryBorder}
                onBlur={blurDefaultBorder}
              />
            </div>
          </div>

          {/* Link 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ ...labelStyle, fontSize: '12px' }}>URL do link 2</label>
              <input
                type="url"
                value={link2}
                onChange={(e) => onLink2Change(e.target.value)}
                placeholder="https://…"
                style={smallInputStyle}
                onFocus={focusPrimaryBorder}
                onBlur={blurDefaultBorder}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ ...labelStyle, fontSize: '12px' }}>Rótulo do link 2</label>
              <input
                type="text"
                value={link2Title}
                onChange={(e) => onLink2TitleChange(e.target.value)}
                placeholder="Ex: Conheça mais a ANDI"
                style={smallInputStyle}
                onFocus={focusPrimaryBorder}
                onBlur={blurDefaultBorder}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
