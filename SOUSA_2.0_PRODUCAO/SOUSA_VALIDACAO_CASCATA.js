/**
 * ==========================================================
 * SOUSA 2.0 — VALIDAÇÃO DE EVIDÊNCIA NA CASCATA (GAS)
 * ==========================================================
 * Materializa EXECUTAR ≠ CONCLUIR no caminho da cascata.
 * Não usa Node/fs. Não cadastra chave. Não duplica executor.
 *
 * Regra: sucesso só com evidência mínima de execução real.
 * ==========================================================
 */

var SOUSA_VALIDACAO_CASCATA_VERSAO = "1.0.0";

/** Estados alinhados ao Validador Universal (Seção 26) */
var SOUSA_ESTADOS_VERDADE = {
  CONFIRMADO: "CONFIRMADO",
  PROVAVEL: "PROVAVEL",
  NAO_VERIFICADO: "NAO_VERIFICADO",
  BLOQUEADO: "BLOQUEADO",
  FALHOU: "FALHOU",
  NAO_EXECUTADO: "NAO_EXECUTADO",
  ESTADO_DESCONHECIDO: "ESTADO_DESCONHECIDO"
};

/**
 * Evidência mínima para concluir execução de LLM via cascata.
 * - ok === true
 * - provedor (ou cascata.vencedor)
 * - texto utilizável (não vazio)
 * - não pode ser só simulação sem flag explícita aceita
 */
function SOUSA_validarResultadoCascata(resultado, opcoes) {
  var opts = opcoes || {};
  var aceitarSimulacao = opts.aceitar_simulacao === true;
  var r = resultado || {};

  var evidencias = [];
  var falhas = [];

  if (!resultado || typeof resultado !== "object") {
    return _packValidacao(SOUSA_ESTADOS_VERDADE.NAO_EXECUTADO, false, {
      motivo: "RESULTADO_AUSENTE",
      falhas: ["resultado nulo ou inválido"],
      evidencias: evidencias
    });
  }

  // 1) Flag ok
  if (r.ok === true) {
    evidencias.push("ok=true");
  } else {
    falhas.push("ok!==true (status=" + (r.status || "?") + ")");
  }

  // 2) Provedor / vencedor
  var provedor = r.provedor || (r.cascata && r.cascata.vencedor) || null;
  if (provedor && String(provedor).trim()) {
    evidencias.push("provedor=" + provedor);
  } else {
    falhas.push("provedor ausente");
  }

  // 3) Texto (ou campo equivalente)
  var texto = r.texto != null ? String(r.texto) : "";
  if (!texto && r.data && r.data.texto) texto = String(r.data.texto);
  if (texto.trim().length > 0) {
    evidencias.push("texto_len=" + texto.trim().length);
  } else {
    falhas.push("texto vazio ou ausente");
  }

  // 4) Simulação
  if (r.simulacao === true && !aceitarSimulacao) {
    falhas.push("resultado é simulação (TESTE_ECO) e aceitar_simulacao=false");
  } else if (r.simulacao === true) {
    evidencias.push("simulacao=true (aceita por opção)");
  }

  // 5) HTTP quando presente
  if (typeof r.codigo_http === "number") {
    if (r.codigo_http >= 200 && r.codigo_http < 300) {
      evidencias.push("codigo_http=" + r.codigo_http);
    } else {
      falhas.push("codigo_http inválido: " + r.codigo_http);
    }
  }

  // 6) Cascata esgotada nunca conclui
  if (r.status === "CASCATA_ESGOTADA") {
    falhas.push("CASCATA_ESGOTADA");
  }

  var confirmado = falhas.length === 0 && r.ok === true;
  var estado = confirmado
    ? SOUSA_ESTADOS_VERDADE.CONFIRMADO
    : (r.ok === false || falhas.length
        ? SOUSA_ESTADOS_VERDADE.FALHOU
        : SOUSA_ESTADOS_VERDADE.NAO_VERIFICADO);

  return _packValidacao(estado, confirmado, {
    motivo: confirmado ? "EVIDENCIA_OK" : "EVIDENCIA_INSUFICIENTE",
    falhas: falhas,
    evidencias: evidencias,
    provedor: provedor,
    texto_preview: texto.trim().substring(0, 120),
    status_origem: r.status || null,
    tentativas: (r.cascata && r.cascata.tentativas) || r.tentativas || null
  });
}

