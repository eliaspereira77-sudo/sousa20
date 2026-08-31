/**
 * SOUSA IA — GRAFO DE RELAÇÕES 360°
 *
 * Visão:
 *   NÓ     = capacidade
 *   ARESTA = relação entre capacidades
 *
 * 3D:
 *   LARGURA      = componentes
 *   ALTURA       = camadas
 *   PROFUNDIDADE = relações / fluxos / dependências
 *
 * V1 — SOMENTE LEITURA
 */

var SOUSA_IA_GRAFO_RELACOES = {

  protocolo: 'SOUSA-IA-RELATION-GRAPH',
  versao: '1.0.0',

  normalizar: function(valor) {

    return String(valor || '')
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '');

  },


  relacionar: function(a, b) {

    if (!a || !b) {
      return null;
    }

    if (a.nome === b.nome) {
      return null;
    }

    var nomeA =
      this.normalizar(a.nome);

    var nomeB =
      this.normalizar(b.nome);

    var categoriaA =
      this.normalizar(a.categoria);

    var categoriaB =
      this.normalizar(b.categoria);

    var papelA =
      this.normalizar(a.papel);

    var papelB =
      this.normalizar(b.papel);

    var motivos = [];

    if (
      categoriaA &&
      categoriaA === categoriaB
    ) {
      motivos.push(
        'MESMA_CATEGORIA'
      );
    }

    if (
      a.transporte &&
      b.transporte &&
      this.normalizar(a.transporte) ===
      this.normalizar(b.transporte)
    ) {
      motivos.push(
        'MESMO_TRANSPORTE'
      );
    }

    if (
      papelA &&
      papelB &&
      papelA !== papelB
    ) {
      if (
        papelA.indexOf('REGISTRAR') >= 0 ||
        papelA.indexOf('ADAPTAR') >= 0
      ) {
        motivos.push(
          'INFRAESTRUTURA_DE_CAPACIDADE'
        );
      }

      if (
        papelA.indexOf('EXECUTAR') >= 0 &&
        papelB.indexOf('TRANSPORTAR') >= 0
      ) {
        motivos.push(
          'EXECUCAO_E_TRANSPORTE'
        );
      }

      if (
        papelA.indexOf('TRANSPORTAR') >= 0 &&
        papelB.indexOf('EXECUTAR') >= 0
      ) {
        motivos.push(
          'TRANSPORTE_E_EXECUCAO'
        );
      }
    }

    if (
      nomeA.indexOf('REGISTRY') >= 0 ||
      nomeB.indexOf('REGISTRY') >= 0
    ) {
      motivos.push(
        'REGISTRY'
      );
    }

    if (
      nomeA.indexOf('ADAPTER') >= 0 ||
      nomeB.indexOf('ADAPTER') >= 0
    ) {
      motivos.push(
        'ADAPTER'
      );
    }

    if (!motivos.length) {
      return null;
    }

    return {

      origem:
        a.id || a.nome,

      destino:
        b.id || b.nome,

      relacao:
        motivos.join('|'),

      motivos:
        motivos,

      natureza:
        'INFERIDA',

      confianca:
        motivos.length >= 2
          ? 'ALTA'
          : 'MEDIA'

    };

  },


  construir: function() {

    var mapa =
      SOUSA_IA_CAPACIDADES_GAS
        .construirMapa();

    var capacidades =
      mapa.capacidades || [];

    var nos = [];
    var arestas = [];

    for (
      var i = 0;
      i < capacidades.length;
      i++
    ) {

      var capacidade =
        capacidades[i];

      nos.push({

        id:
          capacidade.id ||
          capacidade.nome,

        nome:
          capacidade.nome,

        categoria:
          capacidade.categoria,

        papel:
          capacidade.papel,

        estado:
          capacidade.estado,

        protocolo:
          capacidade.protocolo,

        transporte:
          capacidade.transporte

      });

    }


    for (
      var x = 0;
      x < capacidades.length;
      x++
    ) {

      for (
        var y = x + 1;
        y < capacidades.length;
        y++
      ) {

        var relacao =
          this.relacionar(
            capacidades[x],
            capacidades[y]
          );

        if (relacao) {
          arestas.push(relacao);
        }

      }

    }


    return {

      sistema:
        'SOUSA 2.0',

      componente:
        'SOUSA IA',

      ambiente:
        'GOOGLE_APPS_SCRIPT',

      visao: {

        graus:
          360,

        tridimensional:
          true,

        largura:
          'NOS_CAPACIDADES',

        altura:
          'CAMADAS',

        profundidade:
          'ARESTAS_RELACOES_FLUXOS'

      },

      grafo: {

        nos:
          nos,

        arestas:
          arestas

      },

      estatisticas: {

        capacidades:
          nos.length,

        relacoes:
          arestas.length

      },

      aprendizado: {

        automatico:
          true,

        explicacaoHumana:
          false,

        natureza:
          'INFERENCIA_ESTRUTURAL',

        confianca:
          'CONTROLADA'

      },

      somenteLeitura:
        true,

      timestamp:
        new Date().toISOString()

    };

  },


  diagnostico: function() {

    var grafo =
      this.construir();

    Logger.log(
      JSON.stringify(
        grafo,
        null,
        2
      )
    );

    return grafo;

  }

};


/**
 * FUNÇÃO PÚBLICA GAS
 */
function SOUSA_IA_MAPEAR_RELACOES_360() {

  return SOUSA_IA_GRAFO_RELACOES
    .diagnostico();

}
