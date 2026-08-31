/**
 * SOUSA IA — APRENDIZADO ESTRUTURAL DE CAPACIDADES
 *
 * Objetivo:
 * descobrir automaticamente o papel operacional
 * das capacidades acopladas ao SOUSA.
 *
 * Não executa a capacidade.
 * Não altera a capacidade.
 * Não modifica o Registry.
 *
 * SOMENTE LEITURA + APRENDIZADO ESTRUTURAL.
 */

var SOUSA_IA_APRENDIZADO_CAPACIDADES = {

  protocolo: 'SOUSA-IA-LEARNING-CAPABILITY',
  versao: '1.0.0',

  analisar: function(capacidade) {

    if (!capacidade) {
      return {
        estado: 'SEM_CAPACIDADE'
      };
    }

    var nome =
      String(capacidade.nome || '').toUpperCase();

    var categoria =
      String(capacidade.categoria || '').toUpperCase();

    var papel =
      String(capacidade.papel || '').toUpperCase();

    var sinais = [];

    if (nome.indexOf('EXECUTOR') >= 0) {
      sinais.push('EXECUCAO');
    }

    if (
      nome.indexOf('MEMORIA') >= 0 ||
      nome.indexOf('DNA') >= 0
    ) {
      sinais.push('MEMORIA');
    }

    if (
      nome.indexOf('REPAIR') >= 0 ||
      nome.indexOf('SELF_TEST') >= 0
    ) {
      sinais.push('MANUTENCAO');
    }

    if (
      nome.indexOf('REGISTRY') >= 0 ||
      nome.indexOf('CAPABILITY') >= 0
    ) {
      sinais.push('GESTAO_DE_CAPACIDADES');
    }

    if (
      nome.indexOf('USB') >= 0 ||
      String(capacidade.protocolo || '')
        .toUpperCase()
        .indexOf('PLUG') >= 0
    ) {
      sinais.push('PLUG_AND_PLAY');
    }

    if (
      nome.indexOf('MOBILE') >= 0 ||
      nome.indexOf('COMMAND') >= 0
    ) {
      sinais.push('INTERFACE');
    }

    return {

      id: capacidade.id || null,

      nome: capacidade.nome || null,

      origem:
        capacidade.origem || 'OBSERVACAO_GAS',

      categoria: categoria,

      papelDeclarado: papel,

      sinaisDetectados: sinais,

      conhecimento: {

        descobertoAutomaticamente: true,

        explicacaoHumanaNecessaria: false,

        confiancaEstrutural:
          sinais.length > 0
            ? 'ALTA'
            : 'INDETERMINADA'

      },

      timestamp:
        new Date().toISOString()

    };

  },


  aprenderMapa: function(mapa) {

    var capacidades =
      mapa &&
      Array.isArray(mapa.capacidades)
        ? mapa.capacidades
        : [];

    var conhecimento = [];

    for (
      var i = 0;
      i < capacidades.length;
      i++
    ) {

      conhecimento.push(
        this.analisar(
          capacidades[i]
        )
      );

    }

    return {

      protocolo:
        this.protocolo,

      total:
        conhecimento.length,

      capacidades:
        conhecimento,

      modo:
        'APRENDIZADO_ESTRUTURAL',

      somenteLeitura:
        true,

      timestamp:
        new Date().toISOString()

    };

  },


  diagnostico: function() {

    var mapa =
      SOUSA_IA_CAPACIDADES_GAS.construirMapa();

    var aprendizado =
      this.aprenderMapa(mapa);

    Logger.log(
      JSON.stringify(
        aprendizado,
        null,
        2
      )
    );

    return aprendizado;

  }

};


/**
 * FUNÇÃO PÚBLICA GAS
 */
function SOUSA_IA_APRENDER_CAPACIDADES() {

  return SOUSA_IA_APRENDIZADO_CAPACIDADES.diagnostico();

}
