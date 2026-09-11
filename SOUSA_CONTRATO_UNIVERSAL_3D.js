
// ============================================================
// SOUSA 2.0 — REGRA DE EVOLUÇÃO SEM DUPLICAÇÃO
// ID: SOUSA-EVD-001
// ============================================================

const SOUSA_EVOLUCAO_SEM_DUPLICACAO = Object.freeze({

  id: "SOUSA-EVD-001",
  nome: "Evolução sem Duplicação",
  versao: "1.0.0",
  status: "ATIVA",

  principio:
    "CRIAR NÃO É PROIBIDO. DUPLICAR É PROIBIDO.",

  prioridade: Object.freeze([
    "REFINAR",
    "ATUALIZAR",
    "CORRIGIR",
    "INTEGRAR",
    "AMPLIAR_CAPACIDADE",
    "REUTILIZAR",
    "CRIAR_SE_LACUNA_COMPROVADA"
  ]),

  regra:
    "Toda capacidade existente deve ser preferencialmente refinada, " +
    "atualizada, corrigida, integrada ou ampliada antes da criação " +
    "de uma capacidade equivalente.",

  criacao_nova:
    "Uma nova capacidade poderá ser criada quando houver lacuna " +
    "funcional comprovada que não possa ser resolvida pelo " +
    "refino, atualização, correção, integração ou ampliação " +
    "do que já existe.",

  proibicoes: Object.freeze({
    duplicar_funcao_existente: true,
    criar_modulo_equivalente: true,
    criar_agente_equivalente: true,
    criar_worker_equivalente: true,
    criar_conector_equivalente: true,
    criar_contrato_paralelo: true,
    criar_so_para_evitar_refino: true
  }),

  autorizacoes: Object.freeze({
    refinar: true,
    atualizar: true,
    corrigir: true,
    integrar: true,
    ampliar: true,
    criar_por_lacuna: true,
    inovar_por_lacuna: true
  }),

  criterio:
    "O objetivo não é impedir crescimento do SOUSA 2.0. " +
    "O objetivo é garantir que seu crescimento ocorra por evolução " +
    "inteligente do ecossistema, evitando duplicação, fragmentação " +
    "e desperdício de capacidade.",

  soberania_fundador: true,
  preservar_source_of_truth: true
});


// ============================================================
// VALIDADOR
// ============================================================

function SOUSA_VALIDAR_EVOLUCAO(decisao = {}) {

  const bloqueios = [];

  if (
    decisao.duplicacao === true &&
    decisao.lacuna_comprovada !== true
  ) {
    bloqueios.push(
      "DUPLICAÇÃO SEM LACUNA COMPROVADA"
    );
  }

  if (
    decisao.recurso_existente === true &&
    decisao.refino_atualizacao_integracao !== true &&
    decisao.criar_novo === true
  ) {
    bloqueios.push(
      "EVOLUÇÃO DO EXISTENTE NÃO TENTADA"
    );
  }

  return Object.freeze({
    valido: bloqueios.length === 0,
    bloqueado: bloqueios.length > 0,
    bloqueios,
    regra: "SOUSA-EVD-001"
  });
}


// ============================================================
// SOUSA 2.0 — CONTRATO UNIVERSAL DE EVOLUÇÃO
// ID: SOUSA-EIA-001
// ============================================================

