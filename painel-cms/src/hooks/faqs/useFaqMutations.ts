import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { Faq, FaqPayload } from '../../lib/strapi';

export function useFaqMutations() {
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['faqs'] });
    queryClient.invalidateQueries({ queryKey: ['faqs-count'] });
  };

  // ─── Criar FAQ ────────────────────────────────────────────────────────────
  // Recebe `faqsAtuais` para calcular o próximo `ordem` sem depender de um
  // estado externo — a nova FAQ sempre entra no final da lista.
  const createFaq = useMutation<Faq, Error, { payload: FaqPayload; faqsAtuais: Faq[] }>({
    mutationFn: async ({ payload, faqsAtuais }) => {
      // Calcular próxima ordem: máximo dos valores existentes + 1.
      // FAQs com ordem null contam como 0 para o cálculo.
      const nextOrdem = Math.max(0, ...faqsAtuais.map((f) => f.ordem ?? 0)) + 1;

      // published_at sempre explícito no payload (nunca omitido).
      // Omitir aciona o bug de auto-publicação do Strapi v3 (documentado em fase-2-planos.md).
      const fullPayload: FaqPayload = { ...payload, ordem: nextOrdem };

      const res = await apiFetch('/faqs', {
        method: 'POST',
        body: JSON.stringify(fullPayload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || 'Erro ao criar FAQ.');
      }
      return res.json();
    },
    onSuccess: invalidateQueries,
  });

  // ─── Atualizar FAQ ────────────────────────────────────────────────────────
  const updateFaq = useMutation<Faq, Error, { id: number; payload: Partial<FaqPayload> }>({
    mutationFn: async ({ id, payload }) => {
      const res = await apiFetch(`/faqs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || 'Erro ao atualizar FAQ.');
      }
      return res.json();
    },
    onSuccess: invalidateQueries,
  });

  // ─── Excluir FAQ ──────────────────────────────────────────────────────────
  // Se retornar 403: habilitar permissão `delete` para a role `Authenticated`
  // em Settings → Roles → Authenticated → FAQ no Strapi Admin.
  const deleteFaq = useMutation<void, Error, { id: number }>({
    mutationFn: async ({ id }) => {
      const res = await apiFetch(`/faqs/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error(
            'Sem permissão para excluir. Habilite "delete" para Authenticated em Settings → Roles no Strapi Admin.'
          );
        }
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || 'Erro ao excluir FAQ.');
      }
    },
    onSuccess: invalidateQueries,
  });

  // ─── Reordenar FAQs (Opção A: N PUTs paralelos) ───────────────────────────
  // Recebe a lista na nova ordem desejada (já reordenada localmente pelo DnD).
  // Calcula o novo `ordem` (1-indexed) para cada item, filtra apenas os que
  // mudaram e dispara um PUT por FAQ afetada em paralelo.
  const reorderFaqs = useMutation<void, Error, Faq[]>({
    mutationFn: async (newOrderedList) => {
      const updates = newOrderedList
        .map((faq, index) => ({ faq, newOrdem: index + 1 }))
        .filter(({ faq, newOrdem }) => faq.ordem !== newOrdem);

      if (updates.length === 0) return;

      await Promise.all(
        updates.map(({ faq, newOrdem }) =>
          apiFetch(`/faqs/${faq.id}`, {
            method: 'PUT',
            body: JSON.stringify({ ordem: newOrdem }),
          })
        )
      );
    },
    onSuccess: invalidateQueries,
    onError: () => {
      invalidateQueries();
    },
  });

  // ─── Seed de ordem para FAQs com ordem null/duplicada ────────────────────
  // Disparado automaticamente na primeira carga da tela de FAQs quando
  // detectado que alguma FAQ tem ordem null. Atribui ordem = index + 1
  // baseado na ordem de created_at (ASC). Idempotente: se todas as FAQs
  // já tiverem ordem válido e único, não dispara nada.
  const seedOrdem = useMutation<void, Error, Faq[]>({
    mutationFn: async (faqsParaSeed) => {
      if (faqsParaSeed.length === 0) return;

      // Ordenar por created_at ASC para seed determinístico
      const sorted = [...faqsParaSeed].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      await Promise.all(
        sorted.map((faq, index) =>
          apiFetch(`/faqs/${faq.id}`, {
            method: 'PUT',
            body: JSON.stringify({ ordem: index + 1 }),
          })
        )
      );
    },
    onSuccess: invalidateQueries,
  });

  return {
    createFaq,
    updateFaq,
    deleteFaq,
    reorderFaqs,
    seedOrdem,
  };
}
