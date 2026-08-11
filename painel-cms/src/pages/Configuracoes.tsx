import React, { useState, useEffect } from 'react';
import { useConfiguracoes } from '../hooks/configuracoes/useConfiguracoes';
import { Toast } from '../components/ui/Toast';
import type { CmsConfig } from '../lib/strapi';

// ─── Tipos e constantes ──────────────────────────────────────────────────────

type TabKey = 'geral' | 'marca' | 'notificacoes' | 'integracoes';

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

// ─── Toggle component ────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  id: string;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, disabled = false, id }) => (
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

// ─── Tela principal ──────────────────────────────────────────────────────────

export const Configuracoes: React.FC = () => {
  const { config, isLoading, saveConfig, isSaving } = useConfiguracoes();

  const [activeTab, setActiveTab] = useState<TabKey>('geral');
  const [draft, setDraft] = useState<CmsConfig | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  // Inicializar draft quando os dados chegam
  useEffect(() => {
    if (config && draft === null) {
      setDraft(config);
    }
  }, [config, draft]);

  const showToast = (message: string) => setToast({ visible: true, message });

  const handleDiscard = () => {
    if (config) setDraft({ ...config });
  };

  const handleSave = async () => {
    if (!draft) return;
    try {
      await saveConfig(draft);
      showToast('Configurações salvas.');
    } catch {
      showToast('Erro ao salvar configurações. Tente novamente.');
    }
  };

  const setField = <K extends keyof CmsConfig>(key: K, value: CmsConfig[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  // ─── Tabs ────────────────────────────────────────────────────────────────

  const tabs: { key: TabKey; label: string; disabled: boolean }[] = [
    { key: 'geral', label: 'Geral', disabled: false },
    { key: 'marca', label: 'Marca', disabled: true },
    { key: 'notificacoes', label: 'Notificações', disabled: true },
    { key: 'integracoes', label: 'Integrações', disabled: true },
  ];

  // ─── Skeleton de loading ──────────────────────────────────────────────────

  if (isLoading || !draft) {
    return (
      <div style={{ animation: 'fadeIn .3s ease', maxWidth: '820px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-.5px' }}>
            Configurações
          </h1>
          <p style={{ color: 'var(--text-soft)', fontSize: '14px', margin: '4px 0 0' }}>
            Preferências gerais do painel de conteúdo.
          </p>
        </div>
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '40px 24px',
          textAlign: 'center',
          color: 'var(--text-soft)',
          fontSize: '14px',
        }}>
          Carregando configurações…
        </div>
      </div>
    );
  }

  // ─── Render principal ─────────────────────────────────────────────────────

  return (
    <div style={{ animation: 'fadeIn .3s ease', maxWidth: '820px' }}>
      {/* Cabeçalho */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-.5px' }}>
          Configurações
        </h1>
        <p style={{ color: 'var(--text-soft)', fontSize: '14px', margin: '4px 0 0' }}>
          Preferências gerais do painel de conteúdo.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '2px',
        borderBottom: '1px solid var(--border)',
        marginBottom: '22px',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            onClick={() => !tab.disabled && setActiveTab(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13.5px',
              fontWeight: activeTab === tab.key ? 700 : 600,
              padding: '10px 14px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
              color: tab.disabled
                ? 'rgba(122,118,99,0.4)'
                : activeTab === tab.key
                  ? 'var(--text)'
                  : 'var(--text-soft)',
              cursor: tab.disabled ? 'not-allowed' : 'pointer',
              marginBottom: '-1px',
              transition: 'color 0.15s',
            }}
          >
            {tab.label}
            {tab.disabled && (
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '.3px',
                background: 'var(--muted)',
                color: 'var(--text-soft)',
                padding: '2px 6px',
                borderRadius: '6px',
                textTransform: 'uppercase',
              }}>
                Em breve
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Aba Geral */}
      {activeTab === 'geral' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Card: Informações do site */}
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

              {/* Nome do site */}
              <div>
                <label
                  htmlFor="config-site-name"
                  style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '7px' }}
                >
                  Nome do site
                </label>
                <input
                  id="config-site-name"
                  value={draft.site_name}
                  onChange={(e) => setField('site_name', e.target.value)}
                  style={fieldStyle}
                />
              </div>

              {/* URL base */}
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
                  value={draft.site_url}
                  onChange={(e) => setField('site_url', e.target.value)}
                  style={fieldStyle}
                />
              </div>

              {/* Idioma padrão */}
              <div>
                <label
                  htmlFor="config-idioma"
                  style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '7px' }}
                >
                  Idioma padrão
                </label>
                <select
                  id="config-idioma"
                  value={draft.idioma_padrao}
                  onChange={(e) => setField('idioma_padrao', e.target.value)}
                  style={fieldStyle}
                >
                  {IDIOMAS.map((i) => (
                    <option key={i.value} value={i.value}>{i.label}</option>
                  ))}
                </select>
              </div>

              {/* Fuso horário */}
              <div>
                <label
                  htmlFor="config-fuso"
                  style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '7px' }}
                >
                  Fuso horário
                </label>
                <select
                  id="config-fuso"
                  value={draft.fuso_horario}
                  onChange={(e) => setField('fuso_horario', e.target.value)}
                  style={fieldStyle}
                >
                  {FUSOS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Card: Fluxo editorial */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)',
            padding: '20px 22px',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '6px' }}>
              Fluxo editorial
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-soft)', margin: '0 0 16px' }}>
              Controle o comportamento de publicação do conteúdo.
            </p>

            {/* Toggle: Exigir revisão */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '12px 0',
              borderBottom: '1px solid var(--border)',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <label
                    htmlFor="toggle-require-review"
                    style={{ fontSize: '13.5px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Exigir revisão antes de publicar
                  </label>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '.3px',
                    background: '#FDE7DE',
                    color: 'var(--primary)',
                    padding: '2px 7px',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                  }}>
                    Pendente
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-soft)', lineHeight: 1.5 }}>
                  Conteúdo passa por Revisor antes de ir ao ar.{' '}
                  <span style={{ fontStyle: 'italic' }}>
                    Salvo, mas sem efeito operacional nesta fase — requer paridade de schema entre Planos, FAQ e Textos.
                  </span>
                </div>
              </div>
              <Toggle
                id="toggle-require-review"
                checked={draft.require_review}
                onChange={(v) => setField('require_review', v)}
              />
            </div>

            {/* Toggle: Autosave */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '12px 0',
            }}>
              <div>
                <label
                  htmlFor="toggle-autosave"
                  style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, marginBottom: '3px', cursor: 'pointer' }}
                >
                  Salvamento automático de rascunhos
                </label>
                <div style={{ fontSize: '12px', color: 'var(--text-soft)', lineHeight: 1.5 }}>
                  Salva rascunho automaticamente alguns segundos após cada alteração.
                  Nunca publica automaticamente — apenas salva o estado atual como rascunho.
                </div>
              </div>
              <Toggle
                id="toggle-autosave"
                checked={draft.autosave_enabled}
                onChange={(v) => setField('autosave_enabled', v)}
              />
            </div>
          </div>

          {/* Footer de ações */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingBottom: '8px' }}>
            <button
              id="config-discard"
              onClick={handleDiscard}
              disabled={isSaving}
              style={{
                height: '44px',
                padding: '0 18px',
                borderRadius: '11px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                fontSize: '13.5px',
                fontWeight: 700,
                color: 'var(--text)',
                cursor: 'pointer',
                opacity: isSaving ? 0.5 : 1,
              }}
            >
              Descartar
            </button>
            <button
              id="config-save"
              onClick={handleSave}
              disabled={isSaving}
              style={{
                height: '44px',
                padding: '0 22px',
                borderRadius: '11px',
                background: isSaving ? 'rgba(242,93,39,0.6)' : 'var(--primary)',
                color: '#fff',
                fontSize: '13.5px',
                fontWeight: 800,
                boxShadow: 'var(--shadow-btn)',
                cursor: isSaving ? 'wait' : 'pointer',
                border: 'none',
                transition: 'background 0.15s',
              }}
            >
              {isSaving ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>

        </div>
      )}

      <Toast
        message={toast.message}
        visible={toast.visible}
        onHide={() => setToast({ visible: false, message: '' })}
      />
    </div>
  );
};

// ─── Estilos compartilhados ──────────────────────────────────────────────────

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
