/**
 * SOUSA_CMD_INTERFACE.js
 * Interface de comandos operacionais
 * Versão 1.0.0
 */


const SOUSA_CMD_INTERFACE = {


  cadastrarMecanismo: function(dados) {


    return SOUSA_COMMAND_EXTENSIONS.executar(

      "CADASTRAR_MECANISMO",

      dados

    );

  },


  validarMecanismo: function(id) {


    return SOUSA_COMMAND_EXTENSIONS.executar(

      "VALIDAR_MECANISMO",

      {
        id:id
      }

    );

  },


  listarMecanismos: function() {


    return SOUSA_COMMAND_EXTENSIONS.executar(

      "LISTAR_MECANISMOS"

    );

  }


};