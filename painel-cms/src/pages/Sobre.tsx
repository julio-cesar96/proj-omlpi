import React from 'react';
import { SobreSectionPage } from '../components/sobre/SobreSectionPage';
import type { Sobre as SobreRecord } from '../lib/strapi';

// Filtra abas pertencentes à seção Quem Somos (exclui Histórico / Memória, que tem aba própria)
function isQuemSomos(s: SobreRecord): boolean {
  const t = s.title?.toLowerCase() ?? '';
  return !t.includes('histórico') && !t.includes('historico') && !t.includes('memória') && !t.includes('memoria');
}

export const Sobre: React.FC = () => {
  return (
    <SobreSectionPage
      filterPredicate={isQuemSomos}
      defaultSectionType="sobre"
      copy={{
        pageTitle: 'Quem Somos',
        renderDescription: (count) => (
          <>
            {count === 0
              ? 'Nenhuma aba cadastrada'
              : `${count} aba${count > 1 ? 's' : ''} cadastrada${count > 1 ? 's' : ''}`}
            {' · '}
            <span style={{ fontStyle: 'italic' }}>
              ordem por data de criação — reordenação requer campo extra no Strapi
            </span>
          </>
        ),
        newButtonLabel: 'Nova aba',
        emptyIcon: '📄',
        emptyTitle: 'Nenhuma aba de "Quem Somos" cadastrada ainda.',
        emptySubtitle: 'Clique em "Nova aba" para criar a primeira.',
        toastCreateDraft: 'Aba criada como rascunho.',
        toastUpdateDraft: 'Rascunho salvo.',
        toastCreatePublish: 'Aba criada e publicada.',
        toastUpdateAlreadyPublished: 'Aba atualizada.',
        toastUpdatePublished: 'Aba publicada com sucesso.',
        toastDeleteSuccess: 'Aba excluída.',
        errorSaveDraft: 'Erro ao salvar rascunho.',
        errorPublish: 'Erro ao publicar.',
        errorDelete: 'Erro ao excluir aba.',
        deleteDialogTitle: 'Excluir aba',
        deleteDialogDescription: (title) =>
          `Tem certeza que deseja excluir a aba "${title}"? Esta ação não pode ser desfeita.`,
      }}
    />
  );
};
