export type EditorialState = 'rascunho' | 'revisao' | 'publicado' | 'arquivado';

export interface StrapiFile {
  id: number;
  name: string;
  url: string;
  size: number;
  mime: string;
  created_at: string;
  updated_at: string;
}

export interface Categoria {
  id: number;
  nome: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tag {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Plano {
  id: number;
  titulo: string;
  descricao?: string | null;
  documento?: StrapiFile | null;
  categoria?: Categoria | null;
  tags?: Tag[];
  estado_editorial: EditorialState;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanoPayload {
  titulo: string;
  descricao?: string;
  documento?: number | null;
  categoria?: number | null;
  tags?: number[];
  estado_editorial: EditorialState;
  published_at?: string | null;
}

export interface PlanosListParams {
  _start?: number;
  _limit?: number;
  _sort?: string;
  _q?: string;
  estado_editorial?: EditorialState;
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

