'use strict';

/**
 * SOUSA 2.0 — PLUG AND PLAY
 * ÍMÃ PNP v1.2.0
 *
 * CAPABILITY → ADAPTER → PNP → USB REGISTRY
 *
 * Compatível com Node.js e Google Apps Script.
 */

let USB = {};

if (typeof module !== "undefined" && module.exports) {
  try {
    USB = require("./SOUSA_USB_REGISTRY.js");
  } catch (e) {
    USB = {};
  }
}

function resolver(nome) {

  if (USB && typeof USB[nome] === "function") {
    return USB[nome];
  }

  if (
    typeof globalThis !== "undefined" &&
    typeof globalThis[nome] === "function"
  ) {
    return globalThis[nome];
  }

  return null;
}

const SOUSA_PLUG_AND_PLAY = {

  conectar: function(mecanismo) {

    if (!mecanismo) {
      return {
        sucesso: false,
        status: "MECANISMO_AUSENTE"
      };
    }

    const conectar = resolver("SOUSA_USB_conectar");

    if (!conectar) {
      return {
        sucesso: false,
        status: "USB_REGISTRY_INDISPONIVEL"
      };
    }

    const resultado = conectar(mecanismo);

    return {
      sucesso: resultado.ok === true,
      status: resultado.status,
      etapa: "USB_REGISTRY",
      id: resultado.id || null,
      protocolo: resultado.protocolo || null,
      estado: resultado.estado || null,
      operacional: resultado.operacional === true,
      detalhes: resultado
    };
  },

  ativar: function(id) {

    if (!id) {
      return {
        sucesso: false,
        status: "ID_AUSENTE"
      };
    }

    const obter = resolver("SOUSA_USB_obter");

    if (!obter) {
      return {
        sucesso: false,
        status: "USB_REGISTRY_INDISPONIVEL"
      };
    }

    const usb = obter(id);

    if (!usb) {
      return {
        sucesso: false,
        status: "USB_NAO_ENCONTRADA",
        id: id
      };
    }

    return {
      sucesso: true,
      id: id,
      status: "ATIVO",
      operacional: usb.estado === "OPERACIONAL",
      usb: usb
    };
  },

  listar: function() {

    const listar = resolver("SOUSA_USB_listar");

    if (!listar) {
      return {
        sucesso: false,
        status: "USB_REGISTRY_INDISPONIVEL",
        quantidade: 0,
        usbs: []
      };
    }

    const usbs = listar();

    return {
      sucesso: true,
      status: "PNP_LIST_OK",
      quantidade: usbs.length,
      usbs: usbs
    };
  },

  selecionar: function(capacidade) {

    const selecionar =
      resolver("SOUSA_USB_selecionarPorCapacidade");

    if (!selecionar) {
      return {
        sucesso: false,
        status: "USB_REGISTRY_INDISPONIVEL"
      };
    }

    return selecionar(capacidade);
  },

  status: function() {

    const lista = this.listar();

    return {
      sistema: "SOUSA 2.0",
      modulo: "PLUG_AND_PLAY",
      status: lista.sucesso ? "OPERACIONAL" : "ERRO",
      usbRegistradas: lista.quantidade || 0
    };
  }

};

if (typeof module !== "undefined" && module.exports) {
  module.exports = SOUSA_PLUG_AND_PLAY;
}
