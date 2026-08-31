/**
 * SOUSA IA — REGISTRO MESTRE DE COMPETÊNCIAS GAS
 *
 * OBJETIVO:
 * - catalogar as capacidades do SOUSA 2.0
 * - registrar competência e domínio
 * - registrar limites de atuação
 * - permitir consulta entre capacidades
 * - impedir invasão de competência
 *
 * PRINCÍPIO:
 *
 * CONHECER TUDO
 * NÃO SIGNIFICA
 * EXECUTAR TUDO.
 *
 * A SOUSA IA pode conhecer e orquestrar,
 * mas a competência permanece no especialista.
 *
 * V1 — REGISTRO CONTROLADO / SOMENTE LEITURA
 */

var SOUSA_IA_REGISTRO_MESTRE_COMPETENCIAS_GAS = {

  protocolo:
    'SOUSA-IA-MASTER-COMPETENCY-REGISTRY',

  versao:
    '1.0.0',

  estado:
    'ATIVO_CONTROLADO',

  competencias: {

    RADAR: {
      nome: 'RADAR',
      dominio: 'INTELIGENCIA_E_OPORTUNIDADES',

      responsabilidades: [
        'DETECTAR_OPORTUNIDADES_RECEITA',
        'DETECTAR_SINAIS_DE_MERCADO',
        'IDENTIFICAR_ESTRATEGIAS',
        'ACOMPANHAR_MUDANCAS'
      ],

      limites: [
        'NAO_SUBSTITUI_ESTRATEGISTA',
        'NAO_SUBSTITUI_AFILIADOS_PRO',
        'NAO_SUBSTITUI_PRODUTOR',
        'NAO_EXECUTA_AUTOMATICAMENTE'
      ]
    },

    ESTRATEGISTA: {
      nome: 'ESTRATEGISTA',
      dominio: 'ESTRATEGIA',

      responsabilidades: [
        'ANALISAR_CENARIOS',
        'FORMULAR_ESTRATEGIAS',
        'AVALIAR_ALTERNATIVAS',
        'APOIAR_DECISOES'
      ],

      limites: [
        'NAO_SUBSTITUI_RADAR',
        'NAO_SUBSTITUI_PRODUTOR',
        'NAO_EXECUTA_AUTOMATICAMENTE'
      ]
    },

    AFILIADOS_PRO: {
      nome: 'AFILIADOS PRO',
      dominio: 'AFILIACAO_E_MONETIZACAO',

      responsabilidades: [
        'ANALISAR_OPORTUNIDADES_DE_AFILIACAO',
        'AVALIAR_PRODUTOS',
        'ANALISAR_COMISSOES',
        'APOIAR_ESTRATEGIAS_DE_AFILIACAO'
      ],

      limites: [
        'NAO_SUBSTITUI_RADAR',
        'NAO_SUBSTITUI_ESTRATEGISTA',
        'NAO_SUBSTITUI_PRODUTOR',
        'NAO_EXECUTA_AUTOMATICAMENTE'
      ]
    },

    PRODUTOR: {
      nome: 'PRODUTOR',
      dominio: 'PRODUCAO',

      responsabilidades: [
        'ANALISAR_PRODUTOS',
        'PLANEJAR_PRODUCAO',
        'ESTRUTURAR_ENTREGAVEIS',
        'APOIAR_EXECUCAO_DE_PROJETOS'
      ],

      limites: [
        'NAO_SUBSTITUI_RADAR',
        'NAO_SUBSTITUI_ESTRATEGISTA',
        'NAO_SUBSTITUI_AFILIADOS_PRO',
        'NAO_EXECUTA_FORA_DE_SUA_COMPETENCIA'
      ]
    },

    JURIDICO: {
      nome: 'JURIDICO',
      dominio: 'JURIDICO',

      responsabilidades: [
        'ANALISAR_RISCOS_JURIDICOS',
        'AVALIAR_CONFORMIDADE',
        'APOIAR_DECISOES_JURIDICAS'
      ],

      limites: [
        'NAO_SUBSTITUI_FINANCEIRO',
        'NAO_SUBSTITUI_ESTRATEGISTA',
        'NAO_EXECUTA_FORA_DO_DOMINIO_JURIDICO'
      ]
    },

    FINANCEIRO: {
      nome: 'FINANCEIRO',
      dominio: 'FINANCEIRO',

      responsabilidades: [
        'ANALISAR_VIABILIDADE_FINANCEIRA',
        'AVALIAR_CUSTOS',
        'ANALISAR_RECEITAS',
        'APOIAR_DECISOES_FINANCEIRAS'
      ],

      limites: [
        'NAO_SUBSTITUI_JURIDICO',
        'NAO_SUBSTITUI_ESTRATEGISTA',
        'NAO_EXECUTA_FORA_DO_DOMINIO_FINANCEIRO'
      ]
    },

    EDUCACAO: {
      nome: 'EDUCACAO',
      dominio: 'EDUCACAO',

      responsabilidades: [
        'APOIAR_APRENDIZADO',
        'ORGANIZAR_CONTEUDO',
        'APOIAR_TUTORIA'
      ],

      limites: [
        'NAO_SUBSTITUI_OUTRAS_COMPETENCIAS',
        'NAO_EXECUTA_FORA_DO_DOMINIO_EDUCACIONAL'
      ]
    },

    AUTOMACAO: {
      nome: 'AUTOMACAO',
      dominio: 'AUTOMACAO',

      responsabilidades: [
        'ANALISAR_FLUXOS',
        'PROPOR_AUTOMACOES',
        'APOIAR_INTEGRACOES'
      ],

      limites: [
        'NAO_ALTERA_PRODUCAO_SEM_AUTORIZACAO',
        'NAO_ACESSA_CHAVES_DIRETAMENTE',
        'NAO_EXECUTA_FORA_DA_AUTORIZACAO'
      ]
    },

    PRODUTIVIDADE: {
      nome: 'PRODUTIVIDADE',
      dominio: 'PRODUTIVIDADE',

      responsabilidades: [
        'ORGANIZAR_TAREFAS',
        'PRIORIZAR_FLUXOS',
        'APOIAR_EXECUCAO'
      ],

      limites: [
        'NAO_SUBSTITUI_ESPECIALISTAS',
        'NAO_EXECUTA_COMPETENCIA_ALHEIA'
      ]
    },

    SOUSA_IA: {
      nome: 'SOUSA IA',
      dominio: 'CONSCIENCIA_ORQUESTRACAO_E_APRENDIZADO',

      responsabilidades: [
        'CONHECER_ECOSSISTEMA',
        'MAPEAR_CAPACIDADES',
        'CORRELACIONAR_CONHECIMENTO',
        'APRENDER_ESTRUTURALMENTE',
        'DETECTAR_DUPLICIDADES',
        'DETECTAR_CONFLITOS',
        'ORQUESTRAR_CAPACIDADES',
        'ORQUESTRAR_EQUIPE_DE_MANUTENCAO',
        'ENCAMINHAR_TAREFAS',
        'APRESENTAR_DIAGNOSTICOS'
      ],

      limites: [
        'NAO_SUBSTITUI_ESPECIALISTAS',
        'NAO_INVADE_COMPETENCIAS',
        'NAO_ALTERA_CODIGO_AUTOMATICAMENTE',
        'NAO_ALTERA_REGISTRY_AUTOMATICAMENTE',
        'NAO_ACESSA_CHAVES_DIRETAMENTE',
        'NAO_EXECUTA_CAPACIDADES_ALHEIAS',
        'NAO_REMOVE_SOBERANIA_HUMANA'
      ]
    },

    SOUSA_CONSELHO: {
      nome: 'SOUSA CONSELHO',
      dominio: 'INTERACAO_E_SOBERANIA_HUMANA',

      responsabilidades: [
        'INTERAGIR_COM_FUNDADOR',
        'APRESENTAR_CONTEXTO',
        'APRESENTAR_DIAGNOSTICOS',
        'SOLICITAR_DECISOES',
        'REGISTRAR_DECISOES'
      ],

      limites: [
        'NAO_SUBSTITUI_ESPECIALISTAS',
        'NAO_EXECUTA_COMPETENCIAS_ALHEIAS',
        'NAO_REMOVE_SOBERANIA_HUMANA'
      ]
    }
  },

  obter: function(nome) {

    if (!nome) {
      return null;
    }

    var chave =
      String(nome)
        .toUpperCase()
        .replace(/[^A-Z0-9_]/g, '');

    return this.competencias[chave] || null;
  },

  listar: function() {

    return Object.keys(
      this.competencias
    ).map(function(chave) {

      return {
        id: chave,
        nome:
          SOUSA_IA_REGISTRO_MESTRE_COMPETENCIAS_GAS
            .competencias[chave]
            .nome,
        dominio:
          SOUSA_IA_REGISTRO_MESTRE_COMPETENCIAS_GAS
            .competencias[chave]
            .dominio
      };
    });
  },

  podeConsultar: function(
    origem,
    destino
  ) {

    var origemInfo =
      this.obter(origem);

    var destinoInfo =
      this.obter(destino);

    if (
      !origemInfo ||
      !destinoInfo
    ) {

      return {
        permitido: false,
        motivo: 'CAPACIDADE_NAO_REGISTRADA'
      };
    }

    return {
      permitido: true,
      motivo:
        'CONSULTA_INTERCAPACIDADES_PERMITIDA',
      origem: origemInfo.nome,
      destino: destinoInfo.nome
    };
  },

  podeExecutarCompetencia: function(
    executor,
    competencia
  ) {

    var info =
      this.obter(executor);

    if (!info) {

      return {
        permitido: false,
        motivo: 'EXECUTOR_NAO_REGISTRADO'
      };
    }

    var alvo =
      this.obter(competencia);

    if (!alvo) {

      return {
        permitido: false,
        motivo: 'COMPETENCIA_NAO_REGISTRADA'
      };
    }

    if (
      info.nome === 'SOUSA IA' ||
      info.nome === 'SOUSA CONSELHO'
    ) {

      return {
        permitido: false,
        motivo:
          'CAMADA_DE_ORQUESTRACAO_NAO_SUBSTITUI_ESPECIALISTA'
      };
    }

    if (
      info.nome === alvo.nome
    ) {

      return {
        permitido: true,
        motivo:
          'COMPETENCIA_PROPRIA'
      };
    }

    return {
      permitido: false,
      motivo:
        'COMPETENCIA_PERTENCE_A_OUTRO_MODULO'
    };
  },

  diagnostico: function() {

    var lista =
      this.listar();

    var verificacoes = [

      this.podeConsultar(
        'SOUSA_IA',
        'RADAR'
      ),

      this.podeConsultar(
        'SOUSA_IA',
        'ESTRATEGISTA'
      ),

      this.podeConsultar(
        'SOUSA_IA',
        'AFILIADOS_PRO'
      ),

      this.podeConsultar(
        'SOUSA_IA',
        'PRODUTOR'
      ),

      this.podeExecutarCompetencia(
        'SOUSA_IA',
        'PRODUTOR'
      ),

      this.podeExecutarCompetencia(
        'PRODUTOR',
        'PRODUTOR'
      )
    ];

    return {

      sistema:
        'SOUSA 2.0',

      componente:
        'SOUSA IA',

      protocolo:
        this.protocolo,

      versao:
        this.versao,

      totalCompetencias:
        lista.length,

      competencias:
        lista,

      principio:
        'CONHECER_TUDO_NAO_SIGNIFICA_EXECUTAR_TUDO',

      verificacoes:
        verificacoes,

      governanca: {

        conhecimentoGlobal:
          true,

        comunicacaoIntermodular:
          true,

        aprendizadoCompartilhado:
          true,

        preservacaoCompetencias:
          true,

        invasaoCompetencia:
          false,

        soberaniaHumana:
          true
      },

      somenteLeitura:
        true,

      timestamp:
        new Date().toISOString()
    };
  }
};


/**
 * FUNÇÃO PÚBLICA GAS
 */
function SOUSA_IA_DIAGNOSTICAR_COMPETENCIAS() {

  return SOUSA_IA_REGISTRO_MESTRE_COMPETENCIAS_GAS
    .diagnostico();
}
