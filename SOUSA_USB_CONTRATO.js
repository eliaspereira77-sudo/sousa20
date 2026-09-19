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
 * Princípio Mestre: O princípio USB é NATO a todo o ecossistema SOUSA 2.0.
 */
var SOUSA_USB_PRINCIPIO_NATO = "O_PRINCIPIO_USB_E_NATO_A_TODO_O_ECOSSISTEMA_SOUSA_2_0";

var SOUSA_USB_DECLARACAO_NATA = {
  principio: "O princípio USB é nato a todo o ecossistema SOUSA 2.0.",
  regra_de_ouro: "Zero Patch no Executor. Universalidade por contrato, nunca por catálogo de fornecedores.",
  alcance: "100% dos módulos, IAs externas, ferramentas, sensores, canais e nós de infraestrutura (Windows, Android, Nuvem, Storage).",
  garantias: [
    "Intercambialidade transparente sem reescrita de código-fonte.",
    "O Executor conhece apenas o contrato validado e o protocolo registrado.",
    "Credenciais isoladas no Cofre; nunca expostas no código ou na transação.",
    "Substituição a quente (hot-swap) e tolerância automática a falhas (fallback)."
  ],
  compatibilidade_windows_universal: {
    principio: "O princípio da USB Plug and Play torna o SOUSA 2.0 100% compatível com todas as versões do Windows.",
    versoes_suportadas: [
      "Windows 11 (21H2, 22H2, 23H2, 24H2+ / x64 e ARM64)",
      "Windows 10 (todas as builds 1507 a 22H2 / x86 e x64 / Home, Pro, Enterprise, LTSC)",
      "Windows 8.1 & Windows 8 (x86 e x64)",
      "Windows 7 SP1 (x86 e x64 / com fallback adaptativo de shell)",
      "Windows Server (2012, 2012 R2, 2016, 2019, 2022, 2025)"
    ],
    mecanismos_plug_and_play: [
      "Detecção automática de versão, arquitetura (x86/x64/ARM64) e shell disponível (PowerShell 7 Core, PowerShell 5.1/2.0 ou CMD.exe)",
      "Zero compilação ou instalação de drivers adicionais de terceiros",
      "Normalização de encoding transparente (UTF-8 chcp 65001 com fallback gracioso para ANSI/OEM)",
      "Fallback resiliente: caso recursos avançados de terminal moderno ou GPU não existam no SO legado, o SOUSA aciona adaptadores universais sem falhas ou paradas"
    ]
  }
};

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

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SOUSA_USB_VERSAO: SOUSA_USB_VERSAO,
    SOUSA_USB_PRINCIPIO_NATO: SOUSA_USB_PRINCIPIO_NATO,
    SOUSA_USB_DECLARACAO_NATA: SOUSA_USB_DECLARACAO_NATA,
    SOUSA_USB_CAMPOS_OBRIGATORIOS: SOUSA_USB_CAMPOS_OBRIGATORIOS,
    SOUSA_USB_CAMPOS_OPCIONAIS: SOUSA_USB_CAMPOS_OPCIONAIS,
    SOUSA_USB_ESTADOS: SOUSA_USB_ESTADOS,
    SOUSA_USB_validarContrato: SOUSA_USB_validarContrato,
    SOUSA_USB_normalizar: SOUSA_USB_normalizar
  };
}
