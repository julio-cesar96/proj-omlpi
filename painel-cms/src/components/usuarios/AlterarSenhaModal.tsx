import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';

interface AlterarSenhaModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (novaSenha: string) => Promise<void>;
}

export const AlterarSenhaModal: React.FC<AlterarSenhaModalProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showNova, setShowNova] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset ao abrir/fechar
  useEffect(() => {
    if (open) {
      setNovaSenha('');
      setConfirmar('');
      setShowNova(false);
      setShowConfirmar(false);
      setErro(null);
      setSalvando(false);
      setSucesso(false);
      // Foco automático
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  if (!open) return null;

  const forca = (() => {
    if (novaSenha.length === 0) return 0;
    let score = 0;
    if (novaSenha.length >= 8) score++;
    if (novaSenha.length >= 12) score++;
    if (/[A-Z]/.test(novaSenha)) score++;
    if (/[0-9]/.test(novaSenha)) score++;
    if (/[^A-Za-z0-9]/.test(novaSenha)) score++;
    return score; // 0–5
  })();

  const forcaLabel = ['', 'Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'];
  const forcaCor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];

  const validate = () => {
    if (novaSenha.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
    if (novaSenha !== confirmar) return 'As senhas não coincidem.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setErro(err); return; }
    setErro(null);
    setSalvando(true);
    try {
      await onSave(novaSenha);
      setSucesso(true);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao alterar senha.');
      setSalvando(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    height: '42px',
    padding: '0 12px',
    borderRadius: '10px',
    border: '1.5px solid var(--border)',
    background: 'var(--input, var(--muted))',
    color: 'var(--text)',
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color .15s ease',
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={!salvando ? onClose : undefined}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(44,44,20,.32)',
          zIndex: 300,
          animation: 'fadeIn .2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '420px',
            maxWidth: 'calc(100vw - 32px)',
            background: 'var(--card)',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            animation: 'slideUp .25s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px 16px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(var(--primary-rgb, 74,107,60),.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <KeyRound size={17} color="var(--primary)" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-h)', letterSpacing: '-.2px' }}>
                  Alterar minha senha
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-soft)' }}>
                  Você será desconectado após salvar
                </p>
              </div>
            </div>
            {!salvando && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-soft)',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Body */}
          <div style={{ padding: '24px' }}>
            {sucesso ? (
              /* Estado de sucesso */
              <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
                <CheckCircle2 size={48} color="var(--success, #16a34a)" style={{ marginBottom: '12px' }} />
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-h)' }}>
                  Senha alterada com sucesso!
                </p>
                <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-soft)' }}>
                  Você será desconectado em instantes…
                </p>
              </div>
            ) : (
              <form id="alterar-senha-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Campo: Nova senha */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                    Nova senha
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      ref={inputRef}
                      id="nova-senha"
                      type={showNova ? 'text' : 'password'}
                      value={novaSenha}
                      onChange={(e) => { setNovaSenha(e.target.value); setErro(null); }}
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                      style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNova((v) => !v)}
                      tabIndex={-1}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-soft)',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {showNova ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Barra de força */}
                  {novaSenha.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: '3px',
                              borderRadius: '2px',
                              background: i <= forca ? forcaCor[forca] : 'var(--border)',
                              transition: 'background .2s',
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '11px', color: forcaCor[forca], fontWeight: 600 }}>
                        {forcaLabel[forca]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Campo: Confirmar senha */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                    Confirmar nova senha
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      id="confirmar-senha"
                      type={showConfirmar ? 'text' : 'password'}
                      value={confirmar}
                      onChange={(e) => { setConfirmar(e.target.value); setErro(null); }}
                      placeholder="Repita a nova senha"
                      autoComplete="new-password"
                      style={{
                        ...inputStyle,
                        borderColor: confirmar.length > 0 && confirmar !== novaSenha
                          ? 'var(--destructive)'
                          : undefined,
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          confirmar.length > 0 && confirmar !== novaSenha
                            ? 'var(--destructive)'
                            : 'var(--border)';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmar((v) => !v)}
                      tabIndex={-1}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-soft)',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {showConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Erro */}
                {erro && (
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--destructive)', fontWeight: 600 }}>
                    {erro}
                  </p>
                )}
              </form>
            )}
          </div>

          {/* Footer */}
          {!sucesso && (
            <div
              style={{
                padding: '0 24px 22px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={salvando}
                style={{
                  height: '40px',
                  padding: '0 18px',
                  borderRadius: '11px',
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--text)',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: salvando ? 'not-allowed' : 'pointer',
                  opacity: salvando ? 0.5 : 1,
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="alterar-senha-form"
                disabled={salvando}
                style={{
                  height: '40px',
                  padding: '0 22px',
                  borderRadius: '11px',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 800,
                  border: 'none',
                  boxShadow: 'var(--shadow-btn)',
                  cursor: salvando ? 'not-allowed' : 'pointer',
                  opacity: salvando ? 0.65 : 1,
                  transition: 'opacity .2s',
                }}
              >
                {salvando ? 'Salvando…' : 'Salvar senha'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
