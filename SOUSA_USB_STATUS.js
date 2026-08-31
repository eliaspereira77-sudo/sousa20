/**
 * SOUSA_USB_STATUS.js
 * Monitor da USB Modular
 * v1.0.0
 */


const SOUSA_USB_STATUS = {


 consultar:function(){


   const lista =
   SOUSA_REGISTRY.listar();


   const resumo = {

     sistema:
     "SOUSA 2.0",

     modulo:
     "USB_MODULAR",

     total:
     lista.total,

     dataConsulta:
     new Date().toISOString(),

     componentes:
     lista.componentes

   };


   Logger.log(
     JSON.stringify(resumo)
   );


   return resumo;


 }


};