const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'https://omlpi-strapi.rnpiobserva.org.br';

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const jwt = sessionStorage.getItem('cms_jwt');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    ...(init.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${STRAPI_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    sessionStorage.removeItem('cms_jwt');
    sessionStorage.removeItem('cms_user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  return response;
}
