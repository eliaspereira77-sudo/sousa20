/**
 * TESTE_USB_FILTER.js
 * Teste filtro USB Modular
 */


function TESTE_USB_FILTER(){


 const componente = {

   id:"MEC-003",

   nome:"Modulo Filtro Teste",

   categoria:"AUTOMACAO",

   versao:"1.0.0",

   contrato:"USB_MODULAR"

 };


 const resultado =
 SOUSA_USB_FILTER.analisar(componente);


 Logger.log(
   JSON.stringify(resultado)
 );


}