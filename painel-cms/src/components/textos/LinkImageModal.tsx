import React, { useState, useEffect, useRef } from 'react';

interface LinkImageModalProps {
  isOpen: boolean;
  type: 'link' | 'image';
  defaultValue?: string;
  onClose: () => void;
  onSubmit: (url: string) => void;
  onRemove?: () => void;
}

export const LinkImageModal: React.FC<LinkImageModalProps> = ({
  isOpen,
  type,
  defaultValue = '',
  onClose,
  onSubmit,
  onRemove,
}) => {
  const [url, setUrl] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(defaultValue);
      // Small timeout to ensure DOM layout is completed before focusing
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(url.trim());
  };

  const isLink = type === 'link';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(44, 44, 20, 0.32)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '400px',
          maxWidth: '90vw',
          backgroundColor: 'var(--card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          animation: 'slideIn 0.25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--text-h)',
            margin: 0,
            letterSpacing: '-0.3px',
          }}
        >
          {isLink ? 'Inserir Link' : 'Inserir Imagem'}
        </h3>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13.5px',
            color: 'var(--text-soft)',
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          {isLink
            ? 'Digite a URL de destino do link. Deixe em branco ou clique em Remover para retirar o link.'
            : 'Digite a URL direta da imagem (ex: https://dominio.com/imagem.png).'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              htmlFor="url-input"
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-soft)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              URL
            </label>
            <input
              id="url-input"
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={isLink ? 'https://exemplo.com' : 'https://exemplo.com/imagem.jpg'}
              style={{
                width: '100%',
                height: '40px',
                padding: '0 12px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                fontSize: '13px',
                color: 'var(--text)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '4px',
            }}
          >
            {isLink && defaultValue && onRemove && (
              <button
                type="button"
                onClick={onRemove}
                style={{
                  height: '38px',
                  padding: '0 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--destructive, #dc2626)',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginRight: 'auto',
                  transition: 'background 0.2s ease',
                }}
              >
                Remover Link
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                height: '38px',
                padding: '0 16px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: 'var(--text)',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--muted)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--card)')}
            >
              Cancelar
            </button>

            <button
              type="submit"
              style={{
                height: '38px',
                padding: '0 18px',
                borderRadius: '10px',
                background: 'var(--primary)',
                color: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#e0521f')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--primary)')}
            >
              Inserir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
