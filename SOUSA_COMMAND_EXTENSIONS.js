/**
 * SOUSA_COMMAND_EXTENSIONS.js
 * Extensões de comandos
 * Versão 1.0.0
 */


const SOUSA_COMMAND_EXTENSIONS = {


  executar: function(comando, dados) {


    switch(comando) {


      case "CADASTRAR_MECANISMO":

        return SOUSA_CMD_MECANISMOS.cadastrar(dados);


      case "VALIDAR_MECANISMO":

        return SOUSA_CMD_MECANISMOS.validar(dados.id);


      case "LISTAR_MECANISMOS":

        return SOUSA_CMD_MECANISMOS.listar();


      default:

        return {

          sucesso:false,

          mensagem:
          "Comando não reconhecido pela extensão USB."

        };

    }

  }

};