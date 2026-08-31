/**
 * ==========================================================
 * SOUSA 2.0 — CONTRATO USB-API (definição formal)
 * USB Universal v1.0.1 — 2026-08-10
 * ==========================================================
 * Universalidade por CONTRATO, não por catálogo de fornecedores.
 *
 * Uma USB-API é um ponto padronizado de engate entre o SOUSA 2.0
 * e um recurso externo de IA/API.
 *
 * O Executor NÃO conhece fornecedores.
 * O Executor conhece apenas:
 *   - o contrato validado
 *   - o adaptador de protocolo registrado
 * ==========================================================
 */

var SOUSA_USB_VERSAO = "1.0.1";

/**
 * Campos obrigatórios do contrato USB-API.
 * Justificativa de cada um:
 * - id: identidade estável para registro/desconexão
 * - provedor: rótulo humano (a "cor" — pode mudar)
 * - protocolo: o ENCAIXE (não muda) — chave do adaptador
 * - capacidades: seleção por capacidade (não por marca)
 * - entrada / saida: formato antes da execução
 * - autenticacao: como obter credencial (nome no Cofre, nunca valor)
 * - estado: ciclo de vida (trava da USB)
 */
var SOUSA_USB_CAMPOS_OBRIGATORIOS = [
  "id",
  "provedor",
  "protocolo",
  "capacidades",
  "entrada",
  "saida",
  "autenticacao",
  "estado"
];

/**
 * Campos opcionais mas recomendados (robustez / operação).
 */
var SOUSA_USB_CAMPOS_OPCIONAIS = [
  "modelo",
  "endpoint",
  "prioridade",
  "timeout_ms",
  "retry",
  "limites",
  "versao",
  "metadados",
  "autorizado"
];

/**
 * Estados do ciclo de vida (trava da USB).
 */
var SOUSA_USB_ESTADOS = {
  DISPONIVEL: "DISPONIVEL",
  DETECTADA: "DETECTADA",
  VALIDANDO: "VALIDANDO",
  COMPATIVEL: "COMPATIVEL",
  AUTORIZADA: "AUTORIZADA",
  CONECTADA: "CONECTADA",
  OPERACIONAL: "OPERACIONAL",
  DESCONECTADA: "DESCONECTADA",
  REJEITADA: "REJEITADA"
};

/**
 * Valida se um objeto implementa o contrato USB-API.
 * Compatível ≠ autorizado.
 */
function SOUSA_USB_validarContrato(usb) {
  var erros = [];

  if (!usb || typeof usb !== "object") {
    return { ok: false, status: "CONTRATO_AUSENTE", erros: ["objeto USB nulo ou inválido"] };
  }

  SOUSA_USB_CAMPOS_OBRIGATORIOS.forEach(function (campo) {
    if (usb[campo] === undefined || usb[campo] === null || usb[campo] === "") {
      erros.push("campo obrigatório ausente: " + campo);
    }
  });

  if (usb.capacidades && !Array.isArray(usb.capacidades)) {
    erros.push("capacidades deve ser array");
  }

  if (usb.protocolo && typeof usb.protocolo !== "string") {
    erros.push("protocolo deve ser string");
  }

  if (usb.autenticacao && typeof usb.autenticacao === "object") {
    if (usb.autenticacao.tipo === "BEARER_COFRE" || usb.autenticacao.tipo === "QUERY_KEY_COFRE") {
      if (!usb.autenticacao.chave_cofre) {
        erros.push("autenticacao.chave_cofre obrigatória para tipo " + usb.autenticacao.tipo);
      }
    }
  } else if (usb.autenticacao !== undefined) {
    erros.push("autenticacao deve ser objeto { tipo, chave_cofre? }");
  }

  var estadosValidos = Object.keys(SOUSA_USB_ESTADOS).map(function (k) { return SOUSA_USB_ESTADOS[k]; });
  if (usb.estado && estadosValidos.indexOf(usb.estado) === -1) {
    erros.push("estado inválido: " + usb.estado);
  }

  if (erros.length) {
    return { ok: false, status: "CONTRATO_INVALIDO", erros: erros };
  }

  return {
    ok: true,
    status: "CONTRATO_VALIDO",
    compativel: true,
    autorizado: usb.autorizado === true,
    id: usb.id,
    protocolo: String(usb.protocolo).toUpperCase()
  };
}

/**
 * Normaliza USB para forma canônica do contrato.
 */
function SOUSA_USB_normalizar(usb) {
  var u = usb || {};
  return {
    id: String(u.id || u.nome || "").trim(),
    provedor: String(u.provedor || u.nome || u.id || "").trim(),
    protocolo: String(u.protocolo || "").trim().toUpperCase(),
    capacidades: Array.isArray(u.capacidades) ? u.capacidades.slice() : ["TEXTO"],
    entrada: u.entrada || { tipo: "CHAT_MESSAGES" },
    saida: u.saida || { tipo: "TEXTO" },
    autenticacao: u.autenticacao || { tipo: "NENHUMA" },
    estado: u.estado || SOUSA_USB_ESTADOS.DISPONIVEL,
    modelo: u.modelo || null,
    endpoint: u.endpoint || u.endereco || null,
    prioridade: typeof u.prioridade === "number" ? u.prioridade : 100,
    timeout_ms: u.timeout_ms || 30000,
    retry: u.retry || 0,
    limites: u.limites || {},
    versao: u.versao || "1.0",
    metadados: u.metadados || {},
    autorizado: u.autorizado === true,
    // compat legado cascata
    api_key: (u.autenticacao && u.autenticacao.chave_cofre) || u.api_key || u.chave || null,
    nome: String(u.provedor || u.nome || u.id || "").trim()
  };
}
