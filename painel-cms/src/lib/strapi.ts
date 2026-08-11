export type EditorialState = 'rascunho' | 'revisao' | 'publicado' | 'arquivado';

export interface StrapiFileFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  width?: number;
  height?: number;
}

export interface StrapiFile {
  id: number;
  name: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  formats?: Record<string, StrapiFileFormat> | null;
  hash: string;
  ext: string;
  mime: string;
  size: number; // KILOBYTES (float)
  url: string;
  previewUrl?: string | null;
  provider: string;
  provider_metadata?: unknown | null;
  related?: unknown[];
  created_at: string;
  updated_at: string;
}

export type MediaFileType = 'pdf' | 'img' | 'video' | 'doc';
export type MediaSortKey = 'recent' | 'name' | 'size';
export type MediaFilterKey = 'all' | MediaFileType;

export interface MediaListParams {
  _start: number;
  _limit: number;
  _sort: string;
  mime_contains?: string;
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

export interface FaqPayload {
  pergunta: string;
  resposta: string;
  categoria?: number | null;
  ordem?: number | null;
  // CRÍTICO: nunca omitir — null = rascunho, ISOString = publicada.
  // Omitir aciona o bug de auto-publicação do Strapi v3 (documentado em fase-2-planos.md):
  // o Strapi preenche published_at com o timestamp atual se o campo for undefined/ausente.
  published_at: string | null;
}

export interface FaqsListParams {
  _start?: number;
  _limit?: number;
  _sort?: string;
  _q?: string;
}

export interface PaginaInstitucional {
  id: number;
  titulo: string;
  slug: string;
  conteudo: string;
  capa?: StrapiFile | null;
  seo_meta_titulo?: string | null;
  seo_meta_descricao?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginaInstitucionalPayload {
  titulo: string;
  slug: string;
  conteudo: string;
  capa?: number | null; // ID do arquivo de upload no Strapi
  seo_meta_titulo?: string | null;
  seo_meta_descricao?: string | null;
  published_at: string | null; // CRÍTICO: nunca omitir (bug auto-publicação Strapi v3)
}

export interface TextosListParams {
  _start?: number;
  _limit?: number;
  _sort?: string;
  _q?: string;
}

// ── Usuários ─────────────────────────────────────────────────────────────────

export interface RoleLookup {
  id: number;
  name: string;
}

export interface UsuarioRole {
  id: number;
  name: string;
  description?: string;
  type?: string;
}

export interface StrapiUsuario {
  id: number;
  username: string;
  email: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  role?: UsuarioRole;
  created_at?: string;
  updated_at?: string;
}

export interface UsuarioPayload {
  username: string;
  email: string;
  password: string;
  role: number;      // ID do role
  confirmed: boolean;
  blocked: boolean;
}

export interface UsuarioUpdatePayload {
  username?: string;
  email?: string;
  role?: number;
  blocked?: boolean;
}

export interface UsuariosListParams {
  _sort?: string;
  _limit?: number;
  _start?: number;
}

// ── Configurações ─────────────────────────────────────────────────────────────

/**
 * Configuração geral do painel, persistida via strapi.store() no Strapi.
 * Campos de "Informações do site" (site_name, site_url, idioma_padrao,
 * fuso_horario) são salvos mas não consumidos pelo site ainda — preparação
 * para uso futuro. O Sidebar continua com "Observa RNPI" fixo.
 */
export interface CmsConfig {
  site_name: string;
  site_url: string;
  idioma_padrao: string;
  fuso_horario: string;
  /** Se true, os editores de Planos, FAQ e Textos salvam rascunho automaticamente */
  autosave_enabled: boolean;
  /**
   * Toggle "Exigir revisão antes de publicar" — salvo mas sem efeito operacional
   * nesta fase. Pendência formal: FAQ e Textos não têm campo de estado editorial
   * equivalente ao de Planos; requer mudança de schema em produção para paridade.
   */
  require_review: boolean;
}

export type CmsConfigPayload = Partial<CmsConfig>;
