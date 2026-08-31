/**
 * SOUSA_USB_AUTO_MANAGER.js
 * Gerenciador de automações USB Modular
 * v1.0.0
 */


const SOUSA_USB_AUTO_MANAGER = {


 executar:function(componente, evento){


   const automacao = {


     sistema:
     "SOUSA 2.0",


     modulo:
     "USB_MODULAR",


     componente:
     componente.id,


     nome:
     componente.nome,


     evento:
     evento,


     acao:
     "EXECUCAO_AUTOMATICA",


     status:
     "PROCESSADO",


     data:
     new Date().toISOString()


   };


   Logger.log(
     JSON.stringify(automacao)
   );


   return {


     sucesso:true,


     mensagem:
     "Automação executada",


     automacao:
     automacao


   };


 }


};