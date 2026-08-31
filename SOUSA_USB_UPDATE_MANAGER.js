/**
 * SOUSA_USB_UPDATE_MANAGER.js
 * Gerenciador de atualização USB Modular
 * v1.0.0
 */


const SOUSA_USB_UPDATE_MANAGER = {


 atualizar:function(componente, novaVersao){


   const resultado = {


     id:
     componente.id,


     nome:
     componente.nome,


     versaoAnterior:
     componente.versao,


     novaVersao:
     novaVersao,


     status:
     "ATUALIZADO",


     data:
     new Date().toISOString()


   };


   Logger.log(
     JSON.stringify(resultado)
   );


   return {


     sucesso:true,


     mensagem:
     "Componente atualizado",


     atualizacao:
     resultado


   };


 }


};