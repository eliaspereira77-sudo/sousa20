/**
 * SOUSA_USB_LOG_ENGINE.js
 * Registro técnico USB Modular
 * v1.0.0
 */


const SOUSA_USB_LOG_ENGINE = {


 registrar:function(acao, dados){


   const log = {


     sistema:
     "SOUSA 2.0",


     modulo:
     "USB_MODULAR",


     acao:
     acao,


     dataHora:
     new Date().toISOString(),


     dados:
     dados || {}


   };


   Logger.log(
     JSON.stringify(log)
   );


   return {


     sucesso:true,


     log:log


   };


 },


 consultar:function(){


   return {


     sistema:
     "SOUSA 2.0",


     modulo:
     "USB_MODULAR",


     status:
     "OPERACIONAL"


   };


 }


};