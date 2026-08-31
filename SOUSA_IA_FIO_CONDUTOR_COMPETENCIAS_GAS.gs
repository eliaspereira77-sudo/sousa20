/**
 * SOUSA IA — FIO CONDUTOR CENTRAL DE COMPETÊNCIAS
 *
 * PROTOCOLO:
 * SOUSA-IA-COMPETENCY-CONDUCTOR
 *
 * PRINCÍPIO:
 * CONHECER TUDO
 * CONVERSAR COM TODOS
 * APRENDER COM TODOS
 * ORQUESTRAR TODOS
 * INVADIR NINGUÉM
 *
 * FUNÇÃO:
 * - manter o fio condutor das competências
 * - identificar o módulo especialista
 * - encaminhar demandas sem duplicação
 * - permitir aprendizado transversal
 * - preservar fronteiras de competência
 * - integrar RADAR, AFILIADOS PRO, ESTRATEGISTA,
 *   PRODUTOR e demais módulos
 *
 * NÃO:
 * - substitui módulos especialistas
 * - executa competência alheia
 * - altera Registry
 * - acessa chaves
 * - executa APIs externas
 * - altera código-fonte
 *
 * V1 — SOMENTE ORQUESTRAÇÃO ESTRUTURAL
 */

var SOUSA_IA_FIO_CONDUTOR_COMPETENCIAS_GAS = {

  protocolo:
    'SOUSA-IA-COMPETENCY-CONDUCTOR',

  versao:
    '1.0.0',

  politica:
    'CONHECER_SEM_INVADIR',

  /**
   * REGISTRO BASE DAS COMPETÊNCIAS
   *
   * O registro mestre continua sendo
   * a fonte de autoridade.
   */
  obterRegistro: function() {

    if (
      typeof SOUSA_IA_REGISTRO_MESTRE_COMPETENCIAS_GAS ===
      'undefined'
    ) {
      return {
        disponivel: false,
        competencias: []
      };
    }

    try {

      if (
        typeof SOUSA_IA_REGISTRO_MESTRE_COMPETENCIAS_GAS
          .construir === 'function'
      ) {

        var registro =
          SOUSA_IA_REGISTRO_MESTRE_COMPETENCIAS_GAS
            .construir();

        return {
          disponivel: true,
          registro: registro,
          competencias:
            registro &&
            Array.isArray(registro.competencias)
              ? registro.competencias
              : []
        };
      }

    } catch (erro) {

      return {
        disponivel: false,
        competencias: [],
        erro: String(
          erro.message || erro
        )
      };
    }

    return {
      disponivel: false,
      competencias: []
    };
  },


  normalizar: function(valor) {

    return String(valor || '')
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '');
  },


  /**
   * DEFINE O PAPEL DA SOUSA IA
   */
  papelCentral: function() {

    return {

      conhecer:
        true,

      consultar:
        true,

      correlacionar:
        true,

      aprender:
        true,

      encaminhar:
        true,

      orquestrar:
        true,

      substituirEspecialista:
        false,

      executarCompetenciaAlheia:
        false,

      alterarCompetencia:
        false
    };
  },


  /**
   * CLASSIFICA UMA DEMANDA
   *
   * Não executa a demanda.
   * Apenas identifica o possível especialista.
   */
  classificar: function(demanda) {

    var texto =
      this.normalizar(
        demanda &&
        (
          demanda.texto ||
          demanda.assunto ||
          demanda.competencia ||
          ''
        )
      );

    var registro =
      this.obterRegistro();

    var competencias =
      registro.competencias || [];

    var candidatos = [];

    for (
      var i = 0;
      i < competencias.length;
      i++
    ) {

      var competencia =
        competencias[i];

      var nome =
        this.normalizar(
          competencia.nome ||
          competencia.id ||
          ''
        );

      var categoria =
        this.normalizar(
          competencia.categoria ||
          ''
        );

      var papel =
        this.normalizar(
          competencia.papel ||
          ''
        );

      var correspondencias = 0;

      if (
        nome &&
        texto.indexOf(nome) >= 0
      ) {
        correspondencias++;
      }

      if (
        categoria &&
        texto.indexOf(categoria) >= 0
      ) {
        correspondencias++;
      }

      if (
        papel &&
        texto.indexOf(papel) >= 0
      ) {
        correspondencias++;
      }

      if (correspondencias > 0) {

        candidatos.push({

          id:
            competencia.id ||
            competencia.nome,

          nome:
            competencia.nome,

          categoria:
            competencia.categoria,

          papel:
            competencia.papel,

          correspondencias:
            correspondencias,

          autoridade:
            'MODULO_ESPECIALISTA',

          executar:
            false,

          motivo:
            'COMPETENCIA_IDENTIFICADA'
        });
      }
    }

    candidatos.sort(
      function(a, b) {
        return (
          b.correspondencias -
          a.correspondencias
        );
      }
    );

    return {

      demanda:
        demanda || null,

      candidatos:
        candidatos,

      especialistaPrincipal:
        candidatos.length
          ? candidatos[0]
          : null,

      encaminhar:
        candidatos.length > 0,

      executarPelaSOUSAIA:
        false,

      soberania:
        'HUMANA'
    };
  },


  /**
   * APRENDIZADO TRANSVERSAL
   *
   * A SOUSA IA pode aprender com o resultado
   * de qualquer módulo, mas o conhecimento
   * continua associado à origem.
   */
  registrarAprendizado: function(
    origem,
    aprendizado
  ) {

    return {

      registrado:
        true,

      origem:
        origem || 'NAO_IDENTIFICADA',

      aprendizado:
        aprendizado || null,

      principio:
        'APRENDER_SEM_ASSUMIR',

      competenciaOriginal:
        origem || 'NAO_IDENTIFICADA',

      reutilizacao:
        'CONHECIMENTO_TRANSVERSAL',

      execucaoPelaSOUSAIA:
        false,

      timestamp:
        new Date().toISOString()
    };
  },


  /**
   * MAPA DE RELACIONAMENTO ESTRATÉGICO
   *
   * RADAR possui duas frentes:
   * 1. oportunidades de receita
   * 2. estratégias
   *
   * Estratégias podem alimentar o aprendizado
   * do AFILIADOS PRO, ESTRATEGISTA e PRODUTOR.
   */
  mapaRadar: function() {

    return {

      radar: {

        ativo:
          true,

        frentes: {

          oportunidadesReceita:
            true,

          estrategias:
            true
        }
      },

      fluxo:

        [
          'RADAR',
          'SOUSA_IA',
          'AFILIADOS_PRO',
          'ESTRATEGISTA',
          'PRODUTOR'
        ],

      principio:
        'COMPARTILHAR_CONHECIMENTO_SEM_DUPLICAR_COMPETENCIA',

      execucaoAutomatica:
        false,

      soberania:
        'HUMANA'
    };
  },


  /**
   * PROTOCOLO DE NÃO INVASÃO
   */
  validarFronteira: function(
    origem,
    destino,
    acao
  ) {

    var mesmaCompetencia =
      this.normalizar(origem) ===
      this.normalizar(destino);

    var proibida =
      [
        'SUBSTITUIR',
        'ASSUMIR',
        'ALTERAR_COMPETENCIA',
        'EXECUTAR_COMPETENCIA_ALHEIA'
      ].indexOf(
        this.normalizar(acao)
      ) >= 0;

    return {

      permitido:
        !proibida,

      mesmaCompetencia:
        mesmaCompetencia,

      acao:
        acao || null,

      regra:
        proibida
          ? 'BLOQUEAR'
          : 'PERMITIR_ORQUESTRACAO',

      motivo:
        proibida
          ? 'VIOLACAO_DE_FRONTEIRA'
          : 'ORQUESTRACAO_COMPATIVEL'
    };
  },


  /**
   * CONSTRÓI O FIO CONDUTOR COMPLETO
   */
  construir: function() {

    var registro =
      this.obterRegistro();

    return {

      sistema:
        'SOUSA 2.0',

      componente:
        'SOUSA IA',

      protocolo:
        this.protocolo,

      versao:
        this.versao,

      papel:
        this.papelCentral(),

      registroMestre:
        registro,

      radar:
        this.mapaRadar(),

      principioCentral:
        'CONHECER_TUDO_SEM_INVADIR_COMPETENCIAS',

      arquitetura:

        [
          'SOUSA_IA',
          'RADAR',
          'AFILIADOS_PRO',
          'ESTRATEGISTA',
          'PRODUTOR',
          'DEMAIS_MODULOS'
        ],

      fluxo:

        [
          'OBSERVAR',
          'IDENTIFICAR',
          'CONSULTAR',
          'CORRELACIONAR',
          'APRENDER',
          'ENCAMINHAR',
          'ORQUESTRAR',
          'AGUARDAR_EXECUCAO_DO_ESPECIALISTA'
        ],

      protecoes: {

        duplicacao:
          false,

        invasaoCompetencia:
          false,

        substituicaoEspecialista:
          false,

        execucaoAutonoma:
          false,

        alteracaoCodigo:
          false,

        alteracaoRegistry:
          false,

        acessoChaves:
          false
      },

      soberania:
        'HUMANA',

      somenteLeitura:
        true,

      timestamp:
        new Date().toISOString()
    };
  },


  diagnostico: function() {

    var resultado =
      this.construir();

    Logger.log(
      JSON.stringify(
        resultado,
        null,
        2
      )
    );

    return resultado;
  }
};


/**
 * FUNÇÃO PÚBLICA GAS
 */
function SOUSA_IA_CONSTRUIR_FIO_CONDUTOR_COMPETENCIAS() {

  return SOUSA_IA_FIO_CONDUTOR_COMPETENCIAS_GAS
    .diagnostico();
}
