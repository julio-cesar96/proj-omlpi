import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;      // default: "Confirmar"
  cancelLabel?: string;       // default: "Cancelar"
  variant?: 'default' | 'destructive';  // 'destructive' usa var(--destructive) no botão de confirmar
  onConfirm: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  onConfirm,
}) => {
  const isDestructive = variant === 'destructive';

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        {/* Overlay com fundo escurecido semi-transparente */}
        <AlertDialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(44,44,20,.32)',
            zIndex: 1000,
            animation: 'fadeIn .2s ease',
          }}
        />
        
        {/* Conteúdo centralizado */}
        <AlertDialog.Content
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '460px',
            maxWidth: '92vw',
            background: 'var(--card)',
            borderRadius: '16px', // var(--radius) do tokens.css
            boxShadow: 'var(--shadow-lg)', // var(--shadow-lg) do tokens.css
            zIndex: 1001,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            animation: 'slideIn .25s ease',
            outline: 'none',
          }}
        >
          {/* Título do Modal */}
          <AlertDialog.Title
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '19px',
              fontWeight: 800,
              color: 'var(--text-h)',
              margin: 0,
              letterSpacing: '-.3px',
            }}
          >
            {title}
          </AlertDialog.Title>

          {/* Descrição do Modal */}
          <AlertDialog.Description
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13.5px',
              color: 'var(--text-soft)',
              lineHeight: 1.45,
              margin: 0,
            }}
          >
            {description}
          </AlertDialog.Description>

          {/* Botões de Ação */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '8px',
            }}
          >
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                style={{
                  height: '40px',
                  padding: '0 16px',
                  borderRadius: '11px',
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--text)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--muted)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--card)';
                }}
              >
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={onConfirm}
                style={{
                  height: '40px',
                  padding: '0 20px',
                  borderRadius: '11px',
                  background: isDestructive ? 'var(--destructive)' : 'var(--primary)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  boxShadow: isDestructive 
                    ? '0 4px 12px rgba(212,24,61,.28)' 
                    : 'var(--shadow-btn)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = isDestructive 
                    ? '#be1232' 
                    : 'var(--primary-hover)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = isDestructive 
                    ? 'var(--destructive)' 
                    : 'var(--primary)';
                }}
              >
                {confirmLabel}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