const SOUSA_CONTRATO_EVOLUCAO_INTEGRACAO_APRENDIZADO =
Object.freeze({

  id: "SOUSA-EIA-001",
  nome: "Contrato Universal de Evolução, Integração e Aprendizado",
  versao: "1.0.0",
  status: "ATIVO",

  // ----------------------------------------------------------
  // PRINCÍPIO FUNDAMENTAL
  // ----------------------------------------------------------

  principio:
    "Se puder simplificar, simplifique. " +
    "Se puder tornar mais prático, torne. " +
    "Se puder automatizar, automatize.",

  // ----------------------------------------------------------
  // ORDEM OBRIGATÓRIA DE EVOLUÇÃO
  // ----------------------------------------------------------

  prioridade: Object.freeze([
    "VERIFICAR",
    "REUTILIZAR",
    "ABSORVER",
    "ADAPTAR",
    "REFINAR",
    "ATUALIZAR",
    "INTEGRAR",
    "REPARAR",
    "AMPLIAR",
    "CRIAR_SE_LACUNA_COMPROVADA"
  ]),

  // ----------------------------------------------------------
  // ANTI-DUPLICIDADE
  // ----------------------------------------------------------

  anti_duplicidade: Object.freeze({

    ativo: true,

    bloquear_duplicacao_de:
      Object.freeze([
        "capacidade",
        "habilidade",
        "comportamento",
        "agente",
        "modulo",
        "worker",
        "conector",
        "funcionalidade",
        "contrato",
        "estrutura"
      ]),

    regra:
      "Criar não é proibido. Duplicar é proibido.",

    excecao:
      "Nova criação somente mediante lacuna funcional comprovada."
  }),

  // ----------------------------------------------------------
  // ABSORÇÃO DE CAPACIDADES
  // ----------------------------------------------------------

  absorcao: Object.freeze({

    ativa: true,

    elementos:
      Object.freeze([
        "capacidades",
        "habilidades",
        "comportamentos",
        "conhecimentos",
        "metodos",
        "estrategias",
        "padroes_de_execucao",
        "mecanismos_de_raciocinio",
        "mecanismos_de_verificacao",
        "mecanismos_de_recuperacao"
      ]),

    regra:
      "Capacidade útil existente no ecossistema deve ser " +
      "preferencialmente absorvida, adaptada ou integrada " +
      "antes de qualquer criação equivalente."
  }),

  // ----------------------------------------------------------
  // ANTI-ISOLAMENTO
  // ----------------------------------------------------------

  anti_isolamento: Object.freeze({

    ativo: true,

    proibido:
      "Agente, módulo, worker, capacidade, habilidade ou " +
      "conector permanecer funcionalmente isolado quando " +
      "houver possibilidade de integração.",

    protocolo: Object.freeze([
      "DETECTAR",
      "DIAGNOSTICAR",
      "LOCALIZAR_PONTE",
      "CONECTAR",
      "TESTAR",
      "INTEGRAR",
      "REGISTRAR"
    ])
  }),

  // ----------------------------------------------------------
  // ANTI-LETARGIA
  // ----------------------------------------------------------

  anti_letargia: Object.freeze({

    ativo: true,

    regra:
      "Recursos não devem permanecer inertes por falha de " +
      "descoberta, acionamento ou integração quando houver " +
      "função compatível disponível.",

    protocolo: Object.freeze([
      "DETECTAR",
      "IDENTIFICAR_CAPACIDADE",
      "LOCALIZAR_FUNCAO_COMPATIVEL",
      "ACIONAR",
      "TESTAR",
      "INTEGRAR",
      "APRENDER"
    ])
  }),

  // ----------------------------------------------------------
  // APRENDIZADO CONTÍNUO
  // ----------------------------------------------------------

  aprendizado: Object.freeze({

    ativo: true,

    aprender_com:
      Object.freeze([
        "sucessos",
        "falhas",
        "correcoes",
        "integracoes",
        "adaptacoes",
        "automacoes",
        "descobertas",
        "recuperacoes",
        "refinamentos",
        "reducoes_de_etapas",
        "reducoes_de_intervencao_humana"
      ]),

    regra:
      "Toda solução relevante deve aumentar a capacidade " +
      "futura do ecossistema."
  }),

  // ----------------------------------------------------------
  // FILTRO UNIVERSAL DE COMANDO
  // ----------------------------------------------------------

  filtro_comando: Object.freeze([
    "INTENCAO",
    "VERIFICAR_EXISTENCIA",
    "IDENTIFICAR_CAPACIDADE",
    "ABSORVER",
    "ADAPTAR",
    "REFINAR",
    "ATUALIZAR",
    "INTEGRAR",
    "REPARAR",
    "EXECUTAR",
    "VERIFICAR",
    "CONSOLIDAR",
    "APRENDER"
  ]),

  // ----------------------------------------------------------
  // CRIAÇÃO
  // ----------------------------------------------------------

  criacao: Object.freeze({

    permitida: true,

    requisito:
      "Lacuna funcional comprovada.",

    condicoes:
      Object.freeze([
        "capacidade_inexistente",
        "solucao_existente_insuficiente",
        "refino_inviavel",
        "adaptacao_inviavel",
        "integracao_inviavel"
      ]),

    obrigacoes:
      Object.freeze([
        "justificar",
        "registrar_lacuna",
        "preservar_source_of_truth",
        "preservar_integridade",
        "preservar_soberania"
      ])
  }),

  // ----------------------------------------------------------
  // NÃO-REGRESSÃO
  // ----------------------------------------------------------

  nao_regressao: Object.freeze({

    ativo: true,

    impedir:
      Object.freeze([
        "aumento_desnecessario_de_complexidade",
        "aumento_desnecessario_de_trabalho_manual",
        "duplicacao",
        "fragmentacao",
        "isolamento",
        "perda_de_capacidade",
        "quebra_de_integracao"
      ])
  }),

  // ----------------------------------------------------------
  // SOBERANIA
  // ----------------------------------------------------------

  soberania: Object.freeze({

    fundador: true,
    source_of_truth: true,

    regra:
      "Toda capacidade integrada ao ecossistema permanece " +
      "sob o comando soberano do fundador."
  }),

  // ----------------------------------------------------------
  // OBJETIVO
  // ----------------------------------------------------------

  objetivo:
    "Mais capacidade, menos complexidade, mais automação, " +
    "menos trabalho manual, mais integração, menos isolamento, " +
    "mais aprendizado e menos repetição."
});


