/**
 * SOUSA 2.0 — IDENTIDADE DE ARQUIVOS (algoritmo)
 * Fonte da verdade: o que E o SOUSA e o que NAO entra.
 * Trava do boot. Nao e script opcional.
 */

var SOUSA_IDENTIDADE_VERSAO = "1.0.0";

var SOUSA_IDENTIDADE_GAS = {
  "appsscript.json": true,
  "SOUSA_IDENTIDADE.js": true,
  "SOUSA_APIS_CASCATA.js": true,
  "SOUSA_API_EXECUTOR_UNIVERSAL.js": true,
  "SOUSA_USB_ADAPTERS.js": true,
  "SOUSA_USB_REGISTRY.js": true,
  "SOUSA_USB_CONTRATO.js": true,
  "SOUSA_USB_TRANSPORTES.js": true,
  "SOUSA_USB_BOOT.js": true,
  "SOUSA_VALIDACAO_CASCATA.js": true,
  "SOUSA_ADAPTER_ANTHROPIC_MESSAGES.js": true,
  "SOUSA_API_MANAGER.js": true,
  "SOUSA_Core.js": true
};

var SOUSA_IDENTIDADE_GIT = {
  ".clasp.json": true,
  ".claspignore": true,
  ".gitignore": true,
  ".env.example": true,
  "appsscript.json": true,
  "README.md": true,
  "package.json": true,
  "package-lock.json": true,
  "SOUSA_MANIFESTO_ARQUIVOS.json": true,
  "SOUSA_IDENTIDADE.js": true,
  "SOUSA_APIS_CASCATA.js": true,
  "SOUSA_API_EXECUTOR_UNIVERSAL.js": true,
  "SOUSA_USB_ADAPTERS.js": true,
  "SOUSA_USB_REGISTRY.js": true,
  "SOUSA_USB_CONTRATO.js": true,
  "SOUSA_USB_TRANSPORTES.js": true,
  "SOUSA_USB_BOOT.js": true,
  "SOUSA_VALIDACAO_CASCATA.js": true,
  "SOUSA_VALIDADOR_UNIVERSAL.js": true,
  "SOUSA_ADAPTER_ANTHROPIC_MESSAGES.js": true,
  "SOUSA_COFRE_CHAVES.json": true,
  "SOUSA_API_MANAGER.js": true,
  "01_CORE/SOUSA_Core.js": true,
  "01_CORE/SOUSA_Gemini_CLIENT.js": true,
  "docs/VALIDACAO_CASCATA.md": true,
  "docs/VALIDADOR_UNIVERSAL.md": true,
  "scripts/LIMPAR_NAO_OPERACIONAL.sh": true,
  "scripts/SOUSA_GUARD_ARQUIVOS.sh": true,
  "hooks/pre-commit": true
};

var SOUSA_IDENTIDADE_PREFIXOS_OK = ["00_GOVERNANCA/", "01_CORE/"];

var SOUSA_IDENTIDADE_SUJEIRA = [
  /\.BACKUP/i, /\.BK_/i, /_BACKUP/i, /^BACKUP_/i, /^Backups\//,
  /^TESTE_/i, /SOUSA_TESTE_/i, /_TESTE_/i,
  /\.pdf$/i, /\.docx$/i, /\.zip$/i, /^\.env$/,
  /^\.sousa_redes_credenciais\.json$/,
  /^07_LOG\//, /^Extensions\//, /^EXTENSOES\//, /^CAMPAIGN_/i,
  /LEGACY/i, /node_modules\//, /\.venv/
];

function SOUSA_IDENTIDADE_basename(caminho) {
  var s = String(caminho || "").replace(/\\/g, "/");
  var i = s.lastIndexOf("/");
  return i >= 0 ? s.substring(i + 1) : s;
}

