/**
 * SOUSA_USB_HEALTH_CHECK.js
 * Diagnóstico de componentes
 * USB Modular v1.0.0
 */


const SOUSA_USB_HEALTH_CHECK = {


 verificar:function(componente){


   const testes = {


     identidade:
     !!componente.id,


     nome:
     !!componente.nome,


     contrato:
     componente.contrato ===
     "USB_MODULAR",


     versao:
     !!componente.versao,


     status:
     !!componente.status


   };


   const aprovado =
   Object.values(testes)
   .every(item => item === true);



   return {


     id:
     componente.id,


     saudavel:
     aprovado,


     testes:
     testes,


     data:
     new Date().toISOString()


   };


 }


};