import React from 'react';

const IDIOMAS = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en', label: 'English' },
];

const FUSOS = [
  { value: 'America/Recife', label: 'America/Recife (GMT-3)' },
  { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo (GMT-3)' },
  { value: 'America/Manaus', label: 'America/Manaus (GMT-4)' },
  { value: 'America/Belem', label: 'America/Belem (GMT-3)' },
  { value: 'UTC', label: 'UTC (GMT+0)' },
];

const fieldStyle: React.CSSProperties = {
  width: '100%',
  height: '44px',
  padding: '0 14px',
  borderRadius: '11px',
  border: '1px solid var(--border)',
  background: 'var(--bg)',
  fontSize: '14px',
  color: 'var(--text)',
  outline: 'none',
  fontFamily: 'var(--font-body)',
  appearance: 'none',
  WebkitAppearance: 'none',
};

interface ConfiguracoesSiteInfoCardProps {
  siteName: string;
  siteUrl: string;
  idiomaPadrao: string;
  fusoHorario: string;
  onChangeSiteName: (value: string) => void;
  onChangeSiteUrl: (value: string) => void;
  onChangeIdiomaPadrao: (value: string) => void;
  onChangeFusoHorario: (value: string) => void;
}

export const ConfiguracoesSiteInfoCard: React.FC<ConfiguracoesSiteInfoCardProps> = ({
  siteName,
  siteUrl,
  idiomaPadrao,
  fusoHorario,
  onChangeSiteName,
  onChangeSiteUrl,
  onChangeIdiomaPadrao,
  onChangeFusoHorario,
}) => (
  <div style={{
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
    padding: '20px 22px',
  }}>
    <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '4px' }}>
      Informações do site
    </h3>
    <p style={{ fontSize: '12.5px', color: 'var(--text-soft)', margin: '0 0 16px' }}>
      Dados de referência — não consumidos pelo site ainda (preparação para uso futuro).
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

      <div>
        <label
          htmlFor="config-site-name"
          style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '7px' }}
        >
          Nome do site
        </label>
        <input
          id="config-site-name"
          value={siteName}
          onChange={(e) => onChangeSiteName(e.target.value)}
          style={fieldStyle}
        />
      </div>

      <div>
        <label
          htmlFor="config-site-url"
          style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '7px' }}
        >
          URL base
        </label>
        <input
          id="config-site-url"
          type="url"
          value={siteUrl}
          onChange={(e) => onChangeSiteUrl(e.target.value)}
          style={fieldStyle}
        />
      </div>

      <div>
        <label
          htmlFor="config-idioma"
          style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '7px' }}
        >
          Idioma padrão
        </label>
        <select
          id="config-idioma"
          value={idiomaPadrao}
          onChange={(e) => onChangeIdiomaPadrao(e.target.value)}
          style={fieldStyle}
        >
          {IDIOMAS.map((i) => (
            <option key={i.value} value={i.value}>{i.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="config-fuso"
          style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '7px' }}
        >
          Fuso horário
        </label>
        <select
          id="config-fuso"
          value={fusoHorario}
          onChange={(e) => onChangeFusoHorario(e.target.value)}
          style={fieldStyle}
        >
          {FUSOS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

    </div>
  </div>
);
