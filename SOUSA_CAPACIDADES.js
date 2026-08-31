/**
 * SOUSA 2.0 — CATÁLOGO/CONTRATO DE CAPACIDADES
 * ==========================================================
 * PROVEDOR != MODELO != CAPACIDADE != FERRAMENTA != INTERFACE.
 * A SOUSA IA é a composição dessas capacidades.
 */

var SOUSA_CAPACIDADES_V1 = {
  TEXTO: "TEXTO", CODIGO: "CODIGO", ANALISE: "ANALISE",
  RACIOCINIO: "RACIOCINIO", PESQUISA: "PESQUISA", VISAO: "VISAO",
  IMAGEM: "IMAGEM", VIDEO: "VIDEO", AUDIO: "AUDIO", STT: "STT",
  TTS: "TTS", DOCUMENTO: "DOCUMENTO", MEMORIA: "MEMORIA",
  EMBEDDING: "EMBEDDING", AUTOMACAO: "AUTOMACAO",
  PLANEJAMENTO: "PLANEJAMENTO", REVISAO: "REVISAO",
  CONSOLIDACAO: "CONSOLIDACAO", EXECUCAO_DESKTOP: "EXECUCAO_DESKTOP",
  EXECUCAO_SMARTPHONE: "EXECUCAO_SMARTPHONE"
};

function SOUSA_CAP_normalizarLista(lista) {
  if (!Array.isArray(lista)) return [];
  var seen = {};
  return lista.map(function(x){ return String(x || "").trim().toUpperCase(); })
    .filter(function(x){ if (!x || seen[x]) return false; seen[x] = true; return true; });
}

function SOUSA_CAP_validarRecurso(recurso) {
  var erros = [];
  if (!recurso || typeof recurso !== "object") return {ok:false, erros:["recurso ausente"]};
  if (!recurso.id) erros.push("id ausente");
  var caps = SOUSA_CAP_normalizarLista(recurso.capacidades);
  if (!caps.length) erros.push("capacidades ausentes");
  return {ok: erros.length === 0, erros: erros, capacidades: caps};
}

function SOUSA_CAP_intersecao(requeridas, fornecidas) {
  var a = SOUSA_CAP_normalizarLista(requeridas), b = {};
  SOUSA_CAP_normalizarLista(fornecidas).forEach(function(x){ b[x]=true; });
  return a.filter(function(x){ return !!b[x]; });
}

/**
 * Retorna um mapa capacidade -> recursos capazes de atendê-la.
 * Não conhece fornecedores; trabalha somente com contratos.
 */
function SOUSA_CAP_indexarRecursos(recursos) {
  var indice = {};
  (Array.isArray(recursos) ? recursos : []).forEach(function(r) {
    if (!r || !r.id) return;
    SOUSA_CAP_normalizarLista(r.capacidades).forEach(function(cap) {
      if (!indice[cap]) indice[cap] = [];
      indice[cap].push(r.id);
    });
  });
  return indice;
}
