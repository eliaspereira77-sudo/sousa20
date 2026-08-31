/**
 * SOUSA_CMD_BRIDGE.js
 * Ponte entre interface e comandos
 * Versão 1.0.0
 */


function SOUSA_CMD_cadastrarMecanismo(dados) {

  return SOUSA_CMD_INTERFACE.cadastrarMecanismo(dados);

}


function SOUSA_CMD_validarMecanismo(id) {

  return SOUSA_CMD_INTERFACE.validarMecanismo(id);

}


function SOUSA_CMD_listarMecanismos() {

  return SOUSA_CMD_INTERFACE.listarMecanismos();

}