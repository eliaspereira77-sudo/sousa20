/**
 * SOUSA_Mecanismos.js
 * Gerenciador de catálogo USB Modular
 * Versão: 1.0.0
 *
 * Responsável:
 * - Cadastro
 * - Consulta
 * - Atualização de status
 * - Controle de catálogo
 */


const SOUSA_MECANISMOS = {

  versao: "1.0.0",

  listar() {

    const dados = PropertiesService
      .getScriptProperties()
      .getProperty("SOUSA_MECANISMOS");

    if (!dados) {
      return [];
    }

    return JSON.parse(dados);
  },


  cadastrar(mecanismo) {

    const catalogo = this.listar();

    mecanismo.dataCadastro =
      new Date().toISOString();

    mecanismo.status =
      mecanismo.status || "TESTE";


    catalogo.push(mecanismo);


    PropertiesService
      .getScriptProperties()
      .setProperty(
        "SOUSA_MECANISMOS",
        JSON.stringify(catalogo)
      );


    return {
      sucesso: true,
      mensagem: "Mecanismo cadastrado",
      mecanismo
    };
  },


  buscarPorId(id) {

    const catalogo = this.listar();

    return catalogo.find(
      item => item.id === id
    ) || null;
  },


  atualizarStatus(id, novoStatus) {

    const catalogo = this.listar();

    const mecanismo =
      catalogo.find(
        item => item.id === id
      );


    if (!mecanismo) {

      return {
        sucesso:false,
        mensagem:"Mecanismo não encontrado"
      };

    }


    mecanismo.status = novoStatus;


    PropertiesService
      .getScriptProperties()
      .setProperty(
        "SOUSA_MECANISMOS",
        JSON.stringify(catalogo)
      );


    return {
      sucesso:true,
      mensagem:"Status atualizado",
      mecanismo
    };
  }

};