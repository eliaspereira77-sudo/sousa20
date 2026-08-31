/**
 * SOUSA_LOG_ENGINE.js
 * Motor de registro cronológico SOUSA 2.0
 * v1.0.0
 */

const SOUSA_LOG_ENGINE = {

  registrar:function(evento){

    const registro = {

      id_evento:
      Utilities.getUuid(),

      data:
      new Date().toLocaleDateString("pt-BR"),

      hora:
      new Date().toLocaleTimeString("pt-BR"),

      modulo:
      evento.modulo || "SOUSA_CORE",

      acao:
      evento.acao || "EVENTO",

      arquivo:
      evento.arquivo || "",

      explicacao:
      evento.explicacao || "",

      resultado:
      evento.resultado || "",

      pendencias:
      evento.pendencias || [],

      decisao_fundador:
      evento.decisao_fundador || "",

      proximo_passo:
      evento.proximo_passo || ""

    };


    Logger.log(JSON.stringify(registro));


    return {
      sucesso:true,
      registro:registro
    };

  }

};