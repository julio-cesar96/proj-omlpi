import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  visible?: boolean;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, visible = true, onClose }) => {
  useEffect(() => {
    if (!visible || !onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, 2600);
    return () => clearTimeout(timer);
  }, [visible, onClose, message]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-white px-[18px] py-2.5 rounded-xl flex items-center gap-[9px] text-[13.5px] font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.18)] z-[1000] animate-[slideIn_.25s_ease]"
    >
      <CheckCircle2 size={18} color="var(--secondary)" />
      <span>{message}</span>
    </div>
  );
};

