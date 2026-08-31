/**
 * SOUSA 2.0 — CICLO AUTÔNOMO / ENCAIXE
 * ==========================================================
 * Contrato do loop:
 * INTENÇÃO → PLANEJAR → EXECUTAR → VERIFICAR → RECUPERAR →
 * CONSOLIDAR → REGISTRAR → CONCLUIR.
 *
 * Este módulo não inventa ferramentas. Ele define a máquina de estados
 * que poderá ser conectada ao Executor Universal e aos módulos de memória.
 */

var SOUSA_CICLO_AUTONOMO_V1 = {
  versao: "1.0",
  estados: [
    "RECEBIDA","PLANEJANDO","EXECUTANDO","VERIFICANDO",
    "RECUPERANDO","CONSOLIDANDO","REGISTRANDO","CONCLUIDA",
    "AGUARDANDO_AUTORIZACAO","FALHA"
  ]
};

function SOUSA_CICLO_criar(intencao, contexto) {
  return {
    id: "CICLO_" + Date.now(),
    estado: "RECEBIDA",
    intencao: intencao || null,
    contexto: contexto || {},
    tentativas: [],
    plano: [],
    resultados: [],
    autorizacoes: [],
    inicio: new Date().toISOString()
  };
}

function SOUSA_CICLO_mudarEstado(ciclo, estado, detalhe) {
  if (!ciclo) return ciclo;
  ciclo.estado = estado;
  ciclo.ultimo_evento = {
    estado: estado,
    detalhe: detalhe || null,
    timestamp: new Date().toISOString()
  };
  return ciclo;
}

function SOUSA_CICLO_registrarTentativa(ciclo, tentativa) {
  if (!ciclo) return ciclo;
  if (!Array.isArray(ciclo.tentativas)) ciclo.tentativas = [];
  ciclo.tentativas.push(tentativa || {});
  return ciclo;
}

function SOUSA_CICLO_precisaAutorizacao(ciclo, sinal) {
  if (!sinal) return {necessaria:false};
  var altoRisco = sinal.risco === "ALTO" || sinal.irreversivel === true ||
    sinal.altera_nucleo === true || sinal.exige_credencial === true;
  return {
    necessaria: !!altoRisco,
    motivo: altoRisco ? (sinal.motivo || "POLITICA_DE_GOVERNANCA") : null
  };
}
