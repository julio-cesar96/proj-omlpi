import React, { Suspense } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppShell } from '../components/layout/AppShell';

// Login carregado de forma síncrona (tela de entrada — sem autenticação ainda)
import { Login } from '../pages/Login';

// Páginas carregadas de forma lazy (geram chunks separados no build)
const Dashboard     = React.lazy(() => import('../pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Planos        = React.lazy(() => import('../pages/Planos').then(m => ({ default: m.Planos })));
const Localidades   = React.lazy(() => import('../pages/Localidades').then(m => ({ default: m.Localidades })));
const Midiateca     = React.lazy(() => import('../pages/Midiateca').then(m => ({ default: m.Midiateca })));
const Faqs          = React.lazy(() => import('../pages/Faqs').then(m => ({ default: m.Faqs })));
const TextosList    = React.lazy(() => import('../pages/TextosList').then(m => ({ default: m.TextosList })));
const TextosEditor  = React.lazy(() => import('../pages/TextosEditor').then(m => ({ default: m.TextosEditor })));
const Usuarios      = React.lazy(() => import('../pages/Usuarios').then(m => ({ default: m.Usuarios })));
const Configuracoes = React.lazy(() => import('../pages/Configuracoes').then(m => ({ default: m.Configuracoes })));
const Inicio        = React.lazy(() => import('../pages/Inicio').then(m => ({ default: m.Inicio })));
const Sobre         = React.lazy(() => import('../pages/Sobre').then(m => ({ default: m.Sobre })));
const Guias         = React.lazy(() => import('../pages/Guias').then(m => ({ default: m.Guias })));


/** Fallback minimalista exibido enquanto o chunk da página carrega */
const PageLoader: React.FC = () => (
  <div
    style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      color: 'var(--text-soft)',
      fontSize: '14px',
      fontWeight: 600,
    }}
  >
    Carregando...
  </div>
);

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
      <Suspense fallback={<PageLoader />}>
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
            <Route path="/dashboard"      element={<Dashboard />} />
            <Route path="/inicio"         element={<Inicio />} />
            <Route path="/planos"         element={<Planos />} />
            <Route path="/localidades"    element={<Localidades />} />
            <Route path="/midiateca"      element={<Midiateca />} />
            <Route path="/guias"          element={<Guias />} />

            <Route path="/faqs"           element={<Faqs />} />
            <Route path="/textos"         element={<TextosList />} />
            <Route path="/textos/novo"    element={<TextosEditor />} />
            <Route path="/textos/:id"     element={<TextosEditor />} />
            <Route path="/sobre"          element={<Sobre />} />
            <Route path="/usuarios"       element={<Usuarios />} />
            <Route path="/configuracoes"  element={<Configuracoes />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

