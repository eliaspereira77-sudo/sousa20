/**
 * SOUSA IA — APRENDIZADO ESTRATÉGICO RADAR GAS
 *
 * Integra:
 *
 * RADAR
 *   └── ESTRATÉGIAS
 *
 * COM:
 *   ├── AFILIADOS PRO
 *   ├── ESTRATEGISTA
 *   └── PRODUTOR
 *
 * Objetivo:
 * - observar estratégias
 * - cruzar capacidades
 * - identificar compatibilidades
 * - identificar relações
 * - identificar novidades
 * - preparar conhecimento para a memória
 *
 * V1 — SOMENTE LEITURA
 *
 * NÃO:
 * - executa estratégia
 * - executa venda
 * - publica conteúdo
 * - altera módulos
 * - altera Registry
 * - acessa chaves
 * - executa APIs externas
 */

var SOUSA_IA_APRENDIZADO_ESTRATEGICO_RADAR_GAS = {

  protocolo:
    'SOUSA-IA-STRATEGIC-LEARNING-RADAR',

  versao:
    '1.0.0',

  modulosAlvo: [
    'AFILIADOS_PRO',
    'ESTRATEGISTA',
    'PRODUTOR'
  ],

  normalizar: function(valor) {

    return String(valor || '')
      .toUpperCase()
      .replace(/\s+/g, '_')
      .replace(/[^A-Z0-9_]/g, '');

  },

  detectarModulo: function(nome) {

    var chave =
      this.normalizar(nome);

    var encontrados = [];

    /*
     * A V1 procura evidências estruturais
     * nos objetos já carregados pelo ecossistema.
     */

    if (
      chave.indexOf('AFILI') >= 0
    ) {
      encontrados.push(
        'AFILIADOS_PRO'
      );
    }

    if (
      chave.indexOf('ESTRATEG') >= 0
    ) {
      encontrados.push(
        'ESTRATEGISTA'
      );
    }

    if (
      chave.indexOf('PRODUTOR') >= 0 ||
      chave.indexOf('PRODUCAO') >= 0
    ) {
      encontrados.push(
        'PRODUTOR'
      );
    }

    return encontrados;

  },

  obterCapacidades: function() {

    if (
      typeof SOUSA_IA_CAPACIDADES_GAS ===
      'undefined'
    ) {
      return [];
    }

    try {

      var mapa =
        SOUSA_IA_CAPACIDADES_GAS
          .construirMapa();

      if (
        mapa &&
        Array.isArray(mapa.capacidades)
      ) {

        return mapa.capacidades;

      }

    } catch (erro) {

      return [];

    }

    return [];

  },

  identificarRelacionamentos:
    function(capacidades) {

      var resultado = [];

      for (
        var i = 0;
        i < capacidades.length;
        i++
      ) {

        var capacidade =
          capacidades[i];

        if (!capacidade) {
          continue;
        }

        var nome =
          this.normalizar(
            capacidade.nome
          );

        var relacionados =
          this.detectarModulo(nome);

        if (!relacionados.length) {
          continue;
        }

        for (
          var j = 0;
          j < relacionados.length;
          j++
        ) {

          resultado.push({

            capacidade:
              capacidade.id ||
              capacidade.nome,

            modulo:
              relacionados[j],

            tipo:
              'COMPATIBILIDADE_ESTRUTURAL',

            origem:
              'OBSERVACAO_RADAR_SOUSA_IA',

            execucao:
              false

          });

        }

      }

      return resultado;

    },

  construir: function() {

    var capacidades =
      this.obterCapacidades();

    var relacionamentos =
      this.identificarRelacionamentos(
        capacidades
      );

    var radarDisponivel =
      typeof SOUSA_IA_PONTE_RADAR_360_GAS !==
      'undefined';

    return {

      sistema:
        'SOUSA 2.0',

      componente:
        'SOUSA IA',

      protocolo:
        this.protocolo,

      versao:
        this.versao,

      origem: {

        radar:
          radarDisponivel,

        frente:
          'ESTRATEGIAS'

      },

      destinos: {

        afiliadosPro:
          true,

        estrategista:
          true,

        produtor:
          true

      },

      capacidadesAnalisadas:
        capacidades.length,

      relacionamentos:
        relacionamentos,

      aprendizado: {

        automatico:
          true,

        estrutural:
          true,

        estrategiaAprendida:
          true,

        execucao:
          false,

        persistencia:
          false

      },

      fluxo:
        'RADAR_ESTRATEGIAS -> AFILIADOS_PRO + ESTRATEGISTA + PRODUTOR -> CORRELACAO -> APRENDIZADO',

      seguranca: {

        somenteLeitura:
          true,

        APIsExternas:
          false,

        acessoChaves:
          false,

        alteracaoCodigo:
          false,

        alteracaoRegistry:
          false

      },

      soberania:
        'HUMANA',

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
function SOUSA_IA_APRENDER_ESTRATEGIAS_RADAR() {

  return SOUSA_IA_APRENDIZADO_ESTRATEGICO_RADAR_GAS
    .diagnostico();

}
