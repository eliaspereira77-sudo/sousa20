/**
 * SOUSA IA — OBSERVADOR DE CAPACIDADES GAS
 *
 * Função:
 * - detectar capacidades disponíveis no GAS
 * - identificar plugins/adapters
 * - construir perfil operacional
 * - relacionar capacidade -> função -> origem -> estado
 * - registrar aprendizado estrutural
 *
 * PRINCÍPIO:
 * USB PLUG & PLAY LÓGICO
 *
 * V1:
 * SOMENTE LEITURA + REGISTRO CONTROLADO
 */

var SOUSA_IA_CAPACIDADES_GAS = {

  protocolo: 'SOUSA-IA-CAPABILITY-DISCOVERY',
  versao: '1.0.0',

  descobrir: function() {

    var capacidades = [];

    var nomes = [
      'SOUSA_API_EXECUTOR_UNIVERSAL',
      'SOUSA_API_EXECUTOR_COM_CASCATA',
      'SOUSA_API_EXECUTOR_normalizarContexto',
      'SOUSA_API_USB_preparar',
      'SOUSA_USB_normalizarContexto',
      'SOUSA_POLITICA_cooldown',

      'SOUSA_IA_GAS_diagnostico',

      'SOUSA_CAPABILITY_REGISTRY',
      'SOUSA_CAPABILITY_ADAPTER',

      'SOUSA_IA_MEMORIA',
      'SOUSA_IA_DNA',
      'SOUSA_IA_MEMORIA_VOZ',

      'SOUSA_MAINTENANCE_ORCHESTRATOR',
      'SOUSA_AUTO_REPAIR_ENGINE',
      'SOUSA_SELF_TEST_REPAIR',

      'SOUSA_MOBILE_GATEWAY',
      'SOUSA_COMMAND_ROUTER',
      'SOUSA_COMMAND_LISTENER'
    ];

    for (var i = 0; i < nomes.length; i++) {

      var nome = nomes[i];

      var funcao = this.obterGlobal(nome);

      if (funcao) {

        capacidades.push(
          this.criarPerfil(
            nome,
            funcao
          )
        );

      }

    }

    return capacidades;
  },


  obterGlobal: function(nome) {

    try {

      if (
        typeof globalThis !== 'undefined' &&
        typeof globalThis[nome] === 'function'
      ) {

        return globalThis[nome];

      }

    } catch (erro) {}

    try {

      if (
        typeof this.obterPorNome === 'function'
      ) {

        return this.obterPorNome(nome);

      }

    } catch (erro) {}

    return null;
  },


  obterPorNome: function(nome) {

    try {

      return eval(
        'typeof ' +
        nome +
        ' === "function" ? ' +
        nome +
        ' : null'
      );

    } catch (erro) {

      return null;

    }

  },


  criarPerfil: function(nome, funcao) {

    var categoria =
      this.inferirCategoria(nome);

    var papel =
      this.inferirPapel(nome);

    return {

      id:
        'CAP-' +
        nome,

      nome: nome,

      tipo: 'CAPACIDADE',

      estado: 'CONECTADA',

      transporte: 'GAS',

      protocolo: 'PLUG_AND_PLAY',

      categoria: categoria,

      papel: papel,

      assinatura: this.assinatura(funcao),

      descobertaAutomatica: true,

      aprendizado: {

        conhecido: true,

        origem:
          'OBSERVACAO_RUNTIME',

        necessitaExplicacaoHumana:
          false
      }

    };

  },


  inferirCategoria: function(nome) {

    var n =
      String(nome).toUpperCase();

    if (
      n.indexOf('IA') >= 0
    ) {
      return 'INTELIGENCIA';
    }

    if (
      n.indexOf('USB') >= 0
    ) {
      return 'TRANSPORTE';
    }

    if (
      n.indexOf('EXECUTOR') >= 0
    ) {
      return 'EXECUCAO';
    }

    if (
      n.indexOf('POLITICA') >= 0 ||
      n.indexOf('AUTH') >= 0
    ) {
      return 'SEGURANCA';
    }

    if (
      n.indexOf('MEMORIA') >= 0 ||
      n.indexOf('DNA') >= 0
    ) {
      return 'MEMORIA';
    }

    if (
      n.indexOf('REPAIR') >= 0 ||
      n.indexOf('MAINTENANCE') >= 0 ||
      n.indexOf('SELF_TEST') >= 0
    ) {
      return 'MANUTENCAO';
    }

    if (
      n.indexOf('COMMAND') >= 0 ||
      n.indexOf('MOBILE') >= 0
    ) {
      return 'INTERFACE';
    }

    return 'CAPACIDADE_GERAL';

  },


  inferirPapel: function(nome) {

    var n =
      String(nome).toUpperCase();

    if (
      n.indexOf('EXECUTOR') >= 0
    ) {
      return 'EXECUTAR_OPERACOES';
    }

    if (
      n.indexOf('REGISTRY') >= 0
    ) {
      return 'REGISTRAR_CAPACIDADES';
    }

    if (
      n.indexOf('ADAPTER') >= 0
    ) {
      return 'ADAPTAR_CAPACIDADE';
    }

    if (
      n.indexOf('MEMORIA') >= 0 ||
      n.indexOf('DNA') >= 0
    ) {
      return 'PERSISTIR_E_RECUPERAR_CONTEXTO';
    }

    if (
      n.indexOf('REPAIR') >= 0
    ) {
      return 'RECUPERAR_FALHAS';
    }

    if (
      n.indexOf('MAINTENANCE') >= 0
    ) {
      return 'MANTER_SISTEMA';
    }

    if (
      n.indexOf('POLITICA') >= 0
    ) {
      return 'APLICAR_POLITICA';
    }

    if (
      n.indexOf('USB') >= 0
    ) {
      return 'TRANSPORTAR_CAPACIDADE';
    }

    return 'CAPACIDADE_DETECTADA';

  },


  assinatura: function(funcao) {

    try {

      return {

        tipo:
          typeof funcao,

        comprimento:
          funcao.length,

        nome:
          funcao.name || null

      };

    } catch (erro) {

      return {

        tipo: 'function',

        comprimento: null,

        nome: null

      };

    }

  },


  construirMapa: function() {

    var capacidades =
      this.descobrir();

    var mapa = {

      sistema: 'SOUSA 2.0',

      componente: 'SOUSA IA',

      ambiente:
        'GOOGLE_APPS_SCRIPT',

      consciencia: {

        espacial: true,

        visao360: true,

        dimensoes3D: {

          largura:
            'capacidades',

          altura:
            'camadas',

          profundidade:
            'dependencias_fluxos_relacoes'

        }

      },

      plugAndPlay: {

        ativo: true,

        protocolo:
          'USB_LOGICO',

        descobertaAutomatica:
          true

      },

      capacidades: capacidades,

      total:
        capacidades.length,

      timestamp:
        new Date().toISOString()

    };

    return mapa;

  },


  diagnostico: function() {

    var mapa =
      this.construirMapa();

    Logger.log(
      JSON.stringify(
        mapa,
        null,
        2
      )
    );

    return mapa;

  }

};


/**
 * Função pública GAS
 */
function SOUSA_IA_DESCUBRIR_CAPACIDADES() {

  return SOUSA_IA_CAPACIDADES_GAS.diagnostico();

}