function SOUSA_IDENTIDADE_eSujeira(caminho) {
  var c = String(caminho || "").replace(/\\/g, "/");
  for (var i = 0; i < SOUSA_IDENTIDADE_SUJEIRA.length; i++) {
    if (SOUSA_IDENTIDADE_SUJEIRA[i].test(c)) return true;
  }
  return false;
}

function SOUSA_IDENTIDADE_aceitar(caminho, contexto) {
  var c = String(caminho || "").replace(/\\/g, "/");
  if (!c) return { ok: false, motivo: "CAMINHO_VAZIO" };
  if (SOUSA_IDENTIDADE_eSujeira(c)) {
    return { ok: false, motivo: "SUJEIRA", caminho: c };
  }
  var ctx = String(contexto || "QUALQUER").toUpperCase();
  var base = SOUSA_IDENTIDADE_basename(c);
  if (ctx === "GAS") {
    if (SOUSA_IDENTIDADE_GAS[base] === true || SOUSA_IDENTIDADE_GAS[c] === true) {
      return { ok: true, motivo: "IDENTIDADE_GAS", caminho: c };
    }
    return { ok: false, motivo: "FORA_DA_IDENTIDADE_GAS", caminho: c };
  }
  if (SOUSA_IDENTIDADE_GIT[c] === true || SOUSA_IDENTIDADE_GIT[base] === true) {
    return { ok: true, motivo: "IDENTIDADE_GIT", caminho: c };
  }
  for (var p = 0; p < SOUSA_IDENTIDADE_PREFIXOS_OK.length; p++) {
    if (c.indexOf(SOUSA_IDENTIDADE_PREFIXOS_OK[p]) === 0) {
      return { ok: true, motivo: "PREFIXO_OK", caminho: c };
    }
  }
  return { ok: false, motivo: "FORA_DA_IDENTIDADE", caminho: c };
}

function SOUSA_IDENTIDADE_filtrar(lista, contexto) {
  var aceitos = [];
  var rejeitados = [];
  var arr = lista || [];
  for (var i = 0; i < arr.length; i++) {
    var d = SOUSA_IDENTIDADE_aceitar(arr[i], contexto);
    if (d.ok) aceitos.push(d);
    else rejeitados.push(d);
  }
  return { ok: rejeitados.length === 0, aceitos: aceitos, rejeitados: rejeitados, principio: "SOMENTE_IDENTIDADE_SOUSA" };
}

function SOUSA_IDENTIDADE_autorizarEngate(caminhoOuId) {
  var d = SOUSA_IDENTIDADE_aceitar(caminhoOuId, "QUALQUER");
  if (!d.ok && SOUSA_IDENTIDADE_eSujeira(String(caminhoOuId || ""))) {
    return { ok: false, status: "ENGATE_RECUSADO_SUJEIRA", detalhe: d };
  }
  if (d.ok) return { ok: true, status: "ENGATE_IDENTIDADE_OK", detalhe: d };
  var s = String(caminhoOuId || "");
  if (s.indexOf(".") === -1 && s.indexOf("/") === -1) {
    return { ok: true, status: "ENGATE_ID_NAO_ARQUIVO", id: s };
  }
  return { ok: false, status: "ENGATE_RECUSADO_FORA_IDENTIDADE", detalhe: d };
}

function SOUSA_IDENTIDADE_boot() {
  return {
    ok: true,
    status: "IDENTIDADE_ATIVA",
    versao: SOUSA_IDENTIDADE_VERSAO,
    regra: "Arquivo fora da identidade nao entra em git nem clasp nem boot"
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SOUSA_IDENTIDADE_aceitar: SOUSA_IDENTIDADE_aceitar,
    SOUSA_IDENTIDADE_filtrar: SOUSA_IDENTIDADE_filtrar,
    SOUSA_IDENTIDADE_autorizarEngate: SOUSA_IDENTIDADE_autorizarEngate,
    SOUSA_IDENTIDADE_boot: SOUSA_IDENTIDADE_boot,
    SOUSA_IDENTIDADE_eSujeira: SOUSA_IDENTIDADE_eSujeira
  };
}
