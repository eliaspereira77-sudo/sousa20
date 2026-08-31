/**
 * ==========================================================
 * SOUSA 2.0 — USB REGISTRY (Plug and Play)
 * ==========================================================
 * Registro dinâmico de USBs. Conectar / desconectar / ativar
 * sem alterar o núcleo do Executor.
 *
 * Analogia: quadro de engates rápidos.
 * ==========================================================
 */

var SOUSA_USB_REGISTRY_STORE = SOUSA_USB_REGISTRY_STORE || {};

/**
 * Conecta (registra) uma USB-API após validar o contrato.
 * Não executa — apenas engata no quadro.
 */
function SOUSA_USB_conectar(usbBruta) {
  var normalizada = SOUSA_USB_normalizar(usbBruta);
  normalizada.estado = SOUSA_USB_ESTADOS.VALIDANDO;

  var validacao = SOUSA_USB_validarContrato(normalizada);
  if (!validacao.ok) {
    normalizada.estado = SOUSA_USB_ESTADOS.REJEITADA;
    return {
      ok: false,
      status: "REJEITADO",
      motivo: "CONTRATO_INVALIDO",
      erros: validacao.erros,
      usb: normalizada
    };
  }

  normalizada.estado = SOUSA_USB_ESTADOS.COMPATIVEL;

  // Compatível ≠ autorizado
  if (normalizada.autorizado !== true) {
    // Ainda registra como disponível, mas não OPERACIONAL
    normalizada.estado = SOUSA_USB_ESTADOS.COMPATIVEL;
  } else {
    normalizada.estado = SOUSA_USB_ESTADOS.AUTORIZADA;
  }

  // Verificar se existe adaptador para o protocolo
  if (typeof SOUSA_USB_ADAPTER_obter !== "function" || !SOUSA_USB_ADAPTER_obter(normalizada.protocolo)) {
    return {
      ok: false,
      status: "REJEITADO",
      motivo: "PROTOCOLO_SEM_ADAPTADOR",
      protocolo: normalizada.protocolo,
      mensagem: "Contrato válido, mas nenhum adaptador registrado para o protocolo. Registre o adaptador antes de conectar a USB.",
      usb: normalizada
    };
  }

  if (normalizada.autorizado === true) {
    normalizada.estado = SOUSA_USB_ESTADOS.OPERACIONAL;
  }

  SOUSA_USB_REGISTRY_STORE[normalizada.id] = normalizada;

  return {
    ok: true,
    status: "CONECTADA",
    estado: normalizada.estado,
    id: normalizada.id,
    protocolo: normalizada.protocolo,
    operacional: normalizada.estado === SOUSA_USB_ESTADOS.OPERACIONAL
  };
}

/**
 * Desconecta USB pelo id. Operação deliberada.
 */
function SOUSA_USB_desconectar(id) {
  var key = String(id || "").trim();
  if (!SOUSA_USB_REGISTRY_STORE[key]) {
    return { ok: false, status: "NAO_ENCONTRADA", id: key };
  }
  var copia = SOUSA_USB_REGISTRY_STORE[key];
  copia.estado = SOUSA_USB_ESTADOS.DESCONECTADA;
  delete SOUSA_USB_REGISTRY_STORE[key];
  return { ok: true, status: "DESCONECTADA", id: key, provedor: copia.provedor };
}

/**
 * Lista USBs registradas (opcional filtro por capacidade / estado).
 */
function SOUSA_USB_listar(filtro) {
  var f = filtro || {};
  var lista = [];
  Object.keys(SOUSA_USB_REGISTRY_STORE).forEach(function (id) {
    var u = SOUSA_USB_REGISTRY_STORE[id];
    if (f.estado && u.estado !== f.estado) return;
    if (f.capacidade) {
      if (!u.capacidades || u.capacidades.indexOf(f.capacidade) === -1) return;
    }
    if (f.apenas_operacional && u.estado !== SOUSA_USB_ESTADOS.OPERACIONAL) return;
    lista.push(u);
  });
  lista.sort(function (a, b) {
    return (a.prioridade || 100) - (b.prioridade || 100);
  });
  return lista;
}

