/**
 * SOUSA_USB_MEMORY_SYNC.js
 * Sincronização USB com Memória Técnica
 * v1.0.0
 */


const SOUSA_USB_MEMORY_SYNC = {


 registrar:function(componente){


   const memoria = {


     sistema:
     "SOUSA 2.0",


     modulo:
     "USB_MODULAR",


     evento:
     "COMPONENTE_SINCRONIZADO",


     componente:
     componente.id,


     nome:
     componente.nome,


     categoria:
     componente.categoria,


     versao:
     componente.versao,


     contrato:
     componente.contrato,


     data:
     new Date().toISOString()


   };


   Logger.log(
     JSON.stringify(memoria)
   );


   return {


     sucesso:true,


     mensagem:
     "Componente sincronizado com memória técnica",


     memoria:
     memoria


   };


 }


};