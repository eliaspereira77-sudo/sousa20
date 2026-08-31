/**
 * SOUSA_USB.js
 * Porta de entrada da USB Modular
 * Versão: 1.0.0
 *
 * Responsável:
 * - Receber novos mecanismos
 * - Validar contrato USB
 * - Encaminhar para catálogo
 * - Manter separação do Core
 */


const SOUSA_USB = {

  versao: "1.0.0",

  contratoPadrao: "USB_MODULAR",


  cadastrar: function(mecanismo) {

    if (!mecanismo.id || !mecanismo.nome) {

      return {
        sucesso: false,
        mensagem: "Identificação do mecanismo obrigatória"
      };

    }


    mecanismo.contrato =
      this.contratoPadrao;


    mecanismo.dataEntrada =
      new Date().toISOString();


    mecanismo.status =
      "AGUARDANDO_VALIDACAO";


    return SOUSA_MECANISMOS.cadastrar(mecanismo);

  },


  validar: function(id) {

    const mecanismo =
      SOUSA_MECANISMOS.buscarPorId(id);


    if (!mecanismo) {

      return {
        sucesso:false,
        mensagem:"Mecanismo não encontrado"
      };

    }


    if (mecanismo.contrato !== this.contratoPadrao) {

      return {
        sucesso:false,
        mensagem:"Contrato USB incompatível"
      };

    }


    return SOUSA_MECANISMOS.atualizarStatus(
      id,
      "VALIDADO"
    );

  },


  listar: function() {

    return SOUSA_MECANISMOS.listar();

  }

};