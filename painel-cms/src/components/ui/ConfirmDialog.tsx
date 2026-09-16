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
        <AlertDialog.Overlay className="fixed inset-0 bg-[rgba(44,44,20,0.32)] z-[1000] animate-[fadeIn_.2s_ease]" />

        {/* Conteúdo centralizado */}
        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] max-w-[92vw] bg-card rounded shadow-[var(--shadow-lg)] z-[1001] p-6 flex flex-col gap-4 animate-[slideIn_.25s_ease] outline-none">
          {/* Título do Modal */}
          <AlertDialog.Title className="font-heading text-[19px] font-extrabold text-[var(--text-h)] m-0 tracking-[-0.3px]">
            {title}
          </AlertDialog.Title>

          {/* Descrição do Modal */}
          <AlertDialog.Description className="text-[13.5px] text-muted-foreground leading-[1.45] m-0">
            {description}
          </AlertDialog.Description>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2.5 mt-2">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className="h-10 px-4 rounded-[11px] border border-border bg-card text-foreground text-[13px] font-bold cursor-pointer transition-colors duration-200 ease-in-out hover:bg-muted"
              >
                {cancelLabel}
              </button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={onConfirm}
                className={`h-10 px-5 rounded-[11px] text-white text-[13px] font-extrabold border-0 cursor-pointer transition-colors duration-200 ease-in-out ${
                  isDestructive
                    ? 'bg-destructive shadow-[0_4px_12px_rgba(212,24,61,0.28)] hover:bg-[#be1232]'
                    : 'bg-primary shadow-[var(--shadow-btn)] hover:bg-primary-hover'
                }`}
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
