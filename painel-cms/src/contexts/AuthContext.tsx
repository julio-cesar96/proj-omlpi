import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { loginUser } from '../lib/auth';
import type { StrapiUser, AuthPayload } from '../lib/auth';

interface AuthContextType {
  user: StrapiUser | null;
  jwt: string | null;
  loading: boolean;
  login: (payload: AuthPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StrapiUser | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedJwt = sessionStorage.getItem('cms_jwt');
    const storedUserStr = sessionStorage.getItem('cms_user');

    if (storedJwt && storedUserStr) {
      try {
        const parsedUser = JSON.parse(storedUserStr);
        setJwt(storedJwt);
        setUser(parsedUser);
      } catch (err) {
        sessionStorage.removeItem('cms_jwt');
        sessionStorage.removeItem('cms_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (payload: AuthPayload) => {
    const res = await loginUser(payload);
    sessionStorage.setItem('cms_jwt', res.jwt);
    sessionStorage.setItem('cms_user', JSON.stringify(res.user));
    setJwt(res.jwt);
    setUser(res.user);
  };

  const logout = () => {
    sessionStorage.removeItem('cms_jwt');
    sessionStorage.removeItem('cms_user');
    setJwt(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, jwt, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
