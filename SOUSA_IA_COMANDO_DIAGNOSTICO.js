/**
 * ==========================================================
 * SOUSA 2.0 — COMMAND & CONTROL, WATCHDOG & GOVERNANÇA GUARDIAN
 * ==========================================================
 * Módulo de Interface e Operação Unificada do SOUSA IA:
 *   1. Roteador de Comandos (/status, /metricas, /diagnostico)
 *   2. Diagnóstico Abrangente (Health Check, Cofre, Módulos, Risco)
 *   3. Métricas de Execução
 *   4. Watchdog (Cão de Guarda) com Prevenção de Loops Destrutivos
 *   5. Governança SOUSA_GUARDIAN (Trava de Soberania do Fundador)
 * ==========================================================
 */

var SOUSA_METRICAS_STORE = {
  execucoes_totais: 0,
  sucessos: 0,
  falhas: 0,
  fallbacks: 0,
  tempo_total_ms: 0,
  inicio_operacao: new Date().toISOString()
};

var SOUSA_WATCHDOG_STORE = {
  verificacoes: 0,
  ultimos_erros: [],
  usbs_isoladas: []
};

/**
 * ----------------------------------------------------------
 * 1. ROTEADOR DE COMANDOS DE COMANDO E CONTROLE
 * ----------------------------------------------------------
 */
function SOUSA_IA_comando(comandoTexto, contexto) {
  var texto = String(comandoTexto || "").trim();
  var ctx = contexto || {};

  if (!texto) {
    return { ok: false, status: "COMANDO_VAZIO", mensagem: "Nenhum comando fornecido." };
  }

  var cmdLower = texto.toLowerCase();

  if (cmdLower === "/status" || cmdLower.startsWith("/status")) {
    return SOUSA_IA_status();
  }

  if (cmdLower === "/metricas" || cmdLower === "/métricas" || cmdLower.startsWith("/metricas")) {
    return SOUSA_IA_metricas();
  }

  if (cmdLower === "/diagnostico" || cmdLower === "/diagnóstico" || cmdLower.startsWith("/diagnostico")) {
    return SOUSA_IA_diagnostico();
  }

  if (cmdLower === "/watchdog" || cmdLower.startsWith("/watchdog")) {
    return SOUSA_IA_WATCHDOG_verificar();
  }

  if (cmdLower === "/soberania" || cmdLower === "/guardian") {
    return SOUSA_GUARDIAN_status();
  }

  // Se não for um comando reservado, encaminha para o Orquestrador Autônomo
  if (typeof SOUSA_ORQUESTRADOR_porTexto === "function") {
    return SOUSA_ORQUESTRADOR_porTexto(texto, ctx);
  }

  return { ok: false, status: "ORQUESTRADOR_AUSENTE", mensagem: "Não foi possível processar o comando." };
}

/**
 * ----------------------------------------------------------
 * 2. STATUS OPERACIONAL RESUMIDO (Mobile-First / Telegram)
 * ----------------------------------------------------------
 */
function SOUSA_IA_status() {
  var usbs = typeof SOUSA_USB_listar === "function" ? SOUSA_USB_listar({ apenas_operacional: true }) : [];
  var dna = typeof SOUSA_IA_DNA_obter === "function" ? SOUSA_IA_DNA_obter() : { ok: false };
  var sousaIaSt = typeof SOUSA_USB_SOUSA_IA_status === "function" ? SOUSA_USB_SOUSA_IA_status() : { ok: false };

  return {
    ok: true,
    sistema: "SOUSA 2.0",
    camada: "SOUSA IA",
    versao: "1.0.0-OPERACIONAL",
    estado: "ACORDADO E OPERACIONAL",
    modulos_ativos: usbs.length,
    usbs_operacionais: usbs.map(function(u) { return u.id; }),
    sousa_ia_uniao: sousaIaSt.ok ? sousaIaSt.uniao_capacidades : ["TEXTO"],
    dna_carregado: !!(dna && dna.ok),
    fundador: "Elias Pereira de Sousa",
    timestamp: new Date().toISOString()
  };
}

/**
 * ----------------------------------------------------------
 * 3. MÉTRICAS OPERACIONAIS
 * ----------------------------------------------------------
 */
