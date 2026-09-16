import React from 'react';
import { SobreSectionPage } from '../components/sobre/SobreSectionPage';
import { parseSobreText } from '../lib/frontmatter';
import type { Sobre as SobreRecord } from '../lib/strapi';

// Filtra registros de memória/histórico pelo título ou por metadados de frontmatter
function isMemoriaHistorico(s: SobreRecord): boolean {
  const t = s.title?.toLowerCase() ?? '';
  const parsed = parseSobreText(s.text);
  const label = parsed.meta.section_label?.toLowerCase() ?? '';
  const title = parsed.meta.section_title?.toLowerCase() ?? '';

  return (
    t.includes('memória') ||
    t.includes('memoria') ||
    t.includes('histórico') ||
    t.includes('historico') ||
    label.includes('memória') ||
    label.includes('memoria') ||
    title.includes('histórico') ||
    title.includes('historico')
  );
}

export const Memoria: React.FC = () => {
  return (
    <SobreSectionPage
      filterPredicate={isMemoriaHistorico}
      defaultSectionType="historico"
      copy={{
        pageTitle: 'Memória / Histórico',
        renderDescription: () => 'Gerencie os textos, imagens e rótulos da seção Histórico do site.',
        newButtonLabel: 'Novo registro',
        emptyIcon: '🕐',
        emptyTitle: 'Nenhum registro de Memória / Histórico cadastrado.',
        emptySubtitle: 'Clique abaixo para criar o registro da seção Histórico.',
        emptyActionLabel: 'Criar Histórico',
        toastCreateDraft: 'Registro de Histórico criado como rascunho.',
        toastUpdateDraft: 'Rascunho salvo.',
        toastCreatePublish: 'Registro de Histórico criado e publicado.',
        toastUpdateAlreadyPublished: 'Registro atualizado.',
        toastUpdatePublished: 'Registro publicado com sucesso.',
        toastDeleteSuccess: 'Registro excluído.',
        errorSaveDraft: 'Erro ao salvar rascunho.',
        errorPublish: 'Erro ao publicar.',
        errorDelete: 'Erro ao excluir registro.',
        deleteDialogTitle: 'Excluir registro',
        deleteDialogDescription: (title) =>
          `Tem certeza que deseja excluir o registro "${title}"? Esta ação não pode ser desfeita.`,
      }}
    />
  );
};
