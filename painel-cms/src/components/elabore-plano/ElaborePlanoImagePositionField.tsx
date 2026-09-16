import React from 'react';
import { inputStyle, labelStyle } from './elaborePlanoFormStyles';

interface ElaborePlanoImagePositionFieldProps {
  value: 'topo' | 'esquerda' | 'direita';
  onChange: (value: 'topo' | 'esquerda' | 'direita') => void;
  disabled: boolean;
}

export const ElaborePlanoImagePositionField: React.FC<ElaborePlanoImagePositionFieldProps> = ({
  value,
  onChange,
  disabled,
}) => {
  return (
    <div>
      <label htmlFor="image-position" style={labelStyle}>
        Posição da Imagem de Capa
      </label>
      <select
        id="image-position"
        value={value}
        onChange={(e) => onChange(e.target.value as 'topo' | 'esquerda' | 'direita')}
        disabled={disabled}
        style={inputStyle}
      >
        <option value="topo">Topo — imagem acima do texto (padrão)</option>
        <option value="esquerda">Esquerda — imagem à esquerda, texto à direita</option>
        <option value="direita">Direita — imagem à direita, texto à esquerda</option>
      </select>
      <p style={{ margin: '5px 0 0', fontSize: '12px', color: 'var(--text-soft)' }}>
        Define o layout da seção no site. Requer uma imagem de capa carregada para ter efeito.
      </p>
    </div>
  );
};
