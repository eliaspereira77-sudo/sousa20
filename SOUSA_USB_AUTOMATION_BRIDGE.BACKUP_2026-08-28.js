/**
 * SOUSA_USB_AUTOMATION_BRIDGE.js
 * Ponte USB Modular + Automações
 * v1.0.0
 */


const SOUSA_USB_AUTOMATION_BRIDGE = {


 disparar:function(evento){


   const automacao = {


     sistema:
     "SOUSA 2.0",


     origem:
     "USB_MODULAR",


     evento:
     evento.tipo,


     acao:
     "PROCESSAMENTO_AUTOMATICO",


     dataHora:
     new Date().toISOString()


   };


   Logger.log(
     JSON.stringify(automacao)
   );


   return {


     sucesso:true,


     status:
     "AUTOMACAO_DISPARADA",


     dados:
     automacao


   };


 }


};