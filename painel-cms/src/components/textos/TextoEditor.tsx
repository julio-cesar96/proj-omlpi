import React from 'react';
import { RichTextEditor } from './RichTextEditor';
import { ImageDropzone } from './ImageDropzone';
import type { PaginaInstitucional, StrapiFile } from '../../lib/strapi';

interface TextoEditorProps {
  pagina: PaginaInstitucional | null;
  titulo: string;
  setTitulo: (val: string) => void;
  slug: string;
  setSlug: (val: string) => void;
  slugEditadoManualmente: boolean;
  setSlugEditadoManualmente: (val: boolean) => void;
  isEditingSlugInline: boolean;
  setIsEditingSlugInline: (val: boolean) => void;
  conteudo: string;
  setConteudo: (val: string) => void;
  capa: StrapiFile | null;
  setCapa: (file: StrapiFile | null) => void;
  seoTitulo: string;
  setSeoTitulo: (val: string) => void;
  seoDescricao: string;
  setSeoDescricao: (val: string) => void;
}

export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD') // divide accent from letter
    .replace(/[\u0300-\u036f]/g, '') // remove accent symbols
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/[^\w-]+/g, '') // remove non-word chars
    .replace(/--+/g, '-'); // replace multiple hyphens
};

export const TextoEditor: React.FC<TextoEditorProps> = ({
  pagina,
  titulo,
  setTitulo,
  slug,
  setSlug,
  slugEditadoManualmente,
  setSlugEditadoManualmente,
  isEditingSlugInline,
  setIsEditingSlugInline,
  conteudo,
  setConteudo,
  capa,
  setCapa,
  seoTitulo,
  setSeoTitulo,
  seoDescricao,
  setSeoDescricao,
}) => {
  // Recalcular slug automaticamente quando o título muda, se não for customizado
  const handleTituloChange = (newTitulo: string) => {
    setTitulo(newTitulo);
    if (!slugEditadoManualmente) {
      setSlug(slugify(newTitulo));
    }
  };

  const handleSlugChange = (newSlug: string) => {
    setSlug(slugify(newSlug));
    setSlugEditadoManualmente(true);
  };

  const handleResetSlug = () => {
    const defaultSlug = slugify(titulo);
    setSlug(defaultSlug);
    setSlugEditadoManualmente(false);
    setIsEditingSlugInline(false);
  };

  const isPublished = pagina?.published_at !== null && pagina?.published_at !== undefined;

  const formattedDate = pagina
    ? new Date(pagina.updated_at).toLocaleDateString('pt-BR')
    : '-';

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
        <div>
          {/* Título inline grande */}
          <input
            type="text"
            value={titulo}
            onChange={(e) => handleTituloChange(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-heading)',
              fontSize: '26px',
              fontWeight: 800,
              letterSpacing: '-.5px',
              outline: 'none',
              padding: '0 0 4px',
              color: 'var(--text)',
            }}
            placeholder="Título da página"
          />

          {/* URL / Slug display */}
          <div
            style={{
              fontSize: '13px',
              color: 'var(--text-soft)',
              fontWeight: 600,
              borderBottom: '1px solid var(--border)',
              paddingBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
            }}
          >
            <span>observarnpi.org.br/</span>
            
            {isEditingSlugInline ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '12px',
                    outline: 'none',
                    color: 'var(--text)',
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsEditingSlugInline(false)}
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  OK
                </button>
                {slugEditadoManualmente && (
                  <button
                    type="button"
                    onClick={handleResetSlug}
                    style={{
                      background: 'var(--muted)',
                      color: 'var(--text-soft)',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    title="Restaurar slug padrão do título"
                  >
                    Reset
                  </button>
                )}
              </div>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ color: 'var(--text)' }}>{slug || '...'}</strong>
                <button
                  type="button"
                  onClick={() => setIsEditingSlugInline(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Editar slug
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Editor Tiptap */}
        <RichTextEditor content={conteudo} onChange={setConteudo} />
      </div>

      {/* Coluna Lateral */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Card Publicação */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow)',
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px' }}>Publicação</div>
          
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', marginBottom: '10px', width: '100%', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-soft)', fontWeight: 600 }}>Status</span>
            <span
              style={{
                fontWeight: 700,
                color: isPublished ? '#17A649' : '#7a7663',
                background: isPublished ? 'var(--accent)' : 'var(--muted)',
                padding: '2px 10px',
                borderRadius: '20px',
                fontSize: '12px',
              }}
            >
              {isPublished ? 'Publicado' : 'Rascunho'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', marginBottom: '10px', width: '100%', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-soft)', fontWeight: 600 }}>Visibilidade</span>
            <span style={{ fontWeight: 700 }}>Pública</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', width: '100%', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-soft)', fontWeight: 600 }}>Atualizado</span>
            <span style={{ fontWeight: 700 }}>{formattedDate}</span>
          </div>
        </div>

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
            file={capa}
            onUploadSuccess={setCapa}
            onRemove={() => setCapa(null)}
          />
        </div>

        {/* Card SEO */}
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow)',
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '12px' }}>SEO</div>
          
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '5px' }}>
            Meta título ({seoTitulo.length}/60)
          </label>
          <input
            type="text"
            value={seoTitulo}
            onChange={(e) => setSeoTitulo(e.target.value.slice(0, 60))}
            style={{
              width: '100%',
              height: '38px',
              padding: '0 11px',
              borderRadius: '9px',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              fontSize: '12.5px',
              outline: 'none',
              marginBottom: '12px',
              boxSizing: 'border-box',
              color: 'var(--text)',
            }}
            placeholder="Ex: Sobre o Observa RNPI"
          />

          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '5px' }}>
            Meta descrição ({seoDescricao.length}/160)
          </label>
          <textarea
            value={seoDescricao}
            onChange={(e) => setSeoDescricao(e.target.value.slice(0, 160))}
            style={{
              width: '100%',
              height: '64px',
              padding: '9px 11px',
              borderRadius: '9px',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              fontSize: '12.5px',
              outline: 'none',
              resize: 'none',
              marginBottom: '12px',
              boxSizing: 'border-box',
              color: 'var(--text)',
              fontFamily: 'inherit',
            }}
            placeholder="Ex: Observatório para monitoramento..."
          />

          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '5px' }}>
            Slug / URL
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            style={{
              width: '100%',
              height: '38px',
              padding: '0 11px',
              borderRadius: '9px',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              fontSize: '12.5px',
              outline: 'none',
              boxSizing: 'border-box',
              color: 'var(--text)',
            }}
            placeholder="sobre-o-observa"
          />
        </div>
      </div>
    </div>
  );
};
