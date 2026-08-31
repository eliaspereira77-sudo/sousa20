/**
 * SOUSA_USB_API_GATEWAY.js
 * Porta de entrada de integrações externas
 * USB Modular v1.0.0
 */


const SOUSA_USB_API_GATEWAY = {


 receber:function(api){


   if(!api.nome ||
      !api.tipo ||
      !api.contrato){


     return {

       sucesso:false,

       mensagem:
       "API sem contrato válido"

     };


   }


   const entrada = {


     id:
     api.id || 
     "API-"+Date.now(),


     nome:
     api.nome,


     tipo:
     api.tipo,


     contrato:
     api.contrato,


     status:
     "RECEBIDA",


     data:
     new Date().toISOString()


   };


   Logger.log(
     JSON.stringify(entrada)
   );


   return {


     sucesso:true,

     mensagem:
     "API recebida pelo Gateway",


     entrada:entrada


   };


 }


};