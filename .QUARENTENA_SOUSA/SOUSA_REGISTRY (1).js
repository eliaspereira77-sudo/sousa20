/**
 * SOUSA_REGISTRY.js
 * Catálogo vivo de componentes
 * USB Modular v1.1.0
 */

const SOUSA_REGISTRY = {
  componentes: [],

  registrar: function(componente) {
    this.componentes.push({
      id: componente.id,
      nome: componente.nome,
      categoria: componente.categoria,
      contrato: componente.contrato,
      versao: componente.versao,
      status: componente.status || "AGUARDANDO_VALIDACAO",
      data: new Date().toISOString()
    });

    return {
      sucesso: true,
      mensagem: "Componente registrado",
      componente
    };
  },

  listar: function() {
    return {
      total: this.componentes.length,
      componentes: this.componentes
    };
  },

  buscar: function(id) {
    return this.componentes.find(item => item.id === id);
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SOUSA_REGISTRY };
  module.exports.SOUSA_REGISTRY = SOUSA_REGISTRY;
  module.exports.default = SOUSA_REGISTRY;
}
if (typeof globalThis !== "undefined") {
  globalThis.SOUSA_REGISTRY = SOUSA_REGISTRY;
}
