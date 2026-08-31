/**
 * SOUSA_USB_DISCOVERY.js
 * Descoberta automática de mecanismos
 * USB Modular v1.0.0
 */


const SOUSA_USB_DISCOVERY = {


  analisar: function(componente) {


    if (!componente.id ||
        !componente.nome ||
        !componente.contrato) {


      return {

        sucesso:false,

        mensagem:
        "Componente incompleto."

      };

    }


    return {

      sucesso:true,

      status:"IDENTIFICADO",

      mecanismo:componente

    };


  },


  prepararEntrada:function(componente){


    return {

      id:componente.id,

      nome:componente.nome,

      contrato:
      componente.contrato,

      status:
      "AGUARDANDO_VALIDACAO"

    };


  }


};