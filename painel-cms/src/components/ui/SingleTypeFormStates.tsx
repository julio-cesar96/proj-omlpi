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
  <div className="py-10 px-12" style={maxWidth ? { maxWidth } : undefined}>
    <div className="h-7 w-60 bg-muted rounded-lg mb-8 animate-pulse" />
    {Array.from({ length: rows }, (_, idx) => idx + 1).map((i) => (
      <div key={i} className="mb-6">
        <div className="h-[13px] bg-muted rounded-md mb-2" style={{ width: labelWidth }} />
        <div
          className="bg-muted rounded-[10px]"
          style={{ height: i === tallRowIndex ? tallHeight : '42px' }}
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
  <div className="py-10 px-12">
    <div className="flex items-center gap-3 bg-[rgba(220,60,60,0.08)] border border-[rgba(220,60,60,0.22)] rounded-xl py-[18px] px-5 max-w-[480px]">
      <AlertCircle size={20} color="var(--danger, #dc3c3c)" />
      <div className="flex-1">
        <div className="font-bold text-sm text-[var(--danger,#dc3c3c)]">
          {title}
        </div>
        <div className="text-[13px] text-muted-foreground mt-0.5">
          {message}
        </div>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 py-[7px] px-3.5 rounded-lg bg-muted border-0 cursor-pointer text-[13px] font-semibold text-foreground"
      >
        <RefreshCw size={14} />
        Tentar novamente
      </button>
    </div>
  </div>
);
