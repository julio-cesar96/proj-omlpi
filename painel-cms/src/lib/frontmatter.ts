/**
 * Utilitários para parsing e serialização de frontmatter em registros de texto institucional (Sobre / Histórico).
 * Permite controlar section_label (tarja laranja) e section_title (H2) de forma desacoplada sem alterar o schema do Strapi.
 */

export interface SobreFrontmatter {
  section_label?: string; // Texto ao lado da tarja laranja (ex: "Memória", "Sobre")
  section_title?: string; // Título principal da seção H2 (ex: "Histórico", "Quem somos")
}

export function parseSobreText(rawText: string | null | undefined): {
  meta: SobreFrontmatter;
  content: string;
} {
  if (!rawText) return { meta: {}, content: "" };

  const match = rawText.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { meta: {}, content: rawText };
  }

  const yamlBlock = match[1];
  const content = match[2];
  const meta: SobreFrontmatter = {};

  yamlBlock.split(/\r?\n/).forEach((line) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      if (key === "section_label") meta.section_label = value;
      if (key === "section_title") meta.section_title = value;
    }
  });

  return { meta, content };
}

export function serializeSobreText(
  meta: SobreFrontmatter,
  content: string | null | undefined
): string {
  const lines: string[] = [];
  if (meta.section_label?.trim()) {
    lines.push(`section_label: ${meta.section_label.trim()}`);
  }
  if (meta.section_title?.trim()) {
    lines.push(`section_title: ${meta.section_title.trim()}`);
  }

  const cleanContent = (content ?? "").trim();

  if (lines.length === 0) {
    return cleanContent;
  }

  return `---\n${lines.join("\n")}\n---\n\n${cleanContent}`;
}
