/**
 * SOUSA 2.0 — CONTRATO DE CANAIS OPERACIONAIS
 * ==========================================================
 * Desktop, smartphone, texto e voz são apenas canais de comando.
 * Todos devem entregar a mesma INTENÇÃO CANÔNICA.
 */

var SOUSA_CANAIS_V1 = {
  canais: ["TEXTO","VOZ","DESKTOP","SMARTPHONE"],
  regra: "TODOS_OS_CANAIS_CONVERGEM_PARA_INTENCAO"
};

function SOUSA_CANAL_normalizar(canal, payload) {
  var origem = String(canal || "TEXTO").toUpperCase();
  if (SOUSA_CANAIS_V1.canais.indexOf(origem) === -1) {
    return {ok:false, status:"CANAL_NAO_SUPORTADO", canal:origem};
  }
  payload = payload || {};
  return {
    ok: true,
    origem: origem,
    texto: String(payload.texto || payload.comando || "").trim(),
    referencia: payload.referencia || null,
    contexto: payload.contexto || {},
    metadados: payload.metadados || {}
  };
}

/**
 * O canal não executa. Entrega à porta única de intenção.
 */
function SOUSA_CANAL_entregar(canal, payload) {
  var normalizado = SOUSA_CANAL_normalizar(canal, payload);
  if (!normalizado.ok) return normalizado;
  if (typeof SOUSA_INTENCAO_receber !== "function") {
    return {ok:false, status:"PORTA_INTENCAO_AUSENTE"};
  }
  return SOUSA_INTENCAO_receber(normalizado);
}
