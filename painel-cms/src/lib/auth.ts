export interface AuthPayload {
  identifier: string;
  password: string;
}

export interface StrapiRole {
  id: number;
  name: string;
  description?: string;
  type?: string;
}

export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  role?: StrapiRole;
}

export interface AuthResponse {
  jwt: string;
  user: StrapiUser;
}

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'https://omlpi-strapi.rnpiobserva.org.br';

export async function loginUser(payload: AuthPayload): Promise<AuthResponse> {
  const res = await fetch(`${STRAPI_URL}/auth/local`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData?.message?.[0]?.messages?.[0]?.message || 'Credenciais inválidas ou erro no servidor.';
    throw new Error(message);
  }

  return res.json();
}
