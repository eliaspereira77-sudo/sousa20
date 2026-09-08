/**
 * SOUSA IA — MEMÓRIA DE CAPACIDADES GAS
 *
 * Função:
 * - receber capacidades descobertas
 * - registrar o que a SOUSA IA aprendeu estruturalmente
 * - associar capacidade -> categoria -> papel -> transporte
 * - associar capacidade -> relações
 * - manter histórico de descoberta
 *
 * PRINCÍPIO:
 * PLUG & PLAY + APRENDIZADO ESTRUTURAL
 *
 * V1:
 * SOMENTE LEITURA DO ECOSSISTEMA
 * ESCRITA APENAS NA MEMÓRIA CONTROLADA
 */

var SOUSA_IA_MEMORIA_CAPACIDADES_GAS = {

  protocolo: 'SOUSA-IA-CAPABILITY-MEMORY',
  versao: '1.0.0',

  CHAVE_MEMORIA:
    'SOUSA_IA_MEMORIA_CAPACIDADES_V1',

  criarConhecimento: function() {

    var mapa =
      SOUSA_IA_GRAFO_RELACOES
        .construir();

    var conhecimento = {

      sistema:
        'SOUSA 2.0',

      componente:
        'SOUSA IA',

      ambiente:
        'GOOGLE_APPS_SCRIPT',

      protocolo:
        this.protocolo,

      versao:
        this.versao,

      aprendizado: {

        automatico:
          true,

        explicacaoHumana:
          false,

        origem:
          'DESCOBERTA_AUTOMATICA',

        metodo:
          'INFERENCIA_ESTRUTURAL',

        soberania:
          'HUMANA'
      },

      capacidades: [],

      relacoes: [],

      estatisticas: {

        capacidades:
          0,

        relacoes:
          0,

        aprendizados:
          0
      },

      timestamp:
        new Date().toISOString()
    };

    var capacidades =
      mapa.grafo &&
      mapa.grafo.nos
        ? mapa.grafo.nos
        : [];

    var relacoes =
      mapa.grafo &&
      mapa.grafo.arestas
        ? mapa.grafo.arestas
        : [];

    for (
      var i = 0;
      i < capacidades.length;
      i++
    ) {

      var c =
        capacidades[i];

      conhecimento.capacidades.push({

        id:
          c.id,

        nome:
          c.nome,

        categoria:
          c.categoria,

        papel:
          c.papel,

        estado:
          c.estado,

        protocolo:
          c.protocolo,

        transporte:
          c.transporte,

        conhecimento: {

          identificado:
            true,

          funcaoInferida:
            c.papel || 'DESCONHECIDA',

          categoriaInferida:
            c.categoria || 'GERAL',

          transporteInferido:
            c.transporte || 'NAO_DEFINIDO',

          origemConhecimento:
            'OBSERVACAO_ESTRUTURAL',

          necessitaExplicacao:
            false
        }
      });
    }

    for (
      var j = 0;
      j < relacoes.length;
      j++
    ) {

      conhecimento.relacoes =
        conhecimento.relacoes || [];

      conhecimento.relacoes.push(
        relacoes[j]
      );
    }

    conhecimento.relacoes =
      relacoes;

    conhecimento.estatisticas.capacidades =
      conhecimento.capacidades.length;

    conhecimento.estatisticas.relacoes =
      conhecimento.relacoes.length;

    conhecimento.estatisticas.aprendizados =
      conhecimento.capacidades.length +
      conhecimento.relacoes.length;

    return conhecimento;
  },


  salvar: function(conhecimento) {

    try {

      PropertiesService
        .getScriptProperties()
        .setProperty(
          this.CHAVE_MEMORIA,
          JSON.stringify(
            conhecimento
          )
        );

      return {

        sucesso:
          true,

        armazenamento:
          'SCRIPT_PROPERTIES',

        chave:
          this.CHAVE_MEMORIA

      };

    } catch (erro) {

      return {

        sucesso:
          false,

        erro:
          String(
            erro.message ||
            erro
          )

      };
    }
  },


  carregar: function() {

    try {

      var bruto =
        PropertiesService
          .getScriptProperties()
          .getProperty(
            this.CHAVE_MEMORIA
          );

      if (!bruto) {

        return null;

      }

      return JSON.parse(
        bruto
      );

    } catch (erro) {

      return null;

    }
  },


  aprender: function() {

    var conhecimento =
      this.criarConhecimento();

    var resultado =
      this.salvar(
        conhecimento
      );

    return {

      conhecimento:
        conhecimento,

      persistencia:
        resultado,

      aprendido:
        resultado.sucesso === true,

      timestamp:
        new Date().toISOString()

    };
  },


  diagnostico: function() {

    var resultado =
      this.aprender();

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
function SOUSA_IA_APRENDER_CAPACIDADES() {

  return SOUSA_IA_MEMORIA_CAPACIDADES_GAS
    .diagnostico();

}

