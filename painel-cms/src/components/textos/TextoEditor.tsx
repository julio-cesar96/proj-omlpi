import React from 'react';
import { RichTextEditor } from './RichTextEditor';
import { ImageDropzone } from './ImageDropzone';
import { TextoTituloSlugHeader } from './TextoTituloSlugHeader';
import { TextoPublicacaoCard } from './TextoPublicacaoCard';
import { TextoSeoCard } from './TextoSeoCard';
import type { TextoEditorFormState } from '../../hooks/textos/useTextoEditorForm';
import type { PaginaInstitucional, StrapiFile } from '../../lib/strapi';

interface TextoEditorProps {
  pagina: PaginaInstitucional | null;
  form: TextoEditorFormState;
  onTituloChange: (val: string) => void;
  onSlugChange: (val: string) => void;
  onResetSlug: () => void;
  onToggleSlugEdit: (val: boolean) => void;
  onConteudoChange: (val: string) => void;
  onCapaChange: (file: StrapiFile | null) => void;
  onSeoTituloChange: (val: string) => void;
  onSeoDescricaoChange: (val: string) => void;
}

export const TextoEditor: React.FC<TextoEditorProps> = ({
  pagina,
  form,
  onTituloChange,
  onSlugChange,
  onResetSlug,
  onToggleSlugEdit,
  onConteudoChange,
  onCapaChange,
  onSeoTituloChange,
  onSeoDescricaoChange,
}) => {
  const isPublished = pagina?.published_at !== null && pagina?.published_at !== undefined;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
      {/* Coluna Principal */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow)',
          overflow: 'hidden',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <TextoTituloSlugHeader
          titulo={form.titulo}
          slug={form.slug}
          slugEditadoManualmente={form.slugEditadoManualmente}
          isEditingSlugInline={form.isEditingSlugInline}
          onTituloChange={onTituloChange}
          onSlugChange={onSlugChange}
          onResetSlug={onResetSlug}
          onToggleSlugEdit={onToggleSlugEdit}
        />

        {/* Editor Tiptap */}
        <RichTextEditor content={form.conteudo} onChange={onConteudoChange} />
      </div>

      {/* Coluna Lateral */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TextoPublicacaoCard isPublished={isPublished} updatedAt={pagina?.updated_at} />

        {/* Card Imagem de Capa */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow)',
            padding: '16px 18px',
          }}
        >
          <ImageDropzone
            file={form.capa}
            onUploadSuccess={onCapaChange}
            onRemove={() => onCapaChange(null)}
          />
        </div>

        <TextoSeoCard
          seoTitulo={form.seoTitulo}
          seoDescricao={form.seoDescricao}
          slug={form.slug}
          onSeoTituloChange={onSeoTituloChange}
          onSeoDescricaoChange={onSeoDescricaoChange}
          onSlugChange={onSlugChange}
        />
      </div>
    </div>
  );
};
