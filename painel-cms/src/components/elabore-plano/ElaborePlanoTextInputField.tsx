import React from 'react';
import { inputStyle, labelStyle } from './elaborePlanoFormStyles';

interface ElaborePlanoTextInputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  placeholder: string;
  helperText: string;
}

export const ElaborePlanoTextInputField: React.FC<ElaborePlanoTextInputFieldProps> = ({
  id,
  label,
  value,
  onChange,
  disabled,
  placeholder,
  helperText,
}) => {
  return (
    <div>
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={inputStyle}
        placeholder={placeholder}
      />
      <p style={{ margin: '5px 0 0', fontSize: '12px', color: 'var(--text-soft)' }}>
        {helperText}
      </p>
    </div>
  );
};
