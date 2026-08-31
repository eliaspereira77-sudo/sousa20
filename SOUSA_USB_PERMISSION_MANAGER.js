/**
 * SOUSA_USB_PERMISSION_MANAGER.js
 * Gerenciador de permissões
 * USB Modular v1.0.0
 */


const SOUSA_USB_PERMISSION_MANAGER = {


 definir:function(componente, permissoes){


   return {

     id:
     componente.id,

     permissoes:
     permissoes,

     status:
     "PERMISSOES_REGISTRADAS",

     data:
     new Date().toISOString()

   };


 },


 verificar:function(componente, permissao){


   const autorizado =
   componente.permissoes &&
   componente.permissoes.includes(permissao);


   return {

     id:
     componente.id,

     permissao:
     permissao,

     autorizado:
     autorizado

   };


 }


};