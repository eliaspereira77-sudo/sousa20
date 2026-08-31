/**
 * TESTE_USB_CATALOG.js
 * Teste catálogo USB Modular
 */


function TESTE_CADASTRAR_CATALOG(){

  const componente = {

    id:
    "MEC-001",

    nome:
    "Gemini Adapter",

    categoria:
    "IA",

    versao:
    "1.0.0",

    contrato:
    "USB_MODULAR",

    status:
    "ATIVO"

  };


  const resultado =
  SOUSA_USB_CATALOG.adicionar(
    componente
  );


  Logger.log(
    JSON.stringify(resultado)
  );


}


function TESTE_LISTAR_CATALOG(){

  const resultado =
  SOUSA_USB_CATALOG.listar();


  Logger.log(
    JSON.stringify(resultado)
  );

}