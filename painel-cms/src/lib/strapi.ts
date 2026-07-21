export type EditorialState = 'rascunho' | 'revisao' | 'publicado' | 'arquivado';

export interface Categoria {
  id: number;
  nome: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Plano {
  id: number;
  titulo: string;
  descricao?: string;
  documento?: any;
  categoria?: Categoria;
  tags?: any[];
  estado_editorial: EditorialState;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Faq {
  id: number;
  pergunta: string;
  resposta: string;
  categoria?: Categoria;
  ordem?: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginaInstitucional {
  id: number;
  titulo: string;
  slug: string;
  conteudo: string;
  capa?: any;
  seo_meta_titulo?: string;
  seo_meta_descricao?: string;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}
