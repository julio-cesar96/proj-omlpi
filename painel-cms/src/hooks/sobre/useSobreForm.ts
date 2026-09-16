import { useEffect, useState } from 'react';
import type { Sobre, SobrePayload, StrapiFile } from '../../lib/strapi';
import { parseSobreText, serializeSobreText } from '../../lib/frontmatter';

export interface SobreFormState {
  title: string;
  section_label: string;
  section_title: string;
  text: string;
  link: string;
  link_title: string;
  link2: string;
  link2_title: string;
}

const EMPTY_FORM: SobreFormState = {
  title: '',
  section_label: '',
  section_title: '',
  text: '',
  link: '',
  link_title: '',
  link2: '',
  link2_title: '',
};

interface UseSobreFormParams {
  open: boolean;
  sobre: Sobre | null; // null = modo criação
  defaultSectionType?: 'sobre' | 'historico';
}

function isHistoricoTitle(title: string | null | undefined): boolean {
  const normalized = title?.toLowerCase() ?? '';
  return (
    normalized.includes('histórico') ||
    normalized.includes('historico') ||
    normalized.includes('memória') ||
    normalized.includes('memoria')
  );
}

export function useSobreForm({ open, sobre, defaultSectionType }: UseSobreFormParams) {
  const [form, setForm] = useState<SobreFormState>(EMPTY_FORM);
  const [linksExpanded, setLinksExpanded] = useState(false);

  // Sincronizar dados ao abrir
  useEffect(() => {
    if (!open) return;

    if (sobre) {
      const parsed = parseSobreText(sobre.text);
      const isHistorico = defaultSectionType === 'historico' || isHistoricoTitle(sobre.title);

      setForm({
        title: sobre.title ?? (isHistorico ? 'Histórico' : ''),
        section_label: parsed.meta.section_label ?? (isHistorico ? 'Memória' : 'Sobre'),
        section_title:
          parsed.meta.section_title ??
          (isHistorico ? sobre.title || 'Histórico' : sobre.title || 'Quem somos'),
        text: parsed.content ?? '',
        link: sobre.link ?? '',
        link_title: sobre.link_title ?? '',
        link2: sobre.link2 ?? '',
        link2_title: sobre.link2_title ?? '',
      });
      // Expandir links se algum já tiver conteúdo
      setLinksExpanded(
        Boolean(sobre.link || sobre.link_title || sobre.link2 || sobre.link2_title)
      );
    } else {
      const isHistorico = defaultSectionType === 'historico';
      setForm({
        title: isHistorico ? 'Histórico' : '',
        section_label: isHistorico ? 'Memória' : 'Sobre',
        section_title: isHistorico ? 'Histórico' : 'Quem somos',
        text: '',
        link: '',
        link_title: '',
        link2: '',
        link2_title: '',
      });
      setLinksExpanded(false);
    }
  }, [open, sobre, defaultSectionType]);

  const updateField = <K extends keyof SobreFormState>(key: K, value: SobreFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const toggleLinksExpanded = () => setLinksExpanded((v) => !v);

  const isValid = form.title.trim().length > 0;

  const buildPayload = (image: StrapiFile | null, publishedAt: string | null): SobrePayload => {
    const serializedText = serializeSobreText(
      {
        section_label: form.section_label.trim(),
        section_title: form.section_title.trim(),
      },
      form.text
    );

    return {
      title: form.title.trim(),
      text: serializedText || null,
      image: image ? image.id : null,
      link: form.link.trim() || null,
      link_title: form.link_title.trim() || null,
      link2: form.link2.trim() || null,
      link2_title: form.link2_title.trim() || null,
      published_at: publishedAt,
    };
  };

  return { form, updateField, linksExpanded, toggleLinksExpanded, isValid, buildPayload };
}
