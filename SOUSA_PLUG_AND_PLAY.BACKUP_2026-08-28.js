/**
 * SOUSA_PLUG_AND_PLAY.js
 * Motor Plug and Play
 * USB Modular v1.0.0
 */


const SOUSA_PLUG_AND_PLAY = {


  conectar:function(mecanismo){


    const descoberta =
      SOUSA_USB_DISCOVERY.analisar(mecanismo);


    if(!descoberta.sucesso){

      return descoberta;

    }


    return {

      sucesso:true,

      etapa:"CONTRATO_ANALISADO",

      proximo:
      "VALIDACAO",

      mecanismo:
      mecanismo

    };


  },


  ativar:function(id){


    return {

      sucesso:true,

      id:id,

      status:
      "ATIVO"

    };


  }


};