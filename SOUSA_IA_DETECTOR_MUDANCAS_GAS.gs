/**
 * SOUSA IA — DETECTOR DE MUDANÇAS DE CAPACIDADES GAS
 *
 * Função:
 * - comparar conhecimento anterior com estado atual
 * - detectar capacidades novas
 * - detectar capacidades removidas
 * - detectar alterações estruturais
 * - identificar novos plugins/adapters
 * - preparar atualização do conhecimento
 *
 * PRINCÍPIO:
 * USB PLUG & PLAY
 *
 * NOVA CAPACIDADE:
 * DETECTAR -> ANALISAR -> APRENDER
 *
 * NÃO:
 * - executar capacidade
 * - executar API
 * - alterar código
 * - alterar capacidade
 *
 * V1 — DETECÇÃO CONTROLADA
 */

var SOUSA_IA_DETECTOR_MUDANCAS_GAS = {

  protocolo: 'SOUSA-IA-CAPABILITY-CHANGE-DETECTOR',
  versao: '1.0.0',

  obterEstadoAtual: function() {

    return SOUSA_IA_ANALISADOR_SEMANTICO_GAS
      .construirMapaSemantico();

  },


  obterMemoriaAnterior: function() {

    try {

      return SOUSA_IA_MEMORIA_CAPACIDADES_GAS
        .carregar();

    } catch (erro) {

      return null;

    }

  },


  indexar: function(capacidades) {

    var indice = {};

    if (!Array.isArray(capacidades)) {
      return indice;
    }

    for (
      var i = 0;
      i < capacidades.length;
      i++
    ) {

      var capacidade =
        capacidades[i];

      var id =
        capacidade.id ||
        capacidade.nome;

      if (id) {
        indice[id] = capacidade;
      }

    }

    return indice;

  },


  detectar: function() {

    var atual =
      this.obterEstadoAtual();

    var anterior =
      this.obterMemoriaAnterior();

    var capacidadesAtuais =
      atual.capacidades || [];

    var capacidadesAnteriores =
      anterior &&
      Array.isArray(anterior.capacidades)
        ? anterior.capacidades
        : [];

    var indiceAtual =
      this.indexar(
        capacidadesAtuais
      );

    var indiceAnterior =
      this.indexar(
        capacidadesAnteriores
      );

    var novas = [];
    var removidas = [];
    var modificadas = [];
    var mantidas = [];


    /*
     * NOVAS E MODIFICADAS
     */

    for (
      var i = 0;
      i < capacidadesAtuais.length;
      i++
    ) {

      var atualCap =
        capacidadesAtuais[i];

      var id =
        atualCap.id ||
        atualCap.nome;

      if (
        !indiceAnterior[id]
      ) {

        novas.push(
          atualCap
        );

        continue;

      }


      var anteriorCap =
        indiceAnterior[id];

      var atualAssinatura =
        JSON.stringify({
          nome: atualCap.nome,
          categoria: atualCap.categoria,
          papel: atualCap.papel,
          transporte: atualCap.transporte,
          funcaoInferida:
            atualCap.funcaoInferida,
          sinaisSemanticos:
            atualCap.sinaisSemanticos
        });

      var anteriorAssinatura =
        JSON.stringify({
          nome: anteriorCap.nome,
          categoria: anteriorCap.categoria,
          papel: anteriorCap.papel,
          transporte: anteriorCap.transporte,
          funcaoInferida:
            anteriorCap.funcaoInferida,
          sinaisSemanticos:
            anteriorCap.sinaisSemanticos
        });


      if (
        atualAssinatura !==
        anteriorAssinatura
      ) {

        modificadas.push({

          id: id,

          anterior:
            anteriorCap,

          atual:
            atualCap

        });

      } else {

        mantidas.push(
          atualCap
        );

      }

    }


    /*
     * REMOVIDAS
     */

    for (
      var j = 0;
      j < capacidadesAnteriores.length;
      j++
    ) {

      var anteriorCap =
        capacidadesAnteriores[j];

      var idAnterior =
        anteriorCap.id ||
        anteriorCap.nome;

      if (
        !indiceAtual[idAnterior]
      ) {

        removidas.push(
          anteriorCap
        );

      }

    }


    return {

      sistema:
        'SOUSA 2.0',

      componente:
        'SOUSA IA',

      ambiente:
        'GOOGLE_APPS_SCRIPT',

      protocolo:
        this.protocolo,

      timestamp:
        new Date().toISOString(),

      plugAndPlay: {

        ativo: true,

        descobertaAutomatica:
          true,

        deteccaoMudancas:
          true

      },

      mudancas: {

        novas:
          novas,

        removidas:
          removidas,

        modificadas:
          modificadas,

        mantidas:
          mantidas

      },

      resumo: {

        novas:
          novas.length,

        removidas:
          removidas.length,

        modificadas:
          modificadas.length,

        mantidas:
          mantidas.length,

        totalAtual:
          capacidadesAtuais.length,

        totalAnterior:
          capacidadesAnteriores.length

      },

      aprendizado: {

        necessario:
          novas.length > 0 ||
          removidas.length > 0 ||
          modificadas.length > 0,

        novasDevemSerAnalisadas:
          novas.length > 0,

        memoriaAnteriorDisponivel:
          anterior !== null,

        execucaoAutomatica:
          false

      },

      somenteLeitura:
        true

    };

  },


  diagnostico: function() {

    var resultado =
      this.detectar();

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

function SOUSA_IA_DETECTAR_MUDANCAS_CAPACIDADES() {

  return SOUSA_IA_DETECTOR_MUDANCAS_GAS
    .diagnostico();

}
