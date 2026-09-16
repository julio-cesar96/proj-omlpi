import type React from 'react';

export const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '42px',
  padding: '0 14px',
  borderRadius: '11px',
  border: '1px solid var(--border)',
  background: 'var(--bg)',
  fontSize: '13.5px',
  color: 'var(--text)',
  outline: 'none',
  fontFamily: 'var(--font-body)',
  boxSizing: 'border-box',
  transition: 'border-color .15s ease',
};

export const labelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: 'var(--text)',
  fontFamily: 'var(--font-body)',
};

export function focusPrimaryBorder(
  e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
) {
  e.currentTarget.style.borderColor = 'var(--primary)';
}

export function blurDefaultBorder(
  e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
) {
  e.currentTarget.style.borderColor = 'var(--border)';
}
