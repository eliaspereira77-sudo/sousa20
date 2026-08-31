/**
 * ==========================================================
 * SOUSA 2.0 — CARDÃ RUFLO
 * ==========================================================
 * Ponte de transmissão entre o SOUSA 2.0 e o RUFLO.
 *
 * O CARDÃ:
 * - recebe uma missão do SOUSA;
 * - normaliza o contrato;
 * - entrega ao adaptador Ruflo;
 * - recebe o resultado;
 * - devolve ao SOUSA em formato padronizado.
 *
 * NÃO altera produção.
 * NÃO executa Ruflo diretamente sem adaptador autorizado.
 * ==========================================================
 */

var SOUSA_RUFLO_CARDAN = {

  versao: "1.0.0",

  estado: "AGUARDANDO_ADAPTADOR",

  adaptador: null,

  registrarAdaptador: function(adaptador) {

    if (!adaptador ||
        typeof adaptador.executar !== "function") {

      return {
        ok: false,
        status: "ADAPTADOR_INVALIDO",
        mensagem:
          "O adaptador Ruflo deve possuir executar(missao)."
      };

    }

    this.adaptador = adaptador;
    this.estado = "ADAPTADOR_REGISTRADO";

    return {
      ok: true,
      status: "RUFLO_CARDAN_PRONTO",
      versao: this.versao
    };
  },


  criarMissao: function(missao) {

    var entrada = missao || {};

    return {
      id:
        entrada.id ||
        "RUFLO_MISSAO_" + Date.now(),

      origem:
        entrada.origem ||
        "SOUSA_2.0",

      tipo:
        entrada.tipo ||
        "EXPANSAO_DE_CAPACIDADE",

      objetivo:
        entrada.objetivo ||
        "",

      capacidade:
        entrada.capacidade ||
        null,

      contexto:
        entrada.contexto ||
        {},

      restricoes:
        entrada.restricoes ||
        {
          alterar_producao: false,
          exigir_autorizacao: true
        },

      timestamp:
        new Date().toISOString()
    };
  },


  executar: function(missao) {

    var contrato =
      this.criarMissao(missao);

    if (!this.adaptador) {

      return {
        ok: false,
        status: "SEM_ADAPTADOR_RUFLO",
        missao: contrato,
        mensagem:
          "Cardã preparado, mas nenhum adaptador Ruflo está conectado."
      };
    }

    try {

      var resultado =
        this.adaptador.executar(contrato);

      return {
        ok: true,
        status: "MISSAO_TRANSMITIDA",
        missao: contrato,
        resultado: resultado,
        timestamp:
          new Date().toISOString()
      };

    } catch (erro) {

      return {
        ok: false,
        status: "FALHA_RUFLO",
        missao: contrato,
        erro:
          erro.message || String(erro),
        timestamp:
          new Date().toISOString()
      };
    }
  },


  status: function() {

    return {
      ok: true,
      cardan: "SOUSA_RUFLO_CARDAN",
      versao: this.versao,
      estado: this.estado,
      conectado:
        !!this.adaptador
    };
  }

};


/**
 * Interface pública.
 */

function SOUSA_RUFLO_CARDAN_missao(missao) {

  return SOUSA_RUFLO_CARDAN.executar(missao);

}


function SOUSA_RUFLO_CARDAN_status() {

  return SOUSA_RUFLO_CARDAN.status();

}
