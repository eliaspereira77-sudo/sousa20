/**
 * SOUSA_USB_VERSION_CONTROL.js
 * Controle de versões USB Modular
 * v1.0.0
 */


const SOUSA_USB_VERSION_CONTROL = {


 verificar:function(componente){


   const versao =
   componente.versao || null;


   if(!versao){


     return {

       compatibilidade:false,

       motivo:
       "Versão não informada"

     };


   }


   return {


     compatibilidade:true,

     versaoDetectada:
     versao,

     status:
     "VERSAO_COMPATIVEL"


   };


 },


 registrar:function(componente){


   return {


     id:
     componente.id,


     versao:
     componente.versao,


     data:
     new Date().toISOString(),


     status:
     "REGISTRADO"


   };


 }


};