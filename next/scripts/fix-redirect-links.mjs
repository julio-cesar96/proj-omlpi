// next/scripts/fix-redirect-links.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, "../src");

// Mapa de URLs redirecionadas e seus destinos finais (baseado em next.config.ts e proxy.ts)
const REDIRECT_MAP = {
  "/rastreio": "/",
  "/sobre-nos": "/#sobre",
  "/sobre": "/#sobre",
  "/observa": "/#inicio",
  "/planos-pela-primeira-infancia": "/#consulta-publica",
  "/indicadores": "/#referencia",
  "/biblioteca": "/#referencia",
  "/metodologia": "/#referencia",
  "/materiais": "/#referencia",
  "/repositorio": "/#referencia",
  "/referencias": "/#referencia",
  "/city": "/?tab=municipais#consulta-publica",
  "/comparacao": "/?tab=nacional&mode=comparacao#consulta-publica",
  "/historico": "/#historico",
};

// Extensões de arquivos para inspecionar
const EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", ".json"];

function scanDirectory(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") {
        scanDirectory(fullPath, fileList);
      }
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const shouldApplyFix = process.argv.includes("--fix");
const files = scanDirectory(SRC_DIR);
let totalFound = 0;

console.log(`\n🔍 Varrendo ${files.length} arquivos em src/ buscando links redirecionados...\n`);

for (const filePath of files) {
  let content = fs.readFileSync(filePath, "utf-8");
  let modified = false;
  const relativePath = path.relative(path.resolve(__dirname, ".."), filePath);

  for (const [badUrl, goodUrl] of Object.entries(REDIRECT_MAP)) {
    // Procura por href="/caminho" ou href='/caminho'
    const pattern = new RegExp(`href=(["'])${badUrl.replace("/", "\\/")}\\1`, "g");
    if (pattern.test(content)) {
      totalFound++;
      console.log(`⚠️  Encontrado em ${relativePath}:`);
      console.log(`   Link: "${badUrl}" ➔ Sugestão: "${goodUrl}"`);

      if (shouldApplyFix) {
        content = content.replace(pattern, `href=$1${goodUrl}$1`);
        modified = true;
      }
    }
  }

  if (modified && shouldApplyFix) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`   ✅ Substituído com sucesso em ${relativePath}`);
  }
}

console.log(`\n--------------------------------------------------`);
if (totalFound === 0) {
  console.log("✨ Nenhum link interno para URL redirecionada encontrado.");
} else if (shouldApplyFix) {
  console.log(`🎉 Sucesso: ${totalFound} ocorrência(s) corrigida(s) automaticamente!`);
} else {
  console.log(`⚠️  Total de ocorrências: ${totalFound}`);
  console.log(`Execute com a flag --fix para substituir automaticamente:`);
  console.log(`node scripts/fix-redirect-links.mjs --fix\n`);
}

