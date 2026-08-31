/**
 * SOUSA_USB_SECURITY_GATE.js
 * Controle de entrada USB Modular
 * v1.0.0
 */


const SOUSA_USB_SECURITY_GATE = {


 verificar:function(componente){


   const requisitos = [

     "id",

     "nome",

     "contrato",

     "versao"

   ];


   const faltando = requisitos.filter(

     campo => !componente[campo]

   );


   if(faltando.length > 0){


     return {

       autorizado:false,

       status:"BLOQUEADO",

       motivo:
       "Dados obrigatórios ausentes",

       faltando:faltando

     };


   }


   return {

     autorizado:true,

     status:"APROVADO",

     motivo:
     "Componente autorizado para análise"

   };


 }


};