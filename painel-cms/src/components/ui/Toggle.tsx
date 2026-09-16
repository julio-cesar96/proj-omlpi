import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  id: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, disabled = false, id }) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    style={{
      width: '44px',
      height: '26px',
      borderRadius: '20px',
      background: checked ? 'var(--secondary)' : 'rgba(164,154,135,0.35)',
      position: 'relative',
      flexShrink: 0,
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background 0.2s ease',
      opacity: disabled ? 0.5 : 1,
    }}
  >
    <span
      style={{
        position: 'absolute',
        top: '3px',
        left: checked ? '21px' : '3px',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        transition: 'left 0.2s ease',
      }}
    />
  </button>
);
