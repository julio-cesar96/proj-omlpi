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
  /** Campo customizado — true = visível em /midiateca-publica (endpoint público). */
  is_public?: boolean;
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
  estado_editorial?: EditorialState;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FaqPayload {
  pergunta: string;
  resposta: string;
  categoria?: number | null;
  ordem?: number | null;
  estado_editorial?: EditorialState;
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
  estado_editorial?: EditorialState;
}

export interface PaginaInstitucional {
  id: number;
  titulo: string;
  slug: string;
  conteudo: string;
  capa?: StrapiFile | null;
  seo_meta_titulo?: string | null;
  seo_meta_descricao?: string | null;
  estado_editorial?: EditorialState;
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
  estado_editorial?: EditorialState;
  published_at: string | null; // CRÍTICO: nunca omitir (bug auto-publicação Strapi v3)
}

export interface TextosListParams {
  _start?: number;
  _limit?: number;
  _sort?: string;
  _q?: string;
  estado_editorial?: EditorialState;
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

// ── Banner (singleType) ─────────────────────────────────────────────────────────

/**
 * Banner da página inicial, editável via painel-cms.
 *
 * `banners` é um singleType no Strapi — GET e PUT em `/banners` sem id.
 * Campos do schema: `title` (string) e `text` (richtext — renderizado como
 * texto puro no Hero.tsx, portanto editado com <textarea> simples no painel).
 *
 * ⚠️ draftAndPublish ativo: `published_at` deve ser sempre reenviado no PUT.
 */
export interface Banner {
  id?: number;
  title?: string;
  text?: string;
  /** CRÍTICO: manter ao fazer PUT (draftAndPublish ativo) — nunca omitir */
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BannerPayload {
  title: string;
  text: string;
  /**
   * CRÍTICO: nunca omitir — repassar exatamente o published_at lido do GET.
   * Omitir ou enviar undefined aciona o bug de auto-publicação do Strapi v3.
   * Nunca enviar null (viraria rascunho).
   */
  published_at: string | null;
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

// ── Localidades ──────────────────────────────────────────────────────────────

export interface Locale {
  id: number;
  name: string;
  state?: string | null;
  region?: string | null;
  type: 'country' | 'region' | 'state' | 'city';
  is_capital?: boolean | null;
  cod_ibge?: number | string | null;
  is_law?: boolean | null;
  hide_plan?: boolean | null;
  plan?: StrapiFile | null;
  plano_origem?: Plano | number | null;
  created_at?: string;
  updated_at?: string;
}

export interface LocaleUpdatePayload {
  is_law?: boolean | null;
  hide_plan?: boolean | null;
  plan?: number | null;
  plano_origem?: number | null;
}

export interface LocalesListParams {
  _start?: number;
  _limit?: number;
  _sort?: string;
  _q?: string;
  state?: string;
  type?: 'country' | 'region' | 'state' | 'city';
}

// ── Sobres (Quem Somos) ───────────────────────────────────────────────────────

export interface Sobre {
  id: number;
  title?: string | null;
  text?: string | null;
  image?: StrapiFile | null;
  link?: string | null;
  link_title?: string | null;
  link2?: string | null;
  link2_title?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SobrePayload {
  title: string;
  text?: string | null;
  image?: number | null; // ID do StrapiFile
  link?: string | null;
  link_title?: string | null;
  link2?: string | null;
  link2_title?: string | null;
  /**
   * CRÍTICO: nunca omitir — null = rascunho, ISOString = publicado.
   * Omitir aciona o bug de auto-publicação do Strapi v3.
   */
  published_at: string | null;
}

export interface SobresListParams {
  _start?: number;
  _limit?: number;
  _sort?: string;
}

// ── Guias (Documentos de referência) ────────────────────────────────────────

export interface Guia {
  id: number;
  title: string;
  description?: string | null;
  file?: StrapiFile | null;
  category?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuiaPayload {
  title: string;
  description?: string | null;
  file: number; // ID do StrapiFile
  category?: string | null;
}

export interface GuiasListParams {
  _start?: number;
  _limit?: number;
  _sort?: string;
  _q?: string;
}

// ── Elabore o Plano (singleType) ─────────────────────────────────────────────

export interface ElaborePlano {
  id?: number;
  titulo_secao?: string | null;
  titulo_guia?: string | null;
  descricao?: string | null;
  capa?: StrapiFile | null;
  arquivo?: StrapiFile | null;
  created_at?: string;
  updated_at?: string;
}

export interface ElaborePlanoPayload {
  titulo_secao?: string | null;
  titulo_guia?: string | null;
  descricao?: string | null;
  capa?: number | null; // ID do StrapiFile
  arquivo?: number | null; // ID do StrapiFile
}


