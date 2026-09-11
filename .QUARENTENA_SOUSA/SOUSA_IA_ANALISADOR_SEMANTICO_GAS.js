/**
 * SOUSA IA — ANALISADOR SEMÂNTICO DE CAPACIDADES GAS
 *
 * Objetivo:
 * - analisar capacidades já descobertas
 * - inferir finalidade operacional
 * - identificar domínio
 * - identificar entradas/saídas quando disponíveis
 * - identificar sinais de dependência
 * - gerar descrição funcional automática
 *
 * PRINCÍPIO:
 * A SOUSA IA NÃO PRECISA SER INFORMADA MANUALMENTE
 * SOBRE A FINALIDADE BÁSICA DE CADA CAPACIDADE.
 *
 * V1:
 * SOMENTE LEITURA
 * SEM EXECUÇÃO
 * SEM ALTERAÇÃO DE CÓDIGO
 */

var SOUSA_IA_ANALISADOR_SEMANTICO_GAS = {

  protocolo: 'SOUSA-IA-SEMANTIC-CAPABILITY',
  versao: '1.0.0',

  analisarNome: function(nome) {

    var n = String(nome || '').toUpperCase();

    var sinais = [];

    if (n.indexOf('EXECUTOR') >= 0)
      sinais.push('EXECUCAO');

    if (n.indexOf('REGISTRY') >= 0)
      sinais.push('REGISTRO');

    if (n.indexOf('ADAPTER') >= 0)
      sinais.push('ADAPTACAO');

    if (n.indexOf('MEMORIA') >= 0)
      sinais.push('MEMORIA');

    if (n.indexOf('DNA') >= 0)
      sinais.push('IDENTIDADE_ESTRUTURAL');

    if (n.indexOf('REPAIR') >= 0)
      sinais.push('REPARO');

    if (n.indexOf('SELF_TEST') >= 0)
      sinais.push('AUTOTESTE');

    if (n.indexOf('MAINTENANCE') >= 0)
      sinais.push('MANUTENCAO');

    if (n.indexOf('USB') >= 0)
      sinais.push('TRANSPORTE_E_INTEGRACAO');

    if (n.indexOf('MOBILE') >= 0)
      sinais.push('MOBILE');

    if (n.indexOf('COMMAND') >= 0)
      sinais.push('COMANDO');

    if (n.indexOf('DEEPGRAM') >= 0)
      sinais.push('AUDIO');

    if (n.indexOf('MINIMAX') >= 0)
      sinais.push('MODELO_IA');

    if (n.indexOf('MANUS') >= 0)
      sinais.push('AGENTE_IA');

    if (n.indexOf('OPENCODE') >= 0)
      sinais.push('CODIFICACAO');

    if (n.indexOf('RUFLO') >= 0)
      sinais.push('ORQUESTRACAO');

    return sinais;
  },


  inferirFuncao: function(capacidade) {

    var sinais =
      this.analisarNome(
        capacidade.nome
      );

    var papel =
      capacidade.papel || '';

    var categoria =
      capacidade.categoria || '';

    var funcoes = [];


    if (
      sinais.indexOf('EXECUCAO') >= 0 ||
      String(papel)
        .toUpperCase()
        .indexOf('EXECUTAR') >= 0
    ) {
      funcoes.push(
        'executar operações autorizadas'
      );
    }


    if (
      sinais.indexOf('REGISTRO') >= 0
    ) {
      funcoes.push(
        'registrar e catalogar capacidades'
      );
    }


    if (
      sinais.indexOf('ADAPTACAO') >= 0
    ) {
      funcoes.push(
        'adaptar capacidades ao ecossistema'
      );
    }


    if (
      sinais.indexOf('MEMORIA') >= 0 ||
      sinais.indexOf('IDENTIDADE_ESTRUTURAL') >= 0
    ) {
      funcoes.push(
        'armazenar ou recuperar conhecimento'
      );
    }


    if (
      sinais.indexOf('REPARO') >= 0
    ) {
      funcoes.push(
        'detectar ou recuperar falhas'
      );
    }


    if (
      sinais.indexOf('AUTOTESTE') >= 0
    ) {
      funcoes.push(
        'validar o próprio funcionamento'
      );
    }


    if (
      sinais.indexOf('MANUTENCAO') >= 0
    ) {
      funcoes.push(
        'realizar manutenção do sistema'
      );
    }


    if (
      sinais.indexOf('TRANSPORTE_E_INTEGRACAO') >= 0
    ) {
      funcoes.push(
        'transportar ou integrar capacidades'
      );
    }


    if (
      sinais.indexOf('AUDIO') >= 0
    ) {
      funcoes.push(
        'processar capacidades relacionadas a áudio'
      );
    }


    if (
      sinais.indexOf('MODELO_IA') >= 0
    ) {
      funcoes.push(
        'fornecer capacidade de inteligência artificial'
      );
    }


    if (
      sinais.indexOf('AGENTE_IA') >= 0
    ) {
      funcoes.push(
        'fornecer capacidade de agente inteligente'
      );
    }


    if (
      sinais.indexOf('CODIFICACAO') >= 0
    ) {
      funcoes.push(
        'auxiliar desenvolvimento e programação'
      );
    }


    if (
      sinais.indexOf('ORQUESTRACAO') >= 0
    ) {
      funcoes.push(
        'orquestrar capacidades e fluxos'
      );
    }


    if (
      sinais.indexOf('COMANDO') >= 0
    ) {
      funcoes.push(
        'receber ou encaminhar comandos'
      );
    }


    if (!funcoes.length) {

      if (categoria) {

        funcoes.push(
          'capacidade relacionada ao domínio ' +
          String(categoria).toLowerCase()
        );

      } else {

        funcoes.push(
          'capacidade detectada no ecossistema'
        );

      }

    }

    return funcoes;
  },


  analisar: function(capacidade) {

    var sinais =
      this.analisarNome(
        capacidade.nome
      );

    var funcoes =
      this.inferirFuncao(
        capacidade
      );

    return {

      id:
        capacidade.id ||
        capacidade.nome,

      nome:
        capacidade.nome,

      estado:
        capacidade.estado ||
        'DESCONHECIDO',

      categoria:
        capacidade.categoria ||
        'GERAL',

      papel:
        capacidade.papel ||
        'DESCONHECIDO',

      transporte:
        capacidade.transporte ||
        'NAO_DEFINIDO',

      sinaisSemanticos:
        sinais,

      funcaoInferida:
        funcoes,

      descricaoAutomatica:
        funcoes.join('; '),

      origem:
        capacidade.origem ||
        'OBSERVACAO_ESTRUTURAL',

      confianca:
        sinais.length >= 2
          ? 'ALTA'
          : sinais.length === 1
            ? 'MEDIA'
            : 'BAIXA',

      necessitaExplicacaoHumana:
        false,

      somenteLeitura:
        true

    };

  },


  construirMapaSemantico: function() {

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
        this.analisar(
          capacidades[i]
        )
      );

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

      visao:

        {
          graus: 360,
          tridimensional: true,

          largura:
            'CAPACIDADES',

          altura:
            'CAMADAS',

          profundidade:
            'FUNCOES_RELACOES_DEPENDENCIAS'
        },

      plugAndPlay:
        true,

      descobertaAutomatica:
        true,

      aprendizadoSemantico:
        true,

      explicacaoHumanaNecessaria:
        false,

      capacidades:
        perfis,

      total:
        perfis.length,

      timestamp:
        new Date().toISOString(),

      somenteLeitura:
        true

    };

  },


  diagnostico: function() {

    var resultado =
      this.construirMapaSemantico();

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

function SOUSA_IA_ANALISAR_CAPACIDADES() {

  return
    SOUSA_IA_ANALISADOR_SEMANTICO_GAS
      .diagnostico();

}
