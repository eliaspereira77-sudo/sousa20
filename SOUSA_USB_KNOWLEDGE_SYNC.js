/**
 * SOUSA_USB_KNOWLEDGE_SYNC.js
 * Sincronização USB + Conhecimento
 * v1.0.0
 */


const SOUSA_USB_KNOWLEDGE_SYNC = {


 sincronizar:function(evento){


   const conhecimento = {


     sistema:
     "SOUSA 2.0",


     origem:
     "USB_MODULAR",


     tipo:
     evento.tipo || "EVENTO",


     resumo:
     evento.resumo || "",


     dataHora:
     new Date().toISOString()


   };


   Logger.log(
     JSON.stringify(conhecimento)
   );


   return {


     sucesso:true,


     mensagem:
     "Evento sincronizado com conhecimento",


     conhecimento:conhecimento


   };


 }


};