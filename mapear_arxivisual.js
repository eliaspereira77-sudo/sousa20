const fs = require("fs");
const path = require("path");

const RAIZ = process.cwd();
const REPO = path.join(RAIZ, "arxivisual_repo");
const DIR = RAIZ;

const SAIDA_JSON = path.join(DIR, "mapa_real_arxivisual.json");
const SAIDA_MD = path.join(DIR, "mapa_real_arxivisual.md");

const IGNORAR = new Set([
  ".git",
  "node_modules",
  "__pycache__",
  ".venv",
  "venv",
  "dist",
  "build",
  ".next",
  ".cache"
]);

const EXTENSOES = new Set([
  ".py",
  ".js",
  ".ts",
  ".tsx",
  ".jsx",
  ".json",
  ".md",
  ".yml",
  ".yaml",
  ".toml",
  ".txt",
  ".env.example"
]);

const arquivos = [];

function varrer(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORAR.has(item.name)) continue;

    const full = path.join(dir, item.name);

    if (item.isDirectory()) {
      varrer(full);
      continue;
    }

    const ext = path.extname(item.name).toLowerCase();

    if (!EXTENSOES.has(ext)) continue;

    const relativo = path.relative(REPO, full).replace(/\\/g, "/");

    let tamanho = 0;
    let linhas = 0;

    try {
      const conteudo = fs.readFileSync(full, "utf8");
      tamanho = Buffer.byteLength(conteudo, "utf8");
      linhas = conteudo.split(/\r?\n/).length;
    } catch (_) {}

    arquivos.push({
      arquivo: relativo,
      extensao: ext,
      bytes: tamanho,
      linhas
    });
  }
}

if (!fs.existsSync(REPO)) {
  console.error("ERRO: arxivisual_repo não encontrado.");
  process.exit(1);
}

varrer(REPO);

arquivos.sort((a, b) => a.arquivo.localeCompare(b.arquivo));

const categorias = {
  BACKEND: arquivos.filter(x => x.arquivo.startsWith("backend/")),
  FRONTEND: arquivos.filter(x => x.arquivo.startsWith("frontend/")),
  DOCS: arquivos.filter(x => x.arquivo.startsWith("docs/")),
  RAIZ: arquivos.filter(
    x =>
      !x.arquivo.startsWith("backend/") &&
      !x.arquivo.startsWith("frontend/") &&
      !x.arquivo.startsWith("docs/")
  )
};

const porExtensao = {};

for (const x of arquivos) {
  porExtensao[x.extensao] = (porExtensao[x.extensao] || 0) + 1;
}

const palavrasChave = [
  "pipeline",
  "agent",
  "analy",
  "planner",
  "generator",
  "manim",
  "voice",
  "audio",
  "tts",
  "validator",
  "render",
  "spatial",
  "scene",
  "context7",
  "paper",
  "arxiv",
  "visual"
];

const relevantes = arquivos.filter(x =>
  palavrasChave.some(p =>
    x.arquivo.toLowerCase().includes(p)
  )
);

const relatorio = {
  sistema: "SOUSA 2.0",
  alvo: "arXivisual",
  repositorio: "rajshah6/arXivisual",
  branch: "main",
  principio: "ZERO_CONFLITO_ZERO_INCOMPATIBILIDADE",
  producao_sousa: "INALTERADA",
  total_arquivos_mapeados: arquivos.length,
  categorias: {
    backend: categorias.BACKEND.length,
    frontend: categorias.FRONTEND.length,
    docs: categorias.DOCS.length,
    raiz: categorias.RAIZ.length
  },
  por_extensao: porExtensao,
  arquivos_relevantes: relevantes
};

fs.writeFileSync(
  SAIDA_JSON,
  JSON.stringify(relatorio, null, 2),
  "utf8"
);

const md = [
  "# SOUSA 2.0 — MAPA REAL arXivisual",
  "",
  "**Repositório:** `rajshah6/arXivisual`",
  "**Branch:** `main`",
  "**Produção SOUSA:** INALTERADA",
  "**Princípio:** ZERO CONFLITO / ZERO INCOMPATIBILIDADE",
  "",
  "## Quantitativo",
  "",
  `- Arquivos mapeados: ${arquivos.length}`,
  `- Backend: ${categorias.BACKEND.length}`,
  `- Frontend: ${categorias.FRONTEND.length}`,
  `- Docs: ${categorias.DOCS.length}`,
  `- Raiz: ${categorias.RAIZ.length}`,
  "",
  "## Arquivos potencialmente relevantes",
  ""
];

for (const x of relevantes) {
  md.push(
    `- \`${x.arquivo}\` — ${x.bytes} bytes — ${x.linhas} linhas`
  );
}

md.push("");
md.push("---");
md.push("");
md.push("**PRODUCAO_SOUSA: INALTERADA**");

fs.writeFileSync(
  SAIDA_MD,
  md.join("\n"),
  "utf8"
);

console.log("");
console.log("============================================================");
console.log(" SOUSA 2.0 — MAPA REAL ARXIVISUAL");
console.log("============================================================");
console.log("");
console.log("ARQUIVOS MAPEADOS:", arquivos.length);
console.log("BACKEND:", categorias.BACKEND.length);
console.log("FRONTEND:", categorias.FRONTEND.length);
console.log("DOCS:", categorias.DOCS.length);
console.log("RAIZ:", categorias.RAIZ.length);
console.log("");
console.log("ARQUIVOS POTENCIALMENTE RELEVANTES:", relevantes.length);
console.log("");
console.log("JSON: .\\mapa_real_arxivisual.json");
console.log("MD:   .\\mapa_real_arxivisual.md");
console.log("");
console.log("PRODUCAO_SOUSA: INALTERADA");
console.log("STATUS: MAPA_REAL_ARXIVISUAL_CONCLUIDO");
console.log("");
