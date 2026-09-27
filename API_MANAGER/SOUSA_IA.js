/**
 * ==========================================================
 * SOUSA_IA.js
 * Camada de Inteligência, Contexto e Coordenação
 * SOUSA 2.0
 * v1.0.0
 *
 * PRINCÍPIO:
 * SOUSA IA coordena competências; não substitui os módulos.
 *
 * Fluxo:
 * COMANDO
 *   -> CONTEXTO
 *   -> CONHECIMENTO
 *   -> COMPETÊNCIA
 *   -> DELEGAÇÃO
 *   -> RESULTADO
 *   -> APRENDIZADO
 *   -> SUGESTÃO
 *
 * Soberania:
 * Nenhuma alteração estrutural é executada automaticamente.
 * ==========================================================
 */

const SOUSA_IA = {

  versao: "2.0.0",

  identidade: {
    sistema: "SOUSA 2.0",
    nome: "SOUSA IA",
    funcao: "Camada central de inteligência, coordenação e aprendizado.",
    principio: "Todo módulo atua como agente especializado e responde à SOUSA IA."
  },

  coordenacao: {
    id: "sousa-ia",
    nome: "SOUSA IA",
    funcao: "Coordenação única dos agentes especializados."
  },

  agentesEspecializados: [
    { id: "ads", nome: "ADS", especialidade: "Desenvolvimento, escrita e estruturação", termos: ["código", "codigo", "programação", "programacao", "software", "sistema", "script", "api", "arquitetura", "bug", "erro", "programar", "desenvolver", "desenvolvimento", "hardware", "computador", "engenharia"] },
    { id: "juridico", nome: "JURÍDICO", especialidade: "Proteção legal, conformidade e direitos", termos: ["lei", "legal", "jurídico", "juridico", "contrato", "direito", "processo", "conformidade", "marca"] },
    { id: "financeiro", nome: "FINANCEIRO", especialidade: "Registros, relatórios e transparência financeira", termos: ["dinheiro", "finanças", "financas", "investimento", "renda", "dívida", "divida", "custo", "orçamento", "orcamento", "financeiro"] },
    { id: "produtor", nome: "PRODUTOR", especialidade: "Criação e entrega de conteúdo", termos: ["conteúdo", "conteudo", "roteiro", "vídeo", "video", "post", "legenda", "youtube", "instagram", "facebook", "tiktok", "kwai"] },
    { id: "afiliadospro", nome: "AFILIADOSPRO", especialidade: "Recomendação de produtos e preservação de identidade", termos: ["afiliado", "afiliados", "mercado livre", "shopee", "amazon", "comissão", "comissao", "produto", "venda"] },
    { id: "estrategista", nome: "ESTRATEGISTA", especialidade: "Estudo, planejamento e indicação de caminhos", termos: ["estratégia", "estrategia", "planejamento", "prioridade", "decisão", "decisao", "plano"] },
    { id: "saber-conhecimento", nome: "SABER_CONHECIMENTO", especialidade: "Aprendizado, armazenamento e evolução do conhecimento", termos: ["o que é", "o que e", "como funciona", "história", "historia", "ciência", "ciencia", "curiosidade", "conhecimento", "aprender"] },
    { id: "mentor", nome: "MENTOR", especialidade: "Propósito, orientação e fortalecimento", termos: ["propósito", "proposito", "legado", "vida", "família", "familia", "futuro", "motivação", "motivacao"] },
    { id: "cao-de-guarda", nome: "CÃO DE GUARDA", especialidade: "Vigilância, detecção, alerta e proteção", termos: ["vigiar", "vigilância", "vigilancia", "anomalia", "risco", "alerta", "integridade", "segurança", "seguranca"] },
    { id: "mecanico-faxineiro", nome: "MECANICO_FAXINEIRO", especialidade: "Limpeza, reparo e organização", termos: ["limpar", "limpeza", "reparar", "reparo", "organizar", "organização", "organizacao", "faxina", "resíduo", "residuo", "manutenção", "manutencao"] },
    { id: "monitor-de-sintaxe", nome: "MONITOR_DE_SINTAXE", especialidade: "Correção, padronização e preservação de sentido", termos: ["sintaxe", "padronizar", "padronização", "padronizacao", "formatar", "lint", "validar código", "validar codigo"] },
    { id: "sousaileon", nome: "SOUSAILEON", especialidade: "Execução operacional precisa", termos: ["executar", "execução", "execucao", "acionar", "operar", "realizar", "movimento", "manusear"] }
  ],


  /**
   * ----------------------------------------------------------
   * ANALISA UMA SOLICITAÇÃO
   * ----------------------------------------------------------
   */
  analisar: function(comando, contexto) {

    contexto = contexto || {};

    if (!comando) {
      return {
        ok: false,
        status: "COMANDO_AUSENTE",
        mensagem: "Nenhum comando foi fornecido."
      };
    }

    const conhecimento = this.obterConhecimento();

    const competencia = this.identificarCompetencia(
      comando,
      conhecimento.agentes
    );

    const resultado = {
      ok: true,

      sistema: "SOUSA 2.0",

      camada: "SOUSA_IA",

      coordenador: this.coordenacao,

      versao: this.versao,

      comando: comando,

      contexto: contexto,

      conhecimento: conhecimento,

      competencia: competencia,

      proxima_acao: "DELEGAR",

      soberania: {
        alteracao_estrutural: false,
        autorizacao_fundador: "NECESSARIA"
      },

      data: new Date().toISOString()
    };

    this.registrarAprendizado(resultado);

    return resultado;
  },


  /**
   * ----------------------------------------------------------
   * OBTÉM CONHECIMENTO EXISTENTE
   * ----------------------------------------------------------
   */
  obterConhecimento: function() {

    let modulos = [];

    try {

      if (
        typeof SOUSA_REGISTRY !== "undefined" &&
        typeof SOUSA_REGISTRY.listar === "function"
      ) {

        const registro = SOUSA_REGISTRY.listar();

        modulos = registro.componentes || [];
      }

    } catch (erro) {

      modulos = [];
    }


    return {

      fonte: "SOUSA_IA",

      coordenador: this.coordenacao,

      agentes: this.agentesEspecializados.map(function(agente) {
        return {
          id: agente.id,
          nome: agente.nome,
          especialidade: agente.especialidade,
          termos: agente.termos,
          coordenado_por: "sousa-ia"
        };
      }),

      modulos: modulos,

      memoria: {

        disponivel:
          typeof SOUSA_USB_KNOWLEDGE_ENGINE !== "undefined",

        status:
          typeof SOUSA_USB_KNOWLEDGE_ENGINE !== "undefined"
            ? "DISPONIVEL"
            : "NAO_CONECTADA"
      },

      memoria_tecnica: {

        disponivel:
          typeof SOUSA_USB_MEMORY_SYNC !== "undefined",

        status:
          typeof SOUSA_USB_MEMORY_SYNC !== "undefined"
            ? "DISPONIVEL"
            : "NAO_CONECTADA"
      }

    };
  },


  /**
   * ----------------------------------------------------------
   * IDENTIFICA COMPETÊNCIA
   * ----------------------------------------------------------
   */
  identificarCompetencia: function(comando, agentes) {

    const texto = String(comando).toLowerCase();
    const catalogo = Array.isArray(agentes) && agentes.length
      ? agentes
      : this.agentesEspecializados;

    let melhor = null;
    let maiorPontuacao = 0;

    catalogo.forEach(function(agente) {

      let pontuacao = 0;

      (agente.termos || []).forEach(function(termo) {

        if (texto.indexOf(termo) !== -1) {
          pontuacao++;
        }

      });

      if (pontuacao > maiorPontuacao) {

        maiorPontuacao = pontuacao;
        melhor = agente;
      }

    });

    if (!melhor) {
      melhor = this.coordenacao;
    }

    return {

      modulo: melhor.id,

      agente: {
        id: melhor.id,
        nome: melhor.nome,
        especialidade: melhor.especialidade || melhor.funcao
      },

      coordenado_por: this.coordenacao.id,

      pontuacao: maiorPontuacao,

      confianca:
        maiorPontuacao >= 2
          ? "ALTA"
          : maiorPontuacao === 1
            ? "MEDIA"
            : "BAIXA",

      motivo:
        melhor.id === this.coordenacao.id
          ? "Nenhuma especialidade identificada; SOUSA IA assumirá a coordenação da análise."
          : "Agente especializado identificado e coordenado pela SOUSA IA.",

      registrado: true
    };
  },


  /**
   * ----------------------------------------------------------
   * DELEGA COMPETÊNCIA
   * ----------------------------------------------------------
   */
  delegar: function(analise) {

    if (!analise || !analise.competencia) {

      return {
        ok: false,
        status: "ANALISE_INVALIDA",
        mensagem: "Nenhuma competência disponível para delegação."
      };
    }


    return {

      ok: true,

      status: "DELEGACAO_PREPARADA",

      coordenador: this.coordenacao,

      modulo_destino:
        analise.competencia.modulo,

      agente_destino:
        analise.competencia.agente,

      fluxo:
        "SOUSA_IA -> " + analise.competencia.modulo,

      competencia:
        analise.competencia,

      soberania: {
        execucao_estrutural: false,
        autorizacao_fundador: "NECESSARIA"
      },

      mensagem:
        "Delegação preparada sob coordenação exclusiva da SOUSA IA."
    };
  },


  /**
   * ----------------------------------------------------------
   * REGISTRA APRENDIZADO
   * ----------------------------------------------------------
   */
  registrarAprendizado: function(evento) {

    try {

      if (
        typeof SOUSA_USB_KNOWLEDGE_SYNC !== "undefined" &&
        typeof SOUSA_USB_KNOWLEDGE_SYNC.sincronizar === "function"
      ) {

        return SOUSA_USB_KNOWLEDGE_SYNC.sincronizar({

          tipo: "SOUSA_IA_ANALISE",

          resumo:
            "Análise de comando realizada pela camada SOUSA IA."
        });

      }

    } catch (erro) {
      // Registro de aprendizado nunca deve derrubar a análise.
    }


    return {

      ok: true,

      status: "APRENDIZADO_LOCAL",

      evento: "SOUSA_IA_ANALISE"
    };
  },


  /**
   * ----------------------------------------------------------
   * SUGERE MELHORIA
   * ----------------------------------------------------------
   */
  sugerirMelhoria: function(analise) {

    return {

      ok: true,

      status: "SUGESTAO_GERADA",

      sugestao: {

        origem: "SOUSA_IA",

        tipo: "MELHORIA",

        alvo:
          analise && analise.competencia
            ? analise.competencia.modulo
            : "SISTEMA",

        acao:
          "Avaliar melhoria antes de qualquer alteração estrutural.",

        execucao_automatica: false,

        autorizacao_fundador: true
      }
    };
  },


  /**
   * ----------------------------------------------------------
   * STATUS
   * ----------------------------------------------------------
   */
  status: function() {

    return {

      sistema: "SOUSA 2.0",

      camada: "SOUSA_IA",

      versao: this.versao,

      status: "OPERACIONAL",

      funcao:
        "Inteligência, contexto, coordenação e aprendizado.",

      coordenacao_unica:
        "SOUSA IA",

      agentes_especializados:
        this.agentesEspecializados.length,

      soberania:
        "ATIVA",

      alteracao_estrutural_automatica:
        false
    };
  }

};
