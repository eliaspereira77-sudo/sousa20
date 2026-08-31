/**
 * SOUSA 2.0 — PORTA ÚNICA DE INTENÇÃO
 * ==========================================================
 * Todo comando humano (texto, voz, desktop ou smartphone) converge
 * para esta estrutura. Depois disso, o sistema trabalha autonomamente.
 */

function SOUSA_INTENCAO_normalizar(entrada) {
  if (!entrada) return {ok:false, status:"INTENCAO_AUSENTE"};

  if (typeof entrada === "string") {
    return {ok:true, origem:"TEXTO", texto:String(entrada).trim(),
      capacidade_sugerida:null, contexto:{}, timestamp:new Date().toISOString()};
  }

  if (typeof entrada === "object") {
    return {ok:true, origem:entrada.origem || "TEXTO",
      texto:String(entrada.texto || entrada.prompt || entrada.comando || "").trim(),
      capacidade_sugerida:entrada.capacidade || entrada.capacidade_sugerida || null,
      contexto:entrada.contexto || {}, metadados:entrada.metadados || {},
      timestamp:entrada.timestamp || new Date().toISOString()};
  }

  return {ok:false, status:"INTENCAO_FORMATO_INVALIDO"};
}

function SOUSA_INTENCAO_receber(entrada) {
  var normalizada = SOUSA_INTENCAO_normalizar(entrada);
  if (!normalizada.ok) return normalizada;
  if (!normalizada.texto) return {ok:false,status:"INTENCAO_VAZIA",
    mensagem:"Intenção sem texto utilizável."};

  if (!normalizada.capacidade_sugerida &&
      typeof SOUSA_POLITICA_inferirCapacidade === "function") {
    normalizada.capacidade_sugerida =
      SOUSA_POLITICA_inferirCapacidade(normalizada.texto);
  }
  return normalizada;
}

function SOUSA_INTENCAO_voz(audioReferencia) {
  return {ok:false,status:"ENCAIXE_STT",
    mensagem:"STT não conectado. Quando disponível, transcrever e chamar SOUSA_INTENCAO_receber(texto).",
    audio:audioReferencia || null};
}

function SOUSA_INTENCAO_desktop(payload) {
  return SOUSA_INTENCAO_normalizar({
    origem:"DESKTOP", texto:payload && (payload.texto || payload.comando),
    contexto:payload && payload.contexto, metadados:payload && payload.metadados
  });
}

function SOUSA_INTENCAO_smartphone(payload) {
  return SOUSA_INTENCAO_normalizar({
    origem:"SMARTPHONE", texto:payload && (payload.texto || payload.comando),
    contexto:payload && payload.contexto, metadados:payload && payload.metadados
  });
}
