/**
 * SOUSA IA — RECONCILIADOR DE CONSCIÊNCIA GAS
 *
 * Função:
 * - comparar conhecimento anterior x estado atual
 * - detectar capacidades novas
 * - detectar capacidades removidas
 * - detectar capacidades modificadas
 * - detectar relações novas/removidas
 * - preparar atualização controlada da memória
 *
 * PRINCÍPIO:
 * OBSERVAR -> COMPARAR -> COMPREENDER -> REGISTRAR
 *
 * NÃO:
 * - executa capacidades
 * - altera código-fonte
 * - altera Registry
 * - acessa chaves
 * - executa APIs externas
 */

var SOUSA_IA_RECONCILIADOR_CONSCIENCIA_GAS = {

  protocolo:
    'SOUSA-IA-CONSCIOUSNESS-RECONCILIATION',

  versao:
    '1.0.0',

  normalizar: function(valor) {

    return String(valor || '')
      .toUpperCase()
      .replace(/\s+/g, '_')
      .trim();

  },


  indicePorId: function(lista) {

    var indice = {};

    if (!Array.isArray(lista)) {
      return indice;
    }

    for (var i = 0; i < lista.length; i++) {

      var item = lista[i];

      if (!item) {
        continue;
      }

      var id =
        item.id ||
        item.nome ||
        null;

      if (id) {
        indice[
          this.normalizar(id)
        ] = item;
      }

    }

    return indice;

  },


  compararCapacidades: function(
    anterior,
    atual
  ) {

    var resultado = {

      novas: [],
      removidas: [],
      modificadas: [],
      mantidas: []

    };

    var mapaAnterior =
      this.indicePorId(anterior);

    var mapaAtual =
      this.indicePorId(atual);


    Object.keys(mapaAtual).forEach(
      function(id) {

        var nova =
          mapaAtual[id];

        var antiga =
          mapaAnterior[id];

        if (!antiga) {

          resultado.novas.push(nova);

          return;
        }


        var mudou =
          JSON.stringify({
            categoria:
              antiga.categoria,

            papel:
              antiga.papel,

            estado:
              antiga.estado,

            protocolo:
              antiga.protocolo,

            transporte:
              antiga.transporte
          }) !==
          JSON.stringify({
            categoria:
              nova.categoria,

            papel:
              nova.papel,

            estado:
              nova.estado,

            protocolo:
              nova.protocolo,

            transporte:
              nova.transporte
          });


        if (mudou) {

          resultado.modificadas.push({

            id: id,

            anterior: antiga,

            atual: nova

          });

        } else {

          resultado.mantidas.push(nova);

        }

      }
    );


    Object.keys(mapaAnterior).forEach(
      function(id) {

        if (!mapaAtual[id]) {

          resultado.removidas.push(
            mapaAnterior[id]
          );

        }

      }
    );


    return resultado;

  },


  chaveRelacao: function(relacao) {

    if (!relacao) {
      return '';
    }

    return [
      relacao.origem || '',
      relacao.destino || '',
      relacao.relacao || ''
    ]
      .map(this.normalizar.bind(this))
      .join('::');

  },


  indiceRelacoes: function(lista) {

    var indice = {};

    if (!Array.isArray(lista)) {
      return indice;
    }

    for (var i = 0; i < lista.length; i++) {

      var chave =
        this.chaveRelacao(lista[i]);

      if (chave) {
        indice[chave] =
          lista[i];
      }

    }

    return indice;

  },


  compararRelacoes: function(
    anterior,
    atual
  ) {

    var resultado = {

      novas: [],
      removidas: [],
      mantidas: []

    };

    var mapaAnterior =
      this.indiceRelacoes(anterior);

    var mapaAtual =
      this.indiceRelacoes(atual);


    Object.keys(mapaAtual).forEach(
      function(chave) {

        if (!mapaAnterior[chave]) {

          resultado.novas.push(
            mapaAtual[chave]
          );

        } else {

          resultado.mantidas.push(
            mapaAtual[chave]
          );

        }

      }
    );


    Object.keys(mapaAnterior).forEach(
      function(chave) {

        if (!mapaAtual[chave]) {

          resultado.removidas.push(
            mapaAnterior[chave]
          );

        }

      }
    );


    return resultado;

  },


  construir: function() {

    var atual =
      SOUSA_IA_GRAFO_RELACOES
        .construir();

    var memoria =
      SOUSA_IA_MEMORIA_CAPACIDADES_GAS
        .carregar();


    var capacidadesAnteriores =
      memoria &&
      Array.isArray(memoria.capacidades)
        ? memoria.capacidades
        : [];


    var relacoesAnteriores =
      memoria &&
      Array.isArray(memoria.relacoes)
        ? memoria.relacoes
        : [];


    var capacidadesAtuais =
      atual &&
      atual.grafo &&
      Array.isArray(atual.grafo.nos)
        ? atual.grafo.nos
        : [];


    var relacoesAtuais =
      atual &&
      atual.grafo &&
      Array.isArray(atual.grafo.arestas)
        ? atual.grafo.arestas
        : [];


    var capacidades =
      this.compararCapacidades(
        capacidadesAnteriores,
        capacidadesAtuais
      );


    var relacoes =
      this.compararRelacoes(
        relacoesAnteriores,
        relacoesAtuais
      );


    return {

      sistema:
        'SOUSA 2.0',

      componente:
        'SOUSA IA',

      ambiente:
        'GOOGLE_APPS_SCRIPT',

      protocolo:
        this.protocolo,

      consciencia: {

        visao360:
          true,

        tridimensional:
          true,

        observacaoContinua:
          true,

        comparacaoTemporal:
          true

      },

      capacidades:
        capacidades,

      relacoes:
        relacoes,

      mudancas: {

        capacidadesNovas:
          capacidades.novas.length,

        capacidadesRemovidas:
          capacidades.removidas.length,

        capacidadesModificadas:
          capacidades.modificadas.length,

        relacoesNovas:
          relacoes.novas.length,

        relacoesRemovidas:
          relacoes.removidas.length

      },

      aprendizado: {

        automatico:
          true,

        necessitaExplicacaoHumana:
          false,

        natureza:
          'RECONCILIACAO_ESTRUTURAL',

        soberania:
          'HUMANA'

      },

      execucao: {

        realizada:
          false,

        permitida:
          false

      },

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

function SOUSA_IA_RECONCILIAR_CONSCIENCIA() {

  return SOUSA_IA_RECONCILIADOR_CONSCIENCIA_GAS
    .diagnostico();

}
