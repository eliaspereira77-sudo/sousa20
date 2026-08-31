/**
 * TESTE_USB_FILTER_CENARIOS.js
 * Validação de cenários do Filtro USB Modular
 */


function TESTE_FILTER_CENARIOS(){


  const testes = [

    {
      nome:"COMPONENTE_VALIDO",

      componente:{
        id:"MEC-004",
        nome:"Componente Valido",
        categoria:"IA",
        versao:"1.0.0",
        contrato:"USB_MODULAR"
      }

    },


    {
      nome:"SEM_CONTRATO",

      componente:{
        id:"MEC-005",
        nome:"Componente Sem Contrato",
        categoria:"IA",
        versao:"1.0.0"
      }

    },


    {
      nome:"CONTRATO_INVALIDO",

      componente:{
        id:"MEC-006",
        nome:"Componente Bloqueado",
        categoria:"IA",
        versao:"1.0.0",
        contrato:"OUTRO"
      }

    }

  ];


  testes.forEach(function(teste){


    const resultado =
    SOUSA_USB_FILTER.analisar(
      teste.componente
    );


    Logger.log(
      "TESTE: " + teste.nome
    );


    Logger.log(
      JSON.stringify(resultado)
    );


  });


}