/**
 * Obtém USB por id.
 */
function SOUSA_USB_obter(id) {
  return SOUSA_USB_REGISTRY_STORE[String(id || "").trim()] || null;
}

/**
 * Seleciona a melhor USB operacional para uma capacidade.
 * Cascata dinâmica a partir do registry — não lista fixa no Core.
 */
function SOUSA_USB_selecionarPorCapacidade(capacidade) {
  var cap = String(capacidade || "TEXTO").toUpperCase();
  var candidatas = SOUSA_USB_listar({ capacidade: cap, apenas_operacional: true });

  // também aceita capacidades em minúsculas no contrato
  if (candidatas.length === 0) {
    candidatas = SOUSA_USB_listar({ apenas_operacional: true }).filter(function (u) {
      return (u.capacidades || []).some(function (c) {
        return String(c).toUpperCase() === cap;
      });
    });
  }

  if (candidatas.length === 0) {
    return {
      ok: false,
      status: "SEM_RECURSO_DISPONIVEL",
      capacidade_solicitada: cap,
      recurso_escolhido: null
    };
  }

  var escolhida = candidatas[0];
  return {
    ok: true,
    status: "PRONTO",
    capacidade_solicitada: cap,
    recurso_escolhido: escolhida.id,
    provedor: escolhida.provedor,
    protocolo: escolhida.protocolo,
    modelo: escolhida.modelo,
    prioridade: escolhida.prioridade,
    usb: escolhida
  };
}

/**
 * Semeia o registry a partir da cascata legada (compatibilidade).
 * Não é o mecanismo principal de Plug and Play — é ponte.
 */
function SOUSA_USB_semearCascataLegada() {
  if (typeof SOUSA_APIS_CASCATA === "undefined" || !Array.isArray(SOUSA_APIS_CASCATA)) {
    return { ok: false, status: "CASCATA_AUSENTE", conectadas: 0 };
  }
  var conectadas = 0;
  var rejeitadas = [];
  SOUSA_APIS_CASCATA.forEach(function (api) {
    if (String(api.status || "").toUpperCase() !== "ATIVO") return;
    var protocolo = String(api.protocolo || "").toUpperCase();
    // Auth type by PROTOCOL (encaixe), never by provider name (cor)
    var tipoAuth = "NENHUMA";
    if (api.api_key) {
      tipoAuth = (protocolo === "GEMINI_GENERATE_CONTENT")
        ? "QUERY_KEY_COFRE"
        : "BEARER_COFRE";
    }
    var usb = {
      id: api.nome,
      provedor: api.nome,
      protocolo: protocolo,
      capacidades: Array.isArray(api.capacidades) ? api.capacidades : ["TEXTO"],
      entrada: { tipo: "CHAT_MESSAGES" },
      saida: { tipo: "TEXTO" },
      autenticacao: api.api_key
        ? { tipo: tipoAuth, chave_cofre: api.api_key }
        : { tipo: "NENHUMA" },
      estado: SOUSA_USB_ESTADOS.DISPONIVEL,
      modelo: api.modelo,
      endpoint: api.endereco || api.endpoint || null,
      prioridade: api.prioridade || 100,
      autorizado: true,
      metadados: api.metadados || {}
    };
    var r = SOUSA_USB_conectar(usb);
    if (r.ok) conectadas++;
    else rejeitadas.push({ nome: api.nome, motivo: r.motivo || r.status });
  });
  return { ok: true, status: "SEMEADURA_OK", conectadas: conectadas, rejeitadas: rejeitadas };
}

/**
 * ==========================================================
 * NODE.JS BRIDGE � EXPORTS
 * Compatibilidade sem alterar o n�cleo GAS/global
 * ==========================================================
 */
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SOUSA_USB_conectar,
    SOUSA_USB_desconectar,
    SOUSA_USB_listar,
    SOUSA_USB_obter,
    SOUSA_USB_selecionarPorCapacidade,
    SOUSA_USB_semearCascataLegada
  };
}
