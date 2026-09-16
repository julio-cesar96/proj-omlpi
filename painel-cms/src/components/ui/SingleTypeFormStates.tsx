import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface SingleTypeLoadingSkeletonProps {
  /** Quantas linhas de campo desenhar abaixo do título. */
  rows: number;
  /** Linha (1-indexed) que deve ser desenhada mais alta (ex: um textarea). */
  tallRowIndex: number;
  tallHeight?: string;
  labelWidth?: string;
  maxWidth?: string;
}

/**
 * Skeleton de carregamento compartilhado pelas telas de edição de singleType
 * (Banner, Elabore o Plano). Antes duplicado em Inicio.tsx e ElaborePlanoPage.tsx.
 */
export const SingleTypeLoadingSkeleton: React.FC<SingleTypeLoadingSkeletonProps> = ({
  rows,
  tallRowIndex,
  tallHeight = '90px',
  labelWidth = '100px',
  maxWidth,
}) => (
  <div style={{ padding: '40px 48px', ...(maxWidth ? { maxWidth } : {}) }}>
    <div
      style={{
        height: '28px',
        width: '240px',
        background: 'var(--muted)',
        borderRadius: '8px',
        marginBottom: '32px',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
    {Array.from({ length: rows }, (_, idx) => idx + 1).map((i) => (
      <div key={i} style={{ marginBottom: '24px' }}>
        <div
          style={{
            height: '13px',
            width: labelWidth,
            background: 'var(--muted)',
            borderRadius: '6px',
            marginBottom: '8px',
          }}
        />
        <div
          style={{
            height: i === tallRowIndex ? tallHeight : '42px',
            background: 'var(--muted)',
            borderRadius: '10px',
          }}
        />
      </div>
    ))}
  </div>
);

interface SingleTypeErrorBannerProps {
  title: string;
  message: string;
  onRetry: () => void;
}

/**
 * Banner de erro compartilhado pelas telas de edição de singleType.
 * Antes duplicado em Inicio.tsx e ElaborePlanoPage.tsx.
 */
export const SingleTypeErrorBanner: React.FC<SingleTypeErrorBannerProps> = ({
  title,
  message,
  onRetry,
}) => (
  <div style={{ padding: '40px 48px' }}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(220,60,60,0.08)',
        border: '1px solid rgba(220,60,60,0.22)',
        borderRadius: '12px',
        padding: '18px 20px',
        maxWidth: '480px',
      }}
    >
      <AlertCircle size={20} color="var(--danger, #dc3c3c)" />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--danger, #dc3c3c)' }}>
          {title}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-soft)', marginTop: '2px' }}>
          {message}
        </div>
      </div>
      <button
        onClick={onRetry}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '7px 14px',
          borderRadius: '8px',
          background: 'var(--muted)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text)',
        }}
      >
        <RefreshCw size={14} />
        Tentar novamente
      </button>
    </div>
  </div>
);