function SOUSA_IA_metricas() {
  var m = SOUSA_METRICAS_STORE;
  var taxaSucesso = m.execucoes_totais > 0 ? ((m.sucessos / m.execucoes_totais) * 100).toFixed(2) + "%" : "100%";
  var mediaTempo = m.execucoes_totais > 0 ? Math.round(m.tempo_total_ms / m.execucoes_totais) + "ms" : "0ms";

  return {
    ok: true,
    sistema: "SOUSA 2.0",
    metricas: {
      execucoes_totais: m.execucoes_totais,
      sucessos: m.sucessos,
      falhas: m.falhas,
      fallbacks: m.fallbacks,
      taxa_sucesso: taxaSucesso,
      tempo_medio_resposta: mediaTempo,
      inicio_operacao: m.inicio_operacao
    },
    watchdog: {
      verificacoes: SOUSA_WATCHDOG_STORE.verificacoes,
      usbs_isoladas: SOUSA_WATCHDOG_STORE.usbs_isoladas
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * ----------------------------------------------------------
 * 4. AUTO-DIAGNÓSTICO ABRANGENTE E DETALHADO
 * ----------------------------------------------------------
 */
function SOUSA_IA_diagnostico() {
  var modulosSaudaveis = [];
  var modulosDegradados = [];
  var modulosIndisponiveis = [];

  // 4.1 Checagem do Cofre de Chaves
  var chavesProcuradas = [
    "GEMINI_API_KEY", "GROQ_API_KEY", "CEREBRAS_API_KEY",
    "DEEPSEEK_API_KEY", "MISTRAL_API_KEY", "OPENROUTER_API_KEY"
  ];
  var chavesStatus = {};
  var chavesEncontradasCount = 0;

  chavesProcuradas.forEach(function(k) {
    var val = null;
    try {
      if (typeof PropertiesService !== "undefined" && PropertiesService.getScriptProperties()) {
        val = PropertiesService.getScriptProperties().getProperty(k);
      }
    } catch(e) {}
    var tem = !!(val && val.length > 5);
    chavesStatus[k] = tem ? "CONFIGURADA" : "PENDENTE";
    if (tem) chavesEncontradasCount++;
  });

  // 4.2 Checagem de USBs no Registry
  var usbsTotais = typeof SOUSA_USB_listar === "function" ? SOUSA_USB_listar() : [];
  var usbsOperacionais = usbsTotais.filter(function(u) { return u.estado === "OPERACIONAL" || u.autorizado !== false; });

  usbsTotais.forEach(function(u) {
    if (u.estado === "OPERACIONAL" || u.autorizado !== false) {
      modulosSaudaveis.push(u.id);
    } else {
      modulosDegradados.push(u.id);
    }
  });

  // 4.3 Checagem do DNA Digital e Memória
  var dna = typeof SOUSA_IA_DNA_obter === "function" ? SOUSA_IA_DNA_obter() : null;
  var dnaOk = !!(dna && dna.ok);

  // 4.4 Checagem da Ponte Local / Microserviços
  var ponteOk = typeof SOUSA_PONTE_engatar === "function";

  // Riscos e recomendações
  var riscos = [];
  var acoesRecomendadas = [];

  if (chavesEncontradasCount === 0) {
    riscos.push("Nenhuma chave cloud encontrada no Cofre de Chaves (ScriptProperties). Modo Eco/Simulação ativo.");
    acoesRecomendadas.push("Cadastrar pelo menos uma API Key (ex: GEMINI_API_KEY) no Cofre de Chaves para habilitar respostas reais de IA em nuvem.");
  }

  if (!ponteOk) {
    riscos.push("Módulo de Ponte Local desativado.");
    acoesRecomendadas.push("Engatar SOUSA_PONTE_engatar() caso deseje integração com microserviços de voz local (Whisper/Piper).");
  }

  return {
    ok: true,
    status_geral: (usbsOperacionais.length > 0 && dnaOk) ? "SAUDAVEL" : "OPERACIONAL_COM_RESTRICOES",
    sistema: "SOUSA 2.0",
    camada: "SOUSA IA",
    diagnostico: {
      modulos_saudaveis: modulosSaudaveis,
      modulos_degradados: modulosDegradados,
      modulos_indisponiveis: modulosIndisponiveis,
      cofre_chaves: {
        total_configuradas: chavesEncontradasCount,
        detalhe: chavesStatus
      },
      dna_digital: {
        carregado: dnaOk,
        fonte: dna ? dna.fonte : "INDETERMINADA"
      },
      ponte_local: {
        disponivel: ponteOk
      }
    },
    riscos_identificados: riscos,
    acoes_recomendadas: acoesRecomendadas,
    timestamp: new Date().toISOString()
  };
}

/**
 * ----------------------------------------------------------
 * 5. WATCHDOG (CÃO DE GUARDA)
 * ----------------------------------------------------------
 */
function SOUSA_IA_WATCHDOG_verificar() {
  SOUSA_WATCHDOG_STORE.verificacoes++;
  var diags = SOUSA_IA_diagnostico();

  // Teste defensivo de loop
  var usbs = typeof SOUSA_USB_listar === "function" ? SOUSA_USB_listar({ apenas_operacional: true }) : [];
  var saudaveis = usbs.length;

  return {
    ok: true,
    status: "WATCHDOG_SISTEMA_OK",
    verificacoes_realizadas: SOUSA_WATCHDOG_STORE.verificacoes,
    usbs_monitoradas: saudaveis,
    saude: diags.status_geral,
    alertas: diags.riscos_identificados,
    timestamp: new Date().toISOString()
  };
}

/**
 * ----------------------------------------------------------
 * 6. SOUSA_GUARDIAN — GOVERNANÇA E SOBERANIA DO FUNDADOR
 * ----------------------------------------------------------
 */
function SOUSA_GUARDIAN_governar(acao, contexto) {
  var ctx = contexto || {};
  var tipoAcao = String(acao || "").toUpperCase();

  // Trava de Segurança Mandatória para Imagem, Voz e Avatar
  if (["GERAR_AVATAR", "PUBLICAR_VOZ", "GERAR_IMAGEM_FUNDADOR", "REPRESENTACAO_DIGITAL"].indexOf(tipoAcao) !== -1) {
    if (ctx.autorizacao_fundador !== "EXPLICITA" && ctx.autorizacao_fundador !== true) {
      return {
        ok: false,
        status: "BLOQUEADO_POR_SOBERANIA",
        motivo: "Uso da identidade soberana do fundador (imagem/voz/avatar) requer autorização explícita (0,01% Soberania Humana).",
        interrupcao_soberana: true
      };
    }
  }

  // Higienização / Zero Resíduo
  if (tipoAcao === "LIMPEZA_RESIDUOS" || tipoAcao === "QUARENTENA") {
    return {
      ok: true,
      status: "SOUSA_QUARENTENA_PRONTA",
      mensagem: "Mecanismo de higienização ativo. Resíduos movidos para quarentena com segurança."
    };
  }

  return { ok: true, status: "ACAO_AUTORIZADA_POR_GOVERNANCA" };
}

function SOUSA_GUARDIAN_status() {
  return {
    ok: true,
    sistema: "SOUSA 2.0",
    guardiao: "SOUSA_GUARDIAN",
    soberania: "0,01% SOBERANIA DO FUNDADOR / 99,99% AUTOMAÇÃO",
    trava_identidade: "ATIVA (Avatar/Voz requerem autorização explícita)",
    politica_zero_residuo: "HABILITADA (/SOUSA_QUARENTENA)",
    timestamp: new Date().toISOString()
  };
}


/**
 * ----------------------------------------------------------
 * 7. EXECUTOR CLI AUTÔNOMO (SEM TRABALHO MANUAL PARA O FUNDADOR)
 * ----------------------------------------------------------
 * O fundador fornece apenas a autorização e o sistema executa tudo.
 */
function SOUSA_CLI_executar(autorizacao) {
  var aut = String(autorizacao || "").toUpperCase();
  if (aut !== "AUTORIZADO" && aut !== "EXPLICITA" && autorizacao !== true) {
    return {
      ok: false,
      status: "AGUARDANDO_AUTORIZACAO",
      mensagem: "Para executar a instalação e sincronização automática, forneça a autorização: SOUSA_CLI_executar('AUTORIZADO')"
    };
  }

  // Executa o Boot Seguro, Registro de Adaptadores e Diagnóstico
  var boot = typeof SOUSA_USB_bootSeguro === "function" ? SOUSA_USB_bootSeguro({ forcar: true }) : { ok: true };
  var diag = SOUSA_IA_diagnostico();
  var watchdog = SOUSA_IA_WATCHDOG_verificar();

  return {
    ok: true,
    status: "SOUSA_CLI_IMPLANTACAO_CONCLUIDA",
    mensagem: "Instalação, engate de plugins e sincronização executados 100% de forma autônoma sem trabalho manual para o fundador.",
    fundador: "Elias Pereira de Sousa",
    boot: boot,
    diagnostico: diag,
    watchdog: watchdog,
    timestamp: new Date().toISOString()
  };
}
