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
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--text)',
        color: '#FFFFFF',
        padding: '10px 18px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        fontSize: '13.5px',
        fontWeight: 600,
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        zIndex: 1000,
        animation: 'slideIn .25s ease',
      }}
    >
      <CheckCircle2 size={18} color="var(--secondary)" />
      <span>{message}</span>
    </div>
  );
};

