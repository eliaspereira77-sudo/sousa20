/**
 * SOUSA_CMD_Mecanismos.js
 * Comandos operacionais USB Modular
 * Versão 1.0.0
 */


const SOUSA_CMD_MECANISMOS = {


  cadastrar: function(dados) {


    const comando = {

      acao: "CADASTRAR_MECANISMO",

      origem: "FUNDADOR",

      data:
        new Date().toISOString()

    };


    const resultado =
      SOUSA_USB.cadastrar(dados);


    return {

      comando,

      resultado

    };

  },


  validar: function(id) {


    const resultado =
      SOUSA_USB.validar(id);


    return {

      acao:"VALIDAR_MECANISMO",

      resultado

    };

  },


  listar: function() {

    return SOUSA_USB.listar();

  }


};