/**
 * ==========================================================
 * SOUSA 2.0 — ORQUESTRADOR CENTRAL AUTÔNOMO
 * ==========================================================
 * Conecta a cadeia viva do ecossistema:
 * INTENÇÃO → PLANEJAR → EXECUTAR → VERIFICAR → RECUPERAR →
 * CONSOLIDAR → REGISTRAR → CONCLUIR.
 *
 * Princípio: EXECUTAR != CONCLUIR
 * Não cria novas pontes ou ferramentas desnecessárias;
 * mobiliza estritamente os componentes já existentes:
 * - SOUSA_INTENCAO
 * - SOUSA_CICLO_AUTONOMO
 * - SOUSA_POLITICA
 * - SOUSA_API_EXECUTOR_UNIVERSAL
 * ==========================================================
 */

/**
 * Cria um ciclo autônomo a partir de dados ou intenção.
 */
function SOUSA_ORQUESTRADOR_criarCiclo(dados, contexto) {
  var intencao = null;
  var ctx = contexto || {};

  if (dados && dados.tipo && !dados.origem) {
    intencao = {
      ok: true,
      origem: dados.origem || "ORQUESTRADOR",
      texto: dados.texto || dados.tipo || "CICLO_AUTONOMO",
      tipo: dados.tipo,
      contexto: dados
    };
  } else if (typeof SOUSA_INTENCAO_receber === "function") {
    intencao = SOUSA_INTENCAO_receber(dados);
  } else {
    intencao = dados || { ok: true, texto: "COMANDO_DIRETO" };
  }

  if (typeof SOUSA_CICLO_criar === "function") {
    return SOUSA_CICLO_criar(intencao, ctx);
  }

  return {
    id: "CICLO_" + Date.now(),
    estado: "RECEBIDA",
    intencao: intencao,
    contexto: ctx,
    tentativas: [],
    plano: [],
    resultados: [],
    autorizacoes: [],
    inicio: new Date().toISOString()
  };
}

/**
 * Monta o plano composto de etapas a partir da intenção e do contexto.
 */
function SOUSA_ORQUESTRADOR_planejarComposto(intencao, contexto) {
  var cap = (intencao && intencao.capacidade_sugerida) || null;
  var texto = (intencao && intencao.texto) || "";

  if (!cap && typeof SOUSA_POLITICA_inferirCapacidade === "function") {
    cap = SOUSA_POLITICA_inferirCapacidade(texto);
  }
  if (!cap) cap = "TEXTO";

  var selecao = null;
  if (typeof SOUSA_POLITICA_selecionar === "function") {
    selecao = SOUSA_POLITICA_selecionar(cap, contexto);
  }

  var etapas = [
    {
      etapa: 1,
      nome: "EXECUCAO_PRINCIPAL",
      capacidade: cap,
      selecao: selecao,
      obrigatoria: true
    }
  ];

  return {
    ok: true,
    capacidade: cap,
    selecao: selecao,
    etapas: etapas,
    plano: etapas
  };
}

/**
 * Executa o fluxo completo do ciclo de vida autônomo.
 */
function SOUSA_ORQUESTRADOR_fluxo(ciclo) {
  if (!ciclo) {
    return { ok: false, status: "CICLO_INVALIDO", mensagem: "Ciclo ausente." };
  }

  function mudar(estado, detalhe) {
    if (typeof SOUSA_CICLO_mudarEstado === "function") {
      SOUSA_CICLO_mudarEstado(ciclo, estado, detalhe);
    } else {
      ciclo.estado = estado;
      ciclo.ultimo_evento = { estado: estado, detalhe: detalhe, timestamp: new Date().toISOString() };
    }
  }

  function registrarTentativa(tentativa) {
    if (typeof SOUSA_CICLO_registrarTentativa === "function") {
      SOUSA_CICLO_registrarTentativa(ciclo, tentativa);
    } else {
      if (!Array.isArray(ciclo.tentativas)) ciclo.tentativas = [];
      ciclo.tentativas.push(tentativa);
    }
  }

  // 1. Planejamento
  mudar("PLANEJANDO", "Iniciando planejamento da intenção");
  var planejamento = SOUSA_ORQUESTRADOR_planejarComposto(ciclo.intencao, ciclo.contexto);
  ciclo.plano = planejamento.etapas || [];

  // 2. Governança e Verificação de Autorização
  if (typeof SOUSA_CICLO_precisaAutorizacao === "function") {
    var checkAuth = SOUSA_CICLO_precisaAutorizacao(ciclo, ciclo.intencao && ciclo.intencao.contexto);
    if (checkAuth && checkAuth.necessaria) {
      mudar("AGUARDANDO_AUTORIZACAO", checkAuth.motivo);
      return {
        ok: false,
        status: "AGUARDANDO_AUTORIZACAO",
        motivo: checkAuth.motivo,
        ciclo: ciclo
      };
    }
  }

  // 3. Execução
  mudar("EXECUTANDO", "Mobilizando componentes e adaptadores");
  var resultadoFinal = null;
  var cap = String(planejamento.capacidade || "TEXTO").toUpperCase();
  var selecao = planejamento.selecao;

  if (typeof SOUSA_API_EXECUTOR_UNIVERSAL === "function" && selecao && selecao.ok) {
    resultadoFinal = SOUSA_API_EXECUTOR_UNIVERSAL(selecao, ciclo.contexto);
    registrarTentativa({
      modo: "DIRETO",
      recurso: selecao.recurso_escolhido,
      resultado: resultadoFinal
    });
  }

  // 3b. Despacho para capacidades internas do ecossistema se não atendido por USB externa
  if ((!resultadoFinal || !resultadoFinal.ok)) {
    if ((cap === "MANUTENCAO_REFINO" || cap === "MANUTENCAO") && typeof SOUSA_MANUTENCAO_executarCicloCompleto === "function") {
      resultadoFinal = SOUSA_MANUTENCAO_executarCicloCompleto(ciclo.contexto || {});
      registrarTentativa({
        modo: "CAPACIDADE_INTERNA",
        modulo: "SOUSA_MANUTENCAO_REFINO",
        resultado: resultadoFinal
      });
    } else if ((cap === "DIAGNOSTICO" || cap === "AUTO_DIAGNOSTICO") && typeof SOUSA_AUTO_DIAGNOSTICO === "function") {
      resultadoFinal = SOUSA_AUTO_DIAGNOSTICO();
      registrarTentativa({
        modo: "CAPACIDADE_INTERNA",
        modulo: "SOUSA_AUTO_DIAGNOSTICO",
        resultado: resultadoFinal
      });
    }
  }

  // 4. Verificação & Recuperação com Fallback / Cascata
  mudar("VERIFICANDO", "Validando retorno do executor");
  if (!resultadoFinal || !resultadoFinal.ok) {
    mudar("RECUPERANDO", "Acionando fallback inteligente da política");
    if (typeof SOUSA_API_EXECUTOR_COM_CASCATA === "function") {
      resultadoFinal = SOUSA_API_EXECUTOR_COM_CASCATA(cap, ciclo.contexto);
      registrarTentativa({
        modo: "CASCATA",
        capacidade: cap,
        resultado: resultadoFinal
      });
    }
  }

  // 5. Consolidação e Conclusão
  if (resultadoFinal && resultadoFinal.ok) {
    mudar("CONSOLIDANDO", "Consolidando resultado operacional");
    if (!Array.isArray(ciclo.resultados)) ciclo.resultados = [];
    ciclo.resultados.push(resultadoFinal);

    mudar("REGISTRANDO", "Gravando histórico do ciclo");
    mudar("CONCLUIDA", "Ciclo operacional cumprido com integridade");
    ciclo.fim = new Date().toISOString();

    return {
      ok: true,
      status: "CONCLUIDA",
      ciclo: ciclo,
      resultado: resultadoFinal
    };
  }

  mudar("FALHA", (resultadoFinal && resultadoFinal.mensagem) || "Falha na cadeia executiva");
  return {
    ok: false,
    status: "FALHA",
    ciclo: ciclo,
    erro: resultadoFinal || "Sem retorno do executor"
  };
}

/**
 * Ponto de entrada executivo: recebe a intenção bruta, inicializa e executa.
 */
function SOUSA_ORQUESTRADOR_executar(intencao, contexto) {
  var ciclo = SOUSA_ORQUESTRADOR_criarCiclo(intencao, contexto);
  return SOUSA_ORQUESTRADOR_fluxo(ciclo);
}

/**
 * Ponto de entrada de alto nível por texto puro.
 */
function SOUSA_ORQUESTRADOR_porTexto(texto, contexto) {
  var normalizada = null;
  if (typeof SOUSA_INTENCAO_receber === "function") {
    normalizada = SOUSA_INTENCAO_receber(texto);
  } else {
    normalizada = {
      ok: true,
      origem: "TEXTO",
      texto: String(texto || "").trim(),
      capacidade_sugerida: "TEXTO",
      contexto: contexto || {},
      timestamp: new Date().toISOString()
    };
  }

  if (contexto && typeof contexto === "object") {
    normalizada.contexto = Object.assign(normalizada.contexto || {}, contexto);
  }

  return SOUSA_ORQUESTRADOR_executar(normalizada, normalizada.contexto);
}

/**
 * Ponto de entrada por canal específico (DESKTOP, SMARTPHONE, API, WEB).
 */
function SOUSA_ORQUESTRADOR_porCanal(canal, entrada, opcoes) {
  var canalNorm = String(canal || "WEB").toUpperCase();
  var intencao = null;

  if (canalNorm === "DESKTOP" && typeof SOUSA_INTENCAO_desktop === "function") {
    intencao = SOUSA_INTENCAO_desktop(entrada);
  } else if (canalNorm === "SMARTPHONE" && typeof SOUSA_INTENCAO_smartphone === "function") {
    intencao = SOUSA_INTENCAO_smartphone(entrada);
  } else if (typeof SOUSA_INTENCAO_receber === "function") {
    intencao = SOUSA_INTENCAO_receber(entrada);
  } else {
    intencao = { ok: true, origem: canalNorm, texto: String(entrada || "") };
  }

  return SOUSA_ORQUESTRADOR_executar(intencao, opcoes);
}

// Compatibilidade CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SOUSA_ORQUESTRADOR_criarCiclo: SOUSA_ORQUESTRADOR_criarCiclo,
    SOUSA_ORQUESTRADOR_planejarComposto: SOUSA_ORQUESTRADOR_planejarComposto,
    SOUSA_ORQUESTRADOR_executar: SOUSA_ORQUESTRADOR_executar,
    SOUSA_ORQUESTRADOR_porTexto: SOUSA_ORQUESTRADOR_porTexto,
    SOUSA_ORQUESTRADOR_porCanal: SOUSA_ORQUESTRADOR_porCanal,
    SOUSA_ORQUESTRADOR_fluxo: SOUSA_ORQUESTRADOR_fluxo
  };
}
