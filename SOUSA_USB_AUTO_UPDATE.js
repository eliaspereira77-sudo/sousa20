/**
 * SOUSA_USB_AUTO_UPDATE.js
 * Atualização segura USB Modular
 * v1.0.0
 */


const SOUSA_USB_AUTO_UPDATE = {


 preparar:function(atualizacao){


   return {


     sucesso:true,

     componente:
     atualizacao.id,


     versaoAtual:
     atualizacao.versaoAtual,


     novaVersao:
     atualizacao.novaVersao,


     status:
     "AGUARDANDO_VALIDACAO",


     data:
     new Date().toISOString()


   };


 },


 aplicar:function(id, versao){


   return {


     sucesso:true,


     id:id,


     versao:versao,


     status:
     "ATUALIZADO",


     data:
     new Date().toISOString()


   };


 },


 rollback:function(id, versaoAnterior){


   return {


     sucesso:true,


     id:id,


     retorno:
     versaoAnterior,


     status:
     "ROLLBACK_PREPARADO"


   };


 }


};