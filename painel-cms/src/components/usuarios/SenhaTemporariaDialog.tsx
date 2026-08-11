import React, { useState } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface SenhaTemporariaDialogProps {
  open: boolean;
  senha: string;
  onClose: () => void;
}

export const SenhaTemporariaDialog: React.FC<SenhaTemporariaDialogProps> = ({
  open,
  senha,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(senha).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(44,44,20,.38)',
            zIndex: 1000,
            animation: 'fadeIn .2s ease',
          }}
        />
        <AlertDialog.Content
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '480px',
            maxWidth: '94vw',
            background: 'var(--card)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1001,
            padding: '28px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            animation: 'slideIn .25s ease',
            outline: 'none',
          }}
        >
          {/* Ícone de alerta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>🔐</span>
            <AlertDialog.Title
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--text-h)',
                margin: 0,
                letterSpacing: '-.3px',
              }}
            >
              Senha temporária gerada
            </AlertDialog.Title>
          </div>

          <AlertDialog.Description asChild>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13.5px',
                  color: 'var(--text-soft)',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                O usuário foi criado. Copie a senha abaixo e envie para ele —{' '}
                <strong style={{ color: 'var(--text)' }}>
                  ela não será exibida novamente.
                </strong>
              </p>

              {/* Caixa da senha */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'var(--muted)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                }}
              >
                <code
                  style={{
                    flex: 1,
                    fontFamily: "'Fira Code', 'Courier New', monospace",
                    fontSize: '15px',
                    fontWeight: 600,
                    letterSpacing: '.06em',
                    color: 'var(--text)',
                    wordBreak: 'break-all',
                    userSelect: 'all',
                  }}
                >
                  {senha}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copiar senha"
                  style={{
                    flexShrink: 0,
                    height: '34px',
                    padding: '0 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: copied ? 'var(--success, #16a34a)' : 'var(--primary)',
                    color: '#fff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'background .2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {copied ? '✓ Copiado!' : 'Copiar'}
                </button>
              </div>

              {/* Aviso */}
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--text-soft)',
                  margin: 0,
                  padding: '8px 12px',
                  background: 'rgba(var(--warning-rgb, 202,138,4),.1)',
                  borderLeft: '3px solid var(--warning, #ca8a04)',
                  borderRadius: '0 6px 6px 0',
                  lineHeight: 1.5,
                }}
              >
                ⚠️ Guarde esta senha com segurança. Após fechar este modal ela não pode
                ser recuperada — seria necessário cadastrar o usuário novamente.
              </p>
            </div>
          </AlertDialog.Description>

          {/* Botão de fechar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={onClose}
                style={{
                  height: '40px',
                  padding: '0 24px',
                  borderRadius: '11px',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 800,
                  border: 'none',
                  boxShadow: 'var(--shadow-btn)',
                  cursor: 'pointer',
                  transition: 'background .2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--primary-hover)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--primary)';
                }}
              >
                Entendi, fechar
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
