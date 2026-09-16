import { useEffect, useState } from 'react';
import type { ElaborePlano } from '../../lib/strapi';

export interface ElaborePlanoFormState {
  tituloSecao: string;
  tituloGuia: string;
  descricao: string;
  imagePosition: 'topo' | 'esquerda' | 'direita';
}

const EMPTY_FORM: ElaborePlanoFormState = {
  tituloSecao: '',
  tituloGuia: '',
  descricao: '',
  imagePosition: 'topo',
};

export function useElaborePlanoForm(data: ElaborePlano | undefined) {
  const [form, setForm] = useState<ElaborePlanoFormState>(EMPTY_FORM);

  // Preencher formulário ao carregar dados do Strapi
  useEffect(() => {
    if (!data) return;
    setForm({
      tituloSecao: data.titulo_secao ?? '',
      tituloGuia: data.titulo_guia ?? '',
      descricao: data.descricao ?? '',
      imagePosition: data.image_position ?? 'topo',
    });
  }, [data]);

  const updateField = <K extends keyof ElaborePlanoFormState>(
    key: K,
    value: ElaborePlanoFormState[K]
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  return { form, updateField };
}
