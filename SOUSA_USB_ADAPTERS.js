/**
 * ==========================================================
 * SOUSA 2.0 — ADAPTADORES DE PROTOCOLO (registro dinâmico)
 * ==========================================================
 * O Executor NÃO tem switch de fornecedor.
 * O Executor resolve: protocolo → adaptador registrado → execute().
 *
 * Novo protocolo = registrar novo adaptador.
 * Sem alterar o núcleo do Executor.
 * ==========================================================
 */

var SOUSA_USB_ADAPTER_STORE = SOUSA_USB_ADAPTER_STORE || {};

/**
 * Registra um adaptador de protocolo.
 * adapter = { protocolo, execute: function(usb, contexto) -> resultado }
 */
function SOUSA_USB_ADAPTER_registrar(adapter) {
  if (!adapter || !adapter.protocolo || typeof adapter.execute !== "function") {
    return {
      ok: false,
      status: "ADAPTER_INVALIDO",
      mensagem: "Adaptador requer { protocolo: string, execute: function }"
    };
  }
  var key = String(adapter.protocolo).trim().toUpperCase();
  SOUSA_USB_ADAPTER_STORE[key] = {
    protocolo: key,
    execute: adapter.execute,
    versao: adapter.versao || "1.0",
    descricao: adapter.descricao || ""
  };
  return { ok: true, status: "ADAPTER_REGISTRADO", protocolo: key };
}

function SOUSA_USB_ADAPTER_obter(protocolo) {
  return SOUSA_USB_ADAPTER_STORE[String(protocolo || "").trim().toUpperCase()] || null;
}

function SOUSA_USB_ADAPTER_listar() {
  return Object.keys(SOUSA_USB_ADAPTER_STORE).map(function (k) {
    var a = SOUSA_USB_ADAPTER_STORE[k];
    return { protocolo: a.protocolo, versao: a.versao, descricao: a.descricao };
  });
}

function SOUSA_USB_ADAPTER_remover(protocolo) {
  var key = String(protocolo || "").trim().toUpperCase();
  if (!SOUSA_USB_ADAPTER_STORE[key]) {
    return { ok: false, status: "NAO_ENCONTRADO", protocolo: key };
  }
  delete SOUSA_USB_ADAPTER_STORE[key];
  return { ok: true, status: "REMOVIDO", protocolo: key };
}

/* ----------------------------------------------------------
 * Adaptadores built-in (protocolos, NÃO fornecedores)
 * ---------------------------------------------------------- */

function SOUSA_USB_ADAPTER_builtin_gemini() {
  return {
    protocolo: "GEMINI_GENERATE_CONTENT",
    versao: "1.0",
    descricao: "Google Generative Language generateContent",
    execute: function (usb, contexto) {
      return SOUSA_USB_TRANSPORTE_gemini(usb, contexto);
    }
  };
}

function SOUSA_USB_ADAPTER_builtin_openai() {
  return {
    protocolo: "OPENAI_CHAT_COMPLETIONS",
    versao: "1.0",
    descricao: "OpenAI-compatible chat/completions",
    execute: function (usb, contexto) {
      return SOUSA_USB_TRANSPORTE_openai(usb, contexto);
    }
  };
}

function SOUSA_USB_ADAPTER_builtin_ollama() {
  return {
    protocolo: "OLLAMA_CHAT",
    versao: "1.0",
    descricao: "Ollama local /api/chat",
    execute: function (usb, contexto) {
      return SOUSA_USB_TRANSPORTE_ollama(usb, contexto);
    }
  };
}

/**
 * Protocolo de teste — NÃO chama rede.
 * Serve para provar Plug and Play com PROVEDOR_TESTE_X.
 */
function SOUSA_USB_ADAPTER_builtin_teste_eco() {
  return {
    protocolo: "TESTE_ECO",
    versao: "1.0",
    descricao: "Adaptador fictício para validação de universalidade",
    execute: function (usb, contexto) {
      var texto = (contexto && (contexto.texto || contexto.prompt)) || "";
      return {
        ok: true,
        status: "EXECUCAO_CONCLUIDA",
        provedor: usb.provedor,
        modelo: usb.modelo || "eco-1",
        protocolo: "TESTE_ECO",
        texto: "[ECO:" + usb.id + "] " + texto,
        simulacao: true
      };
    }
  };
}

/**
 * Instala adaptadores built-in. Idempotente.
 */
function SOUSA_USB_ADAPTER_bootstrap() {
  var r = [];
  r.push(SOUSA_USB_ADAPTER_registrar(SOUSA_USB_ADAPTER_builtin_gemini()));
  r.push(SOUSA_USB_ADAPTER_registrar(SOUSA_USB_ADAPTER_builtin_openai()));
  r.push(SOUSA_USB_ADAPTER_registrar(SOUSA_USB_ADAPTER_builtin_ollama()));
  r.push(SOUSA_USB_ADAPTER_registrar(SOUSA_USB_ADAPTER_builtin_teste_eco()));
  return { ok: true, status: "BOOTSTRAP_OK", adaptadores: SOUSA_USB_ADAPTER_listar(), resultados: r };
}
