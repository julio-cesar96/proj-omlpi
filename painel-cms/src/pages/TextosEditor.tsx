import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTexto } from '../hooks/textos/useTexto';
import { useTextoMutations } from '../hooks/textos/useTextoMutations';
import { TextoEditor, slugify } from '../components/textos/TextoEditor';
import { Toast } from '../components/ui/Toast';
import type { PaginaInstitucionalPayload, StrapiFile, EditorialState } from '../lib/strapi';
import { useAutosave } from '../hooks/configuracoes/useAutosave';
import { useConfiguracoes } from '../hooks/configuracoes/useConfiguracoes';
import { EditorialBadge } from '../components/ui/EditorialBadge';

export const TextosEditor: React.FC = () => {
  const { id: routeId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  
  const id = routeId ? parseInt(routeId, 10) : null;
  const isEditing = id !== null && !isNaN(id);

  // Queries e Mutations
  const { data: pagina, isLoading } = useTexto(id);
  const { createTexto, updateTexto } = useTextoMutations();
  const { config } = useConfiguracoes();

  const currentStatus: EditorialState =
    pagina?.estado_editorial || (pagina?.published_at ? 'publicado' : 'rascunho');

  const requireReview = config?.require_review ?? false;
  const isPublishBlocked = requireReview && currentStatus !== 'revisao';

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

  // ─── Autosave ──────────────────────────────────────────────────────────────
  const autosaveDraft = useMemo(() => ({
    titulo, slug, conteudo, capaId: capa?.id ?? null, seoTitulo, seoDescricao,
  }), [titulo, slug, conteudo, capa, seoTitulo, seoDescricao]);

  const { cancelTimer: cancelAutosaveTimer } = useAutosave({
    data: autosaveDraft,
    isEditing: isEditing,
    onSave: async (_draft) => {
      if (!id) return;
      await updateTexto.mutateAsync({
        id,
        payload: {
          titulo: _draft.titulo.trim() || pagina?.titulo || 'Sem título',
          slug: _draft.slug.trim() || slugify(_draft.titulo),
          conteudo: _draft.conteudo,
          capa: _draft.capaId,
          seo_meta_titulo: _draft.seoTitulo.trim() || null,
          seo_meta_descricao: _draft.seoDescricao.trim() || null,
          estado_editorial: pagina?.estado_editorial || currentStatus,
          published_at: pagina?.published_at ?? null,
        },
      });
    },
  });
  // ──────────────────────────────────────────────────────────────

  // Sincronizar dados iniciais
  useEffect(() => {
    if (isEditing && pagina) {
      setTitulo(pagina.titulo);
      setSlug(pagina.slug);
      setConteudo(pagina.conteudo || '');
      setCapa(pagina.capa || null);
      setSeoTitulo(pagina.seo_meta_titulo || '');
      setSeoDescricao(pagina.seo_meta_descricao || '');
      setSlugEditadoManualmente(false);
    } else if (!isEditing) {
      setTitulo('');
      setSlug('');
      setConteudo('');
      setCapa(null);
      setSeoTitulo('');
      setSeoDescricao('');
      setSlugEditadoManualmente(false);
    }
  }, [isEditing, pagina]);

  const handleSave = async (targetState: 'rascunho' | 'revisao' | 'publicado') => {
    cancelAutosaveTimer();
    if (!titulo.trim()) {
      showToast('O título é obrigatório.');
      return;
    }

    if (targetState === 'publicado' && isPublishBlocked) {
      showToast('A trava de revisão está ativa em Configurações. O conteúdo precisa estar no estado "Em revisão" antes de ser publicado.');
      return;
    }

    const finalSlug = slug.trim() || slugify(titulo);
    const wasPublished = isEditing && pagina?.published_at !== null && pagina?.published_at !== undefined;
    const slugChanged = wasPublished && finalSlug !== pagina.slug;

    let publishedAt: string | null = null;
    if (targetState === 'publicado') {
      publishedAt = isEditing && pagina?.published_at ? pagina.published_at : new Date().toISOString();
    } else {
      publishedAt = null;
    }

    const payload: PaginaInstitucionalPayload = {
      titulo: titulo.trim(),
      slug: finalSlug,
      conteudo,
      capa: capa ? capa.id : null,
      seo_meta_titulo: seoTitulo.trim() || null,
      seo_meta_descricao: seoDescricao.trim() || null,
      estado_editorial: targetState,
      published_at: publishedAt,
    };

    try {
      if (isEditing) {
        await updateTexto.mutateAsync({ id, payload });
        if (slugChanged) {
          showToast(`A URL desta página mudou de /${pagina.slug} para /${finalSlug} — links externos antigos deixarão de funcionar.`);
        } else {
          const labelMap = {
            rascunho: 'Rascunho atualizado.',
            revisao: 'Página enviada para revisão.',
            publicado: 'Página publicada com sucesso.',
          };
          showToast(labelMap[targetState]);
        }
      } else {
        const created = await createTexto.mutateAsync(payload);
        const labelMap = {
          rascunho: 'Rascunho criado com sucesso.',
          revisao: 'Página criada e enviada para revisão.',
          publicado: 'Página criada e publicada.',
        };
        showToast(labelMap[targetState]);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-.4px', margin: 0 }}>
              {isEditing ? 'Editar página' : 'Nova página'}
            </h1>
            {isEditing && <EditorialBadge status={pagina?.estado_editorial} publishedAt={pagina?.published_at} />}
          </div>
        </div>

        {/* Header Action Buttons */}
        <button
          type="button"
          disabled={isSaving}
          onClick={() => handleSave('rascunho')}
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
          onClick={() => handleSave('revisao')}
          style={{
            height: '40px',
            padding: '0 16px',
            borderRadius: '11px',
            border: 'none',
            background: 'var(--muted)',
            color: 'var(--text)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            transition: 'background .15s ease',
          }}
        >
          Enviar p/ revisão
        </button>

        <button
          type="button"
          disabled={isSaving || isPublishBlocked}
          onClick={() => handleSave('publicado')}
          title={isPublishBlocked ? 'A trava de revisão está ativa. Envie o conteúdo para revisão antes de publicar.' : undefined}
          style={{
            height: '40px',
            padding: '0 18px',
            borderRadius: '11px',
            background: isPublishBlocked ? 'var(--muted)' : 'var(--primary)',
            color: isPublishBlocked ? 'var(--text-soft)' : '#fff',
            fontSize: '13px',
            fontWeight: 800,
            boxShadow: isPublishBlocked ? 'none' : '0 4px 12px rgba(242,93,39,.28)',
            border: 'none',
            cursor: isSaving || isPublishBlocked ? 'not-allowed' : 'pointer',
            opacity: isPublishBlocked ? 0.6 : 1,
            transition: 'background .15s ease',
          }}
          onMouseEnter={(e) => { if (!isSaving && !isPublishBlocked) e.currentTarget.style.background = '#e0521f'; }}
          onMouseLeave={(e) => { if (!isPublishBlocked) e.currentTarget.style.background = 'var(--primary)'; }}
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
