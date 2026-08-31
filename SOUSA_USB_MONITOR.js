/**
 * SOUSA_USB_MONITOR.js
 * Monitoramento da USB Modular
 * v1.0.0
 */


const SOUSA_USB_MONITOR = {


 analisar:function(){


   const dados =
   SOUSA_USB_STATUS.consultar();


   const alertas = [];


   dados.componentes.forEach(function(item){


     if(item.status === "AGUARDANDO_VALIDACAO"){


       alertas.push({

         id:item.id,

         tipo:
         "VALIDACAO_PENDENTE"

       });


     }


     if(item.status === "BLOQUEADO"){


       alertas.push({

         id:item.id,

         tipo:
         "COMPONENTE_BLOQUEADO"

       });


     }


   });


   return {

     sistema:
     "SOUSA 2.0",

     modulo:
     "USB_MODULAR",

     data:
     new Date().toISOString(),

     alertas:alertas,

     totalAlertas:
     alertas.length

   };


 }


};