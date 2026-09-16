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
    className={`relative w-11 h-[26px] rounded-full border-0 shrink-0 transition-colors duration-200 ease-in-out ${
      checked ? 'bg-secondary' : 'bg-[rgba(164,154,135,0.35)]'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
  >
    <span
      className={`absolute top-[3px] w-5 h-5 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.18)] transition-[left] duration-200 ease-in-out ${
        checked ? 'left-[21px]' : 'left-[3px]'
      }`}
    />
  </button>
);
