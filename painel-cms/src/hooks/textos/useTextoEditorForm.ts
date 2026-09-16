import { useEffect, useState } from 'react';
import type { PaginaInstitucional, StrapiFile } from '../../lib/strapi';

export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD') // divide accent from letter
    .replace(/[̀-ͯ]/g, '') // remove accent symbols
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/[^\w-]+/g, '') // remove non-word chars
    .replace(/--+/g, '-'); // replace multiple hyphens
};

export interface TextoEditorFormState {
  titulo: string;
  slug: string;
  slugEditadoManualmente: boolean;
  isEditingSlugInline: boolean;
  conteudo: string;
  capa: StrapiFile | null;
  seoTitulo: string;
  seoDescricao: string;
}

const EMPTY_FORM: TextoEditorFormState = {
  titulo: '',
  slug: '',
  slugEditadoManualmente: false,
  isEditingSlugInline: false,
  conteudo: '',
  capa: null,
  seoTitulo: '',
  seoDescricao: '',
};

/**
 * Estado do formulário de edição de texto institucional.
 * Slug é recalculado automaticamente a partir do título, a menos que
 * o usuário já tenha editado o slug manualmente.
 */
export function useTextoEditorForm(
  pagina: PaginaInstitucional | null | undefined,
  isEditing: boolean
) {
  const [form, setForm] = useState<TextoEditorFormState>(EMPTY_FORM);

  useEffect(() => {
    if (isEditing && pagina) {
      setForm({
        titulo: pagina.titulo,
        slug: pagina.slug,
        slugEditadoManualmente: false,
        isEditingSlugInline: false,
        conteudo: pagina.conteudo || '',
        capa: pagina.capa || null,
        seoTitulo: pagina.seo_meta_titulo || '',
        seoDescricao: pagina.seo_meta_descricao || '',
      });
    } else if (!isEditing) {
      setForm(EMPTY_FORM);
    }
  }, [isEditing, pagina]);

  const updateField = <K extends keyof TextoEditorFormState>(
    key: K,
    value: TextoEditorFormState[K]
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleTituloChange = (novoTitulo: string) => {
    setForm((f) => ({
      ...f,
      titulo: novoTitulo,
      slug: f.slugEditadoManualmente ? f.slug : slugify(novoTitulo),
    }));
  };

  const handleSlugChange = (novoSlug: string) => {
    setForm((f) => ({ ...f, slug: slugify(novoSlug), slugEditadoManualmente: true }));
  };

  const handleResetSlug = () => {
    setForm((f) => ({
      ...f,
      slug: slugify(f.titulo),
      slugEditadoManualmente: false,
      isEditingSlugInline: false,
    }));
  };

  return { form, updateField, handleTituloChange, handleSlugChange, handleResetSlug };
}
