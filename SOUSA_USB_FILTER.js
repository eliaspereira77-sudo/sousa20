/**
 * SOUSA_USB_FILTER.js
 * Filtro inicial USB Modular SOUSA 2.0
 * v1.0.0
 */

const SOUSA_USB_FILTER = {

  analisar:function(componente){

    const obrigatorios = [
      "id",
      "nome",
      "categoria",
      "versao",
      "contrato"
    ];

    const faltando = obrigatorios.filter(
      campo => !componente[campo]
    );


    if(faltando.length > 0){

      return {

        filtro:"BLOQUEADO",

        motivo:"Campos obrigatórios ausentes",

        faltando:faltando

      };

    }


    if(componente.contrato !== "USB_MODULAR"){

      return {

        filtro:"BLOQUEADO",

        motivo:"Contrato incompatível"

      };

    }


    return {

      filtro:"APROVADO",

      mensagem:"Componente liberado para próxima etapa",

      componente:componente

    };


  }

};