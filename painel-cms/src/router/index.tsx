import React from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppShell } from '../components/layout/AppShell';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Planos } from '../pages/Planos';
import { Midiateca } from '../pages/Midiateca';
import { Faqs } from '../pages/Faqs';
import { TextosList } from '../pages/TextosList';
import { TextosEditor } from '../pages/TextosEditor';
import { Usuarios } from '../pages/Usuarios';
import { Configuracoes } from '../pages/Configuracoes';

const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          color: 'var(--text-soft)',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        Carregando painel...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/planos" element={<Planos />} />
          <Route path="/midiateca" element={<Midiateca />} />
          <Route path="/faqs" element={<Faqs />} />
          <Route path="/textos" element={<TextosList />} />
          <Route path="/textos/novo" element={<TextosEditor />} />
          <Route path="/textos/:id" element={<TextosEditor />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
