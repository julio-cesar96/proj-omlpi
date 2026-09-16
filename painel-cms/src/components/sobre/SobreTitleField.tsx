import React from 'react';
import { blurDefaultBorder, focusPrimaryBorder, inputStyle, labelStyle } from './sobreFormStyles';

interface SobreTitleFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const SobreTitleField: React.FC<SobreTitleFieldProps> = ({ value, onChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={labelStyle}>
        Título da aba <span style={{ color: 'var(--destructive)' }}>*</span>
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex: Quem somos, Histórico, Equipe…"
        style={inputStyle}
        onFocus={focusPrimaryBorder}
        onBlur={blurDefaultBorder}
      />
    </div>
  );
};
