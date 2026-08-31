'use strict';

/**
 * SOUSA 2.0 — USB AUTOMATION BRIDGE
 * v1.1.0
 *
 * Fluxo:
 * PNP → USB REGISTRY → AUTOMATION
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

function disparar(evento = {}) {

  const automacao = {
    sistema: "SOUSA 2.0",
    origem: "USB_MODULAR",
    evento: evento.tipo || "EVENTO_NAO_INFORMADO",
    acao: "PROCESSAMENTO_AUTOMATICO",
    dataHora: new Date().toISOString()
  };

  return {
    sucesso: true,
    status: "AUTOMACAO_DISPARADA",
    dados: automacao
  };
}

function conectar(mecanismo) {

  const fn = resolver("SOUSA_USB_conectar");

  if (!fn) {
    return {
      sucesso: false,
      status: "USB_REGISTRY_INDISPONIVEL"
    };
  }

  return fn(mecanismo);
}

function listar() {

  const fn = resolver("SOUSA_USB_listar");

  if (!fn) {
    return {
      sucesso: false,
      status: "USB_REGISTRY_INDISPONIVEL",
      quantidade: 0,
      usbs: []
    };
  }

  const usbs = fn();

  return {
    sucesso: true,
    status: "AUTOMATION_BRIDGE_LIST_OK",
    quantidade: usbs.length,
    usbs
  };
}

function status() {

  const lista = listar();

  return {
    sistema: "SOUSA 2.0",
    modulo: "USB_AUTOMATION_BRIDGE",
    status: lista.sucesso ? "OPERACIONAL" : "ERRO",
    usbRegistradas: lista.quantidade || 0
  };
}

const SOUSA_USB_AUTOMATION_BRIDGE = {
  disparar,
  conectar,
  listar,
  status
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = SOUSA_USB_AUTOMATION_BRIDGE;
}
