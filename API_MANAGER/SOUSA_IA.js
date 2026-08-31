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

  versao: "1.0.0",

  identidade: {
    sistema: "SOUSA 2.0",
    nome: "SOUSA IA",
    funcao: "Camada de inteligência, contexto, coordenação e aprendizado.",
    principio: "Coordenar competências sem substituir seus módulos."
  },


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
      conhecimento.modulos
    );

    const resultado = {
      ok: true,

      sistema: "SOUSA 2.0",

      camada: "SOUSA_IA",

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

      fonte: "SOUSA_REGISTRY",

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
  identificarCompetencia: function(comando, modulos) {

    const texto = String(comando).toLowerCase();


    const regras = [

      {
        modulo: "ads",
        termos: [
          "código",
          "codigo",
          "programação",
          "programacao",
          "software",
          "sistema",
          "script",
          "api",
          "arquitetura",
          "bug",
          "erro",
          "programar",
          "desenvolver",
          "desenvolvimento",
          "hardware",
          "computador",
          "engenharia"
        ]
      },

      {
        modulo: "juridico",
        termos: [
          "lei",
          "legal",
          "jurídico",
          "juridico",
          "contrato",
          "servidor",
          "direito",
          "processo"
        ]
      },

      {
        modulo: "financeiro",
        termos: [
          "dinheiro",
          "finanças",
          "financas",
          "investimento",
          "renda",
          "dívida",
          "divida",
          "custo",
          "orçamento",
          "orcamento"
        ]
      },

      {
        modulo: "produtor",
        termos: [
          "conteúdo",
          "conteudo",
          "roteiro",
          "vídeo",
          "video",
          "post",
          "legenda",
          "youtube",
          "instagram",
          "facebook",
          "tiktok",
          "kwai"
        ]
      },

      {
        modulo: "afiliadopro",
        termos: [
          "afiliado",
          "afiliados",
          "mercado livre",
          "shopee",
          "amazon",
          "comissão",
          "comissao",
          "produto",
          "venda"
        ]
      },

      {
        modulo: "estrategista",
        termos: [
          "estratégia",
          "estrategia",
          "planejamento",
          "prioridade",
          "decisão",
          "decisao",
          "plano"
        ]
      },

      {
        modulo: "saber",
        termos: [
          "o que é",
          "o que e",
          "como funciona",
          "história",
          "historia",
          "ciência",
          "ciencia",
          "curiosidade",
          "conhecimento"
        ]
      },

      {
        modulo: "mentor",
        termos: [
          "propósito",
          "proposito",
          "legado",
          "vida",
          "família",
          "familia",
          "futuro",
          "motivação",
          "motivacao"
        ]
      }

    ];


    let melhor = null;
    let maiorPontuacao = 0;


    regras.forEach(function(regra) {

      let pontuacao = 0;

      regra.termos.forEach(function(termo) {

        if (texto.indexOf(termo) !== -1) {
          pontuacao++;
        }

      });


      if (pontuacao > maiorPontuacao) {

        maiorPontuacao = pontuacao;

        melhor = regra.modulo;
      }

    });


    if (!melhor) {

      melhor = "conselho";
    }


    return {

      modulo: melhor,

      pontuacao: maiorPontuacao,

      confianca:
        maiorPontuacao >= 2
          ? "ALTA"
          : maiorPontuacao === 1
            ? "MEDIA"
            : "BAIXA",

      motivo:
        melhor === "conselho"
          ? "Nenhuma competência específica identificada; Conselho recomendado."
          : "Competência identificada por correspondência semântica inicial.",

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

      modulo_destino:
        analise.competencia.modulo,

      competencia:
        analise.competencia,

      soberania: {
        execucao_estrutural: false,
        autorizacao_fundador: "NECESSARIA"
      },

      mensagem:
        "Competência identificada e pronta para delegação."
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

      soberania:
        "ATIVA",

      alteracao_estrutural_automatica:
        false
    };
  }

};
