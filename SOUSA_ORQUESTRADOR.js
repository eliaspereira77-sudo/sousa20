/**
 * SOUSA 2.0 — ORQUESTRADOR AUTÔNOMO
 * ==========================================================
 * Porta de trabalho após o comando humano:
 * intenção → autonomia → capacidade → política → USB → Executor →
 * verificação/recuperação → consolidação/registro.
 *
 * O módulo NÃO conhece fornecedores.
 */

function SOUSA_ORQUESTRADOR_criarCiclo(intencao) {
  if (typeof SOUSA_CICLO_criar === "function") {
    return SOUSA_CICLO_criar(intencao, intencao && intencao.contexto || {});
  }
  return {estado:"RECEBIDA", intencao:intencao || null, etapas:[]};
}

function SOUSA_ORQUESTRADOR_planejarComposto(necessidades, contexto) {
  if (typeof SOUSA_IA_planejar !== "function") {
    return {ok:false,status:"COMPOSITOR_AUSENTE"};
  }
  return SOUSA_IA_planejar(necessidades, contexto || {});
}

function SOUSA_ORQUESTRADOR_executar(intencao) {
  if (!intencao || !intencao.ok) {
    return {ok:false,status:"INTENCAO_INVALIDA",detalhe:intencao};
  }

  var ciclo = SOUSA_ORQUESTRADOR_criarCiclo(intencao);
  if (typeof SOUSA_CICLO_mudarEstado === "function")
    SOUSA_CICLO_mudarEstado(ciclo, "PLANEJANDO");

  var capacidade = intencao.capacidade_sugerida ||
    (typeof SOUSA_POLITICA_inferirCapacidade === "function"
      ? SOUSA_POLITICA_inferirCapacidade(intencao.texto) : "TEXTO");

  var selecao = SOUSA_POLITICA_selecionar(capacidade, intencao.contexto || {});
  if (!selecao || !selecao.ok) {
    if (typeof SOUSA_CICLO_mudarEstado === "function")
      SOUSA_CICLO_mudarEstado(ciclo, "FALHA", selecao);
    return {ok:false,status:"SELECAO_FALHOU",capacidade:capacidade,detalhe:selecao,ciclo:ciclo};
  }

  if (typeof SOUSA_CICLO_mudarEstado === "function")
    SOUSA_CICLO_mudarEstado(ciclo, "EXECUTANDO");

  var contextoExecutor = {
    texto:intencao.texto, capacidade:capacidade, origem:intencao.origem,
    metadados:intencao.metadados || {}
  };
  Object.keys(intencao.contexto || {}).forEach(function(k) {
    if (contextoExecutor[k] === undefined) contextoExecutor[k] = intencao.contexto[k];
  });

  var resultadoExecucao;
  if (typeof SOUSA_API_EXECUTOR_UNIVERSAL !== "function") {
    return {ok:false,status:"EXECUTOR_AUSENTE",ciclo:ciclo};
  }

  resultadoExecucao = SOUSA_API_EXECUTOR_UNIVERSAL({
    recurso_escolhido:selecao.recurso_escolhido, usb:selecao.usb || null
  }, contextoExecutor);

  if (typeof SOUSA_CICLO_registrarTentativa === "function")
    SOUSA_CICLO_registrarTentativa(ciclo, {
      recurso:selecao.recurso_escolhido,
      ok:!!(resultadoExecucao && resultadoExecucao.ok),
      status:resultadoExecucao && resultadoExecucao.status
    });

  if (typeof SOUSA_CICLO_mudarEstado === "function")
    SOUSA_CICLO_mudarEstado(ciclo, "VERIFICANDO", resultadoExecucao);

  var ok = !!(resultadoExecucao && resultadoExecucao.ok);
  if (ok && typeof SOUSA_CICLO_mudarEstado === "function")
    SOUSA_CICLO_mudarEstado(ciclo, "CONCLUIDA");

  return {
    ok:ok,
    status:(resultadoExecucao && resultadoExecucao.status) || "EXECUCAO_SEM_STATUS",
    capacidade:capacidade,
    recurso:selecao.recurso_escolhido,
    politica:selecao.politica || null,
    origem_intencao:intencao.origem,
    texto:(resultadoExecucao && resultadoExecucao.texto) || null,
    execucao:resultadoExecucao,
    ciclo:ciclo,
    timestamp:new Date().toISOString()
  };
}

function SOUSA_ORQUESTRADOR_porTexto(texto, contexto) {
  return SOUSA_ORQUESTRADOR_executar(
    SOUSA_INTENCAO_receber({texto:texto,origem:"TEXTO",contexto:contexto || {}})
  );
}

function SOUSA_ORQUESTRADOR_porCanal(canal, payload) {
  if (typeof SOUSA_CANAL_entregar !== "function")
    return {ok:false,status:"CANAIS_AUSENTES"};
  var intencao = SOUSA_CANAL_entregar(canal, payload);
  return SOUSA_ORQUESTRADOR_executar(intencao);
}

function SOUSA_ORQUESTRADOR_fluxo(nomeFluxo, parametros) {
  return {ok:false,status:"ENCAIXE_FLUXO",
    encaixe:"SOUSA_ORQUESTRADOR_fluxo",fluxo:nomeFluxo || null,
    parametros:parametros || {},
    mensagem:"Catálogo de fluxos de negócio ainda não conectado."};
}
