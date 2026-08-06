import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { StrapiUsuario, UsuarioPayload, UsuarioUpdatePayload } from '../../lib/strapi';

/** Gera uma senha temporária forte: 14+ chars, maiúsculas/minúsculas/números/símbolos */
export function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%&*-_+=?';

  // Garantir pelo menos 2 de cada categoria
  const pick = (set: string, n: number) =>
    Array.from({ length: n }, () => set[Math.floor(Math.random() * set.length)]).join('');

  const mandatory = pick(upper, 2) + pick(lower, 2) + pick(digits, 2) + pick(symbols, 2);
  const all = upper + lower + digits + symbols;
  const rest = pick(all, 6); // total = 14

  return (mandatory + rest)
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

export function useUsuarioMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['usuarios'] });
  };

  /**
   * Cria um usuário novo.
   * Retorna { usuario, senhaTemporaria } para que o caller possa exibir a senha
   * uma única vez no modal, sem armazená-la em estado global.
   */
  const createUsuario = useMutation<
    { usuario: StrapiUsuario; senhaTemporaria: string },
    Error,
    Omit<UsuarioPayload, 'password'>
  >({
    mutationFn: async (payload) => {
      const senhaTemporaria = generateTempPassword();
      const fullPayload: UsuarioPayload = {
        ...payload,
        password: senhaTemporaria,
        confirmed: true,
        blocked: false,
      };
      const res = await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(fullPayload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro ao criar usuário.');
      }
      const usuario: StrapiUsuario = await res.json();
      return { usuario, senhaTemporaria };
    },
    onSuccess: invalidate,
  });

  /** Atualiza username, email ou role de um usuário existente */
  const updateUsuario = useMutation<
    StrapiUsuario,
    Error,
    { id: number; payload: UsuarioUpdatePayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const res = await apiFetch(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro ao atualizar usuário.');
      }
      return res.json();
    },
    onSuccess: invalidate,
  });

  /**
   * Bloqueia ou desbloqueia um usuário (reversível — nunca DELETE).
   * O usuário logado não pode bloquear a si mesmo (validação no caller).
   */
  const toggleBloqueio = useMutation<
    StrapiUsuario,
    Error,
    { id: number; blocked: boolean }
  >({
    mutationFn: async ({ id, blocked }) => {
      const res = await apiFetch(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ blocked }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro ao alterar status do usuário.');
      }
      return res.json();
    },
    onSuccess: invalidate,
  });

  return { createUsuario, updateUsuario, toggleBloqueio };
}
