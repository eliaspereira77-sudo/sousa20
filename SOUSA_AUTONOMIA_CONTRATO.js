/**
 * SOUSA 2.0 — CONTRATO DE AUTONOMIA OPERACIONAL
 * ==========================================================
 * Meta: máxima automação com intervenção humana somente na entrada,
 * autorização explícita ou retomada deliberada de controle.
 *
 * Este módulo NÃO executa ações. Ele define o contrato de governança
 * que os futuros motores de autonomia deverão cumprir.
 *
 * Importante: a meta de engenharia é 99,99% de automação. A intervenção
 * humana é uma exceção de governança, não uma etapa obrigatória do fluxo.
 */

var SOUSA_AUTONOMIA_V1 = {
  versao: "1.0",
  meta_automacao: 0.9999,
  principio: "INTENCAO_HUMANA_MINIMA_EXECUCAO_AUTONOMA_MAXIMA",
  entrada_humana: ["TEXTO", "VOZ", "DESKTOP", "SMARTPHONE"],
  modos: ["AUTONOMO", "AGUARDANDO_AUTORIZACAO", "CONTROLE_HUMANO", "CONCLUIDO"],
  decisoes_que_podem_EXIGIR_autorizacao: [
    "RISCO_ALTO",
    "ALTERACAO_ESTRUTURAL_NUCLEO",
    "OPERACAO_IRREVERSIVEL",
    "CREDENCIAL_OU_SEGREDO",
    "POLITICA_DE_GOVERNANCA"
  ]
};

function SOUSA_AUTONOMIA_criarContexto(intencao, contexto) {
  return {
    versao: SOUSA_AUTONOMIA_V1.versao,
    modo: "AUTONOMO",
    intencao: intencao || null,
    contexto: contexto || {},
    etapas: [],
    autorizacao: { necessaria: false, motivo: null },
    objetivo: (contexto && contexto.objetivo) || null
  };
}

function SOUSA_AUTONOMIA_pedirAutorizacao(motivo, detalhes) {
  return {
    ok: false,
    status: "AGUARDANDO_AUTORIZACAO",
    modo: "AGUARDANDO_AUTORIZACAO",
    motivo: String(motivo || "POLITICA_DE_GOVERNANCA"),
    detalhes: detalhes || null
  };
}

function SOUSA_AUTONOMIA_registrarEtapa(contexto, etapa) {
  if (!contexto || typeof contexto !== "object") return contexto;
  if (!Array.isArray(contexto.etapas)) contexto.etapas = [];
  contexto.etapas.push({
    numero: contexto.etapas.length + 1,
    tipo: etapa && etapa.tipo || "OPERACAO",
    status: etapa && etapa.status || "REGISTRADA",
    recurso: etapa && etapa.recurso || null,
    timestamp: new Date().toISOString()
  });
  return contexto;
}

function SOUSA_AUTONOMIA_concluir(contexto, resultado) {
  return {
    ok: !!(resultado && resultado.ok),
    status: resultado && resultado.ok ? "AUTONOMIA_CONCLUIDA" : "AUTONOMIA_COM_FALHA",
    modo: resultado && resultado.ok ? "CONCLUIDO" : "AUTONOMO",
    resultado: resultado || null,
    etapas: contexto && contexto.etapas || [],
    timestamp: new Date().toISOString()
  };
}
