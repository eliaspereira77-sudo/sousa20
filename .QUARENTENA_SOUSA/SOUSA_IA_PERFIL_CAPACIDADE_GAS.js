/**
 * SOUSA IA — PERFIL SEMÂNTICO DE CAPACIDADES
 *
 * Objetivo:
 * transformar a descoberta estrutural em conhecimento
 * operacional rastreável.
 *
 * FLUXO:
 * descoberta
 *    ↓
 * classificação
 *    ↓
 * perfil semântico
 *    ↓
 * relações
 *    ↓
 * conhecimento da SOUSA IA
 *
 * V1 — SOMENTE LEITURA
 */

var SOUSA_IA_PERFIL_CAPACIDADE = {

  protocolo: 'SOUSA-IA-CAPABILITY-PROFILE',
  versao: '1.0.0',

  criarPerfil: function(capacidade) {

    if (!capacidade) {
      return {
        estado: 'SEM_CAPACIDADE'
      };
    }

    var nome =
      String(capacidade.nome || '');

    var categoria =
      String(capacidade.categoria || '');

    var papel =
      String(capacidade.papel || '');

    var texto =
      (nome + ' ' + categoria + ' ' + papel)
        .toUpperCase();

    var funcoesProvaveis = [];

    if (
      texto.indexOf('EXECUTOR') >= 0
    ) {
      funcoesProvaveis.push(
        'EXECUCAO_DE_OPERACOES'
      );
    }

    if (
      texto.indexOf('API') >= 0
    ) {
      funcoesProvaveis.push(
        'INTEGRACAO_API'
      );
    }

    if (
      texto.indexOf('USB') >= 0
    ) {
      funcoesProvaveis.push(
        'TRANSPORTE_PLUG_AND_PLAY'
      );
    }

    if (
      texto.indexOf('REGISTRY') >= 0 ||
      texto.indexOf('CAPABILITY') >= 0
    ) {
      funcoesProvaveis.push(
        'GESTAO_DE_CAPACIDADES'
      );
    }

    if (
      texto.indexOf('MEMORIA') >= 0 ||
      texto.indexOf('DNA') >= 0
    ) {
      funcoesProvaveis.push(
        'MEMORIA_E_CONTEXTO'
      );
    }

    if (
      texto.indexOf('REPAIR') >= 0 ||
      texto.indexOf('SELF_TEST') >= 0 ||
      texto.indexOf('MAINTENANCE') >= 0
    ) {
      funcoesProvaveis.push(
        'DIAGNOSTICO_E_MANUTENCAO'
      );
    }

    if (
      texto.indexOf('COMMAND') >= 0 ||
      texto.indexOf('MOBILE') >= 0
    ) {
      funcoesProvaveis.push(
        'INTERFACE_E_COMANDO'
      );
    }

    return {

      identidade: {
        id: capacidade.id || null,
        nome: nome,
        origem:
          capacidade.origem ||
          'OBSERVACAO_GAS'
      },

      estado:
        capacidade.estado ||
        'DESCONHECIDO',

      transporte:
        capacidade.transporte ||
        null,

      protocolo:
        capacidade.protocolo ||
        null,

      categoria:
        categoria,

      papel:
        papel,

      assinatura:
        capacidade.assinatura ||
        null,

      funcoesProvaveis:
        funcoesProvaveis,

      aprendizado: {

        descobertaAutomatica: true,

        perfilGeradoAutomaticamente: true,

        explicacaoHumanaNecessaria: false,

        natureza:
          funcoesProvaveis.length > 0
            ? 'INFERENCIA_ESTRUTURAL'
            : 'DESCONHECIDA',

        confianca:
          funcoesProvaveis.length >= 2
            ? 'ALTA'
            : funcoesProvaveis.length === 1
              ? 'MEDIA'
              : 'BAIXA'

      },

      timestamp:
        new Date().toISOString()

    };

  },


  construirConhecimento: function() {

    var mapa =
      SOUSA_IA_CAPACIDADES_GAS
        .construirMapa();

    var capacidades =
      mapa.capacidades || [];

    var perfis = [];

    for (
      var i = 0;
      i < capacidades.length;
      i++
    ) {

      perfis.push(
        this.criarPerfil(
          capacidades[i]
        )
      );

    }

    return {

      sistema: 'SOUSA 2.0',

      componente: 'SOUSA IA',

      ambiente:
        'GOOGLE_APPS_SCRIPT',

      protocolo:
        this.protocolo,

      visao: {

        graus: 360,

        dimensoes3D: true,

        largura:
          'capacidades',

        altura:
          'camadas',

        profundidade:
          'funcoes_relacoes_dependencias'

      },

      conhecimento: perfis,

      total:
        perfis.length,

      somenteLeitura:
        true,

      timestamp:
        new Date().toISOString()

    };

  },


  diagnostico: function() {

    var conhecimento =
      this.construirConhecimento();

    Logger.log(
      JSON.stringify(
        conhecimento,
        null,
        2
      )
    );

    return conhecimento;

  }

};


/**
 * FUNÇÃO PÚBLICA GAS
 */
function SOUSA_IA_CONSTRUIR_PERFIS_CAPACIDADES() {

  return SOUSA_IA_PERFIL_CAPACIDADE
    .diagnostico();

}
