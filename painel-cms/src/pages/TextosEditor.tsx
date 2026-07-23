import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTexto } from '../hooks/textos/useTexto';
import { useTextoMutations } from '../hooks/textos/useTextoMutations';
import { TextoEditor, slugify } from '../components/textos/TextoEditor';
import { Toast } from '../components/ui/Toast';
import type { PaginaInstitucionalPayload, StrapiFile } from '../lib/strapi';

export const TextosEditor: React.FC = () => {
  const { id: routeId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  
  const id = routeId ? parseInt(routeId, 10) : null;
  const isEditing = id !== null && !isNaN(id);

  // Queries e Mutations
  const { data: pagina, isLoading } = useTexto(id);
  const { createTexto, updateTexto } = useTextoMutations();

  // Estados locais do formulário
  const [titulo, setTitulo] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEditadoManualmente, setSlugEditadoManualmente] = useState(false);
  const [isEditingSlugInline, setIsEditingSlugInline] = useState(false);
  const [conteudo, setConteudo] = useState('');
  const [capa, setCapa] = useState<StrapiFile | null>(null);
  const [seoTitulo, setSeoTitulo] = useState('');
  const [seoDescricao, setSeoDescricao] = useState('');

  // Toast State
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });

  const showToast = (message: string) => setToast({ visible: true, message });

  // Sincronizar dados iniciais
  useEffect(() => {
    if (isEditing && pagina) {
      setTitulo(pagina.titulo);
      setSlug(pagina.slug);
      setConteudo(pagina.conteudo || '');
      setCapa(pagina.capa || null);
      setSeoTitulo(pagina.seo_meta_titulo || '');
      setSeoDescricao(pagina.seo_meta_descricao || '');
      setSlugEditadoManualmente(false); // Reinicia como false a cada recarregamento de página
    } else if (!isEditing) {
      setTitulo('');
      setSlug('');
      setConteudo('');
      setCapa(null);
      setSeoTitulo('');
      setSeoDescricao('');
      setSlugEditadoManualmente(false); // Começa como false para nova página
    }
  }, [isEditing, pagina]);

  const handleSave = async (publish: boolean) => {
    if (!titulo.trim()) {
      showToast('O título é obrigatório.');
      return;
    }

    const finalSlug = slug.trim() || slugify(titulo);
    
    // Mitigação de URL: se a página já estava publicada e o slug mudou, alertar.
    const wasPublished = isEditing && pagina?.published_at !== null && pagina?.published_at !== undefined;
    const slugChanged = wasPublished && finalSlug !== pagina.slug;

    // Determinar published_at
    let publishedAt: string | null = null;
    if (publish) {
      // Se já estava publicado, manter o published_at original (ou usar novo se null)
      publishedAt = isEditing && pagina?.published_at ? pagina.published_at : new Date().toISOString();
    } else {
      // Salvar rascunho
      publishedAt = null;
    }

    const payload: PaginaInstitucionalPayload = {
      titulo: titulo.trim(),
      slug: finalSlug,
      conteudo,
      capa: capa ? capa.id : null,
      seo_meta_titulo: seoTitulo.trim() || null,
      seo_meta_descricao: seoDescricao.trim() || null,
      published_at: publishedAt,
    };

    try {
      if (isEditing) {
        await updateTexto.mutateAsync({ id, payload });
        
        if (slugChanged) {
          showToast(`A URL desta página mudou de /${pagina.slug} para /${finalSlug} — links externos antigos deixarão de funcionar.`);
        } else {
          showToast(publish ? 'Página publicada com sucesso.' : 'Rascunho atualizado.');
        }
      } else {
        const created = await createTexto.mutateAsync(payload);
        showToast(publish ? 'Página criada e publicada.' : 'Rascunho criado com sucesso.');
        // Navegar para edição do recém-criado
        navigate(`/textos/${created.id}`, { replace: true });
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar a página.');
    }
  };

  const isSaving = createTexto.isPending || updateTexto.isPending;

  if (isEditing && isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          color: 'var(--text-soft)',
          fontSize: '14px',
        }}
      >
        Carregando dados da página...
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/textos')}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background .15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--muted)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--card)'; }}
          title="Voltar para a lista"
        >
          <ArrowLeft size={18} strokeWidth={2.2} />
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-soft)', letterSpacing: '.4px', textTransform: 'uppercase' }}>
            <Link to="/textos" style={{ color: 'inherit', textDecoration: 'none' }}>
              Textos Institucionais
            </Link>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-.4px', margin: 0 }}>
            {isEditing ? 'Editar página' : 'Nova página'}
          </h1>
        </div>

        {/* Header Action Buttons */}
        <button
          type="button"
          disabled={isSaving}
          onClick={() => handleSave(false)}
          style={{
            height: '40px',
            padding: '0 16px',
            borderRadius: '11px',
            border: '1px solid var(--border)',
            background: 'var(--card)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            transition: 'background .15s ease',
          }}
          onMouseEnter={(e) => { if (!isSaving) e.currentTarget.style.background = 'var(--muted)'; }}
          onMouseLeave={(e) => { if (!isSaving) e.currentTarget.style.background = 'var(--card)'; }}
        >
          Salvar rascunho
        </button>
        
        <button
          type="button"
          disabled={isSaving}
          onClick={() => handleSave(true)}
          style={{
            height: '40px',
            padding: '0 18px',
            borderRadius: '11px',
            background: 'var(--primary)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 800,
            boxShadow: '0 4px 12px rgba(242,93,39,.28)',
            border: 'none',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            transition: 'background .15s ease',
          }}
          onMouseEnter={(e) => { if (!isSaving) e.currentTarget.style.background = '#e0521f'; }}
          onMouseLeave={(e) => { if (!isSaving) e.currentTarget.style.background = 'var(--primary)'; }}
        >
          {pagina?.published_at ? 'Atualizar' : 'Publicar'}
        </button>
      </div>

      {/* Editor Grid */}
      <TextoEditor
        pagina={pagina || null}
        titulo={titulo}
        setTitulo={setTitulo}
        slug={slug}
        setSlug={setSlug}
        slugEditadoManualmente={slugEditadoManualmente}
        setSlugEditadoManualmente={setSlugEditadoManualmente}
        isEditingSlugInline={isEditingSlugInline}
        setIsEditingSlugInline={setIsEditingSlugInline}
        conteudo={conteudo}
        setConteudo={setConteudo}
        capa={capa}
        setCapa={setCapa}
        seoTitulo={seoTitulo}
        setSeoTitulo={setSeoTitulo}
        seoDescricao={seoDescricao}
        setSeoDescricao={setSeoDescricao}
      />

      {/* Toast Alert */}
      {toast.visible && (
        <Toast
          message={toast.message}
          onClose={() => setToast((t) => ({ ...t, visible: false }))}
        />
      )}
    </div>
  );
};