// ============================================================
// VALIDADOR UNIVERSAL DE EVOLUÇÃO
// ============================================================

function SOUSA_VALIDAR_EVOLUCAO(decisao = {}) {

  const bloqueios = [];

  const existe =
    decisao.recurso_existente === true;

  const equivalente =
    decisao.recurso_equivalente === true;

  const criando =
    decisao.criar_novo === true;

  const lacuna =
    decisao.lacuna_comprovada === true;

  // ----------------------------------------------------------
  // DUPLICAÇÃO
  // ----------------------------------------------------------

  if (
    criando &&
    (existe || equivalente) &&
    !decisao.adaptar &&
    !decisao.refinar &&
    !decisao.integrar &&
    !decisao.absorver
  ) {
    bloqueios.push(
      "DUPLICACAO_DE_RECURSO_EXISTENTE"
    );
  }

  // ----------------------------------------------------------
  // CRIAÇÃO SEM LACUNA
  // ----------------------------------------------------------

  if (
    criando &&
    !lacuna &&
    (existe || equivalente)
  ) {
    bloqueios.push(
      "CRIACAO_SEM_LACUNA_COMPROVADA"
    );
  }

  // ----------------------------------------------------------
  // ISOLAMENTO
  // ----------------------------------------------------------

  if (
    decisao.isolado === true &&
    decisao.integrar === false &&
    decisao.lacuna_comprovada !== true
  ) {
    bloqueios.push(
      "ISOLAMENTO_NAO_TRATADO"
    );
  }

  // ----------------------------------------------------------
  // RESULTADO
  // ----------------------------------------------------------

  return Object.freeze({

    valido: bloqueios.length === 0,

    bloqueado: bloqueios.length > 0,

    bloqueios,

    contrato: "SOUSA-EIA-001",

    principio:
      "CRIAR NÃO É PROIBIDO. DUPLICAR É PROIBIDO."
  });
}


// SOUSA_AUTO_GESTAO_OPERACIONAL: AUTOINVENTARIO + AUTOAUDITORIA + AUTODIAGNOSTICO + DETECCAO_DE_LACUNAS + DETECCAO_DE_INOPERANTES + DETECCAO_DE_ORFAOS + DETECCAO_DE_REDUNDANCIAS + VERIFICACAO_SOURCE_OF_TRUTH + AUTORECUPERACAO + RETESTE + CONSOLIDACAO + RELATORIO_AO_FUNDADOR; FUNDADOR_INTERVEM_APENAS_QUANDO_SOBERANIA_HUMANA_FOR_NECESSARIA; REUTILIZAR_CAPACIDADES_EXISTENTES_ANTES_DE_CRIAR_NOVAS; META=99.99_AUTOMACAO_0.01_SOBERANIA