function _packValidacao(estado, concluido, extra) {
  return {
    estado_verdade: estado,
    concluido: !!concluido,
    principio: "EXECUTAR_DIFERENTE_CONCLUIR",
    versao: SOUSA_VALIDACAO_CASCATA_VERSAO,
    timestamp: new Date().toISOString(),
    motivo: extra.motivo,
    falhas: extra.falhas || [],
    evidencias: extra.evidencias || [],
    provedor: extra.provedor || null,
    texto_preview: extra.texto_preview || null,
    status_origem: extra.status_origem || null,
    tentativas: extra.tentativas || null
  };
}

/**
 * Executa cascata + valida evidência.
 * Único ponto recomendado para chat/diagnóstico real.
 *
 * @param {string} capacidade  ex: "TEXTO"
 * @param {Object} contexto    { texto|prompt, systemInstruction?, history? }
 * @param {Object} [opcoes]    passadas ao executor + { aceitar_simulacao }
 * @returns {Object} resultado executor enriquecido com .validacao
 */
function SOUSA_cascataComValidacao(capacidade, contexto, opcoes) {
  var opts = opcoes || {};

  if (typeof SOUSA_API_EXECUTOR_COM_CASCATA !== "function") {
    return {
      ok: false,
      status: "EXECUTOR_AUSENTE",
      success: false,
      validacao: _packValidacao(SOUSA_ESTADOS_VERDADE.NAO_EXECUTADO, false, {
        motivo: "EXECUTOR_AUSENTE",
        falhas: ["SOUSA_API_EXECUTOR_COM_CASCATA não está no projeto"],
        evidencias: []
      })
    };
  }

  // Boot defensivo (idempotente se já rodou)
  if (typeof SOUSA_USB_ADAPTER_bootstrap === "function") {
    try { SOUSA_USB_ADAPTER_bootstrap(); } catch (e) {}
  }
  if (typeof SOUSA_USB_semearCascataLegada === "function") {
    try { SOUSA_USB_semearCascataLegada(); } catch (e) {}
  }

  var bruto = SOUSA_API_EXECUTOR_COM_CASCATA(
    capacidade || "TEXTO",
    contexto || {},
    opts
  );

  var validacao = SOUSA_validarResultadoCascata(bruto, {
    aceitar_simulacao: opts.aceitar_simulacao === true
  });

  // Contrato: success/concluido só com evidência
  var out = bruto && typeof bruto === "object" ? bruto : {};
  out.validacao = validacao;
  out.success = validacao.concluido === true;
  out.concluido = validacao.concluido === true;
  out.estado_verdade = validacao.estado_verdade;

  if (!validacao.concluido) {
    out.ok = false;
    if (!out.status || out.status === "EXECUCAO_CONCLUIDA") {
      out.status = out.status === "CASCATA_ESGOTADA"
        ? "CASCATA_ESGOTADA"
        : "VALIDACAO_FALHOU";
    }
  }

  return out;
}

/**
 * Diagnóstico real: não declara saúde sem atravessar a cascata.
 */
function SOUSA_diagnosticoComEvidencia() {
  var r = SOUSA_cascataComValidacao("TEXTO", {
    texto: "Responda exatamente com uma palavra: pong"
  });

  return {
    action: "diagnostico",
    success: r.success === true,
    concluido: r.concluido === true,
    estado_verdade: r.estado_verdade,
    sistema: r.success ? "OPERACIONAL_COM_EVIDENCIA" : "FALHA_OU_SEM_EVIDENCIA",
    cascata: {
      ok: r.ok,
      status: r.status,
      provedor: r.provedor || (r.validacao && r.validacao.provedor),
      texto: r.texto || null,
      tentativas: r.validacao && r.validacao.tentativas
    },
    validacao: r.validacao,
    timestamp: new Date().toISOString()
  };
}

/**
 * Ping real via cascata (não JSON fixo).
 */
function SOUSA_pingComEvidencia() {
  var r = SOUSA_cascataComValidacao("TEXTO", {
    texto: "Responda exatamente com a palavra: pong"
  });
  return {
    action: "ping",
    success: r.success === true,
    concluido: r.concluido === true,
    estado_verdade: r.estado_verdade,
    status: r.success ? "online_com_evidencia" : "offline_ou_sem_evidencia",
    provedor: r.provedor || (r.validacao && r.validacao.provedor),
    texto: r.texto || null,
    validacao: r.validacao,
    timestamp: new Date().toISOString()
  };
}
