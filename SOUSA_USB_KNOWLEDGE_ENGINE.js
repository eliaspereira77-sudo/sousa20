/**
 * SOUSA_USB_KNOWLEDGE_ENGINE.js
 * Motor de conhecimento USB Modular
 * v1.0.0
 */


const SOUSA_USB_KNOWLEDGE_ENGINE = {


 analisar:function(componente){


   const conhecimento = {


     sistema:
     "SOUSA 2.0",


     modulo:
     "USB_MODULAR",


     tipo:
     "ANALISE_COMPONENTE",


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


     status:
     componente.status,


     aprendizado:
     "COMPONENTE_MAPEADO",


     data:
     new Date().toISOString()


   };


   Logger.log(
     JSON.stringify(conhecimento)
   );


   return {


     sucesso:true,


     mensagem:
     "Conhecimento gerado",


     conhecimento:
     conhecimento


   };


 },


 consultar:function(){


   return {


     sistema:
     "SOUSA 2.0",


     modulo:
     "USB_MODULAR",


     status:
     "CONHECIMENTO_OPERACIONAL"


   };


 }


};