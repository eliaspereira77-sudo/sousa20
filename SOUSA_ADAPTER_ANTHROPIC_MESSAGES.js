/**
 * ==========================================================
 * SOUSA 2.0 — ADAPTADOR ANTHROPIC MESSAGES (Claude)
 * ==========================================================
 * Protocolo: ANTHROPIC_MESSAGES
 * Endpoint:  https://api.anthropic.com/v1/messages
 *
 * Princípios:
 * - Chave apenas no Cofre (ANTHROPIC_API_KEY)
 * - Não altera o núcleo / Executor Universal
 * - Registrável via SOUSA_USB_ADAPTER_registrar
 * ==========================================================
 */

/**
 * Executa chamada Claude via Messages API.
 * @param {Object} usb - Contrato USB normalizado
 * @param {Object} contexto - { prompt|texto|intencao, system?, max_tokens? }
 * @returns {Object} resultado padronizado SOUSA
 */
function SOUSA_ADAPTER_ANTHROPIC_MESSAGES_execute(usb, contexto) {
  var chave = null;
  var chaveNome = null;

  if (usb && usb.autenticacao && usb.autenticacao.chave_cofre) {
    chaveNome = usb.autenticacao.chave_cofre;
    chave = obterChaveAPI(chaveNome);
  } else if (usb && usb.api_key) {
    chaveNome = usb.api_key;
    chave = obterChaveAPI(usb.api_key);
  }

  if (!chave) {
    return {
      ok: false,
      status: "CREDENCIAL_AUSENTE",
      provedor: (usb && (usb.provedor || usb.id)) || "CLAUDE",
      protocolo: "ANTHROPIC_MESSAGES",
      credencial: chaveNome || "ANTHROPIC_API_KEY",
      mensagem: "Configure ANTHROPIC_API_KEY no Cofre (PropertiesService)."
    };
  }

  var prompt =
    (contexto && (contexto.prompt || contexto.texto || contexto.intencao)) || "";

  if (!prompt) {
    return {
      ok: false,
      status: "CONTEXTO_AUSENTE",
      provedor: (usb && (usb.provedor || usb.id)) || "CLAUDE",
      protocolo: "ANTHROPIC_MESSAGES"
    };
  }

  var modelo = (usb && usb.modelo) || "claude-sonnet-4-20250514";
  var endpoint =
    (usb && usb.endpoint) || "https://api.anthropic.com/v1/messages";
  var maxTokens = (contexto && contexto.max_tokens) || 4096;

  var payload = {
    model: modelo,
    max_tokens: maxTokens,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  };

  if (contexto && contexto.system) {
    payload.system = contexto.system;
  }

  // Suporte opcional a histórico de mensagens
  if (contexto && contexto.messages && Array.isArray(contexto.messages)) {
    payload.messages = contexto.messages;
  }

  try {
    var resposta = UrlFetchApp.fetch(endpoint, {
      method: "post",
      contentType: "application/json",
      headers: {
        "x-api-key": chave,
        "anthropic-version": "2023-06-01"
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    var codigo = resposta.getResponseCode();
    var corpo = resposta.getContentText();
    var json = null;
    var texto = "";

    try {
      json = JSON.parse(corpo);
      if (json && json.content && json.content.length) {
        for (var i = 0; i < json.content.length; i++) {
          if (json.content[i].type === "text") {
            texto += (json.content[i].text || "");
          }
        }
      }
    } catch (parseErr) {
      texto = corpo;
    }

    return {
      ok: codigo >= 200 && codigo < 300,
      status:
        codigo >= 200 && codigo < 300
          ? "EXECUCAO_CONCLUIDA"
          : "ERRO_PROVEDOR",
      provedor: (usb && (usb.provedor || usb.id)) || "CLAUDE",
      modelo: modelo,
      protocolo: "ANTHROPIC_MESSAGES",
      codigo_http: codigo,
      resposta: texto || corpo,
      bruto: json || corpo,
      usage: json && json.usage ? json.usage : null,
      stop_reason: json && json.stop_reason ? json.stop_reason : null
    };
  } catch (erro) {
    return {
      ok: false,
      status: "ERRO_ADAPTADOR",
      provedor: (usb && (usb.provedor || usb.id)) || "CLAUDE",
      protocolo: "ANTHROPIC_MESSAGES",
      mensagem: erro.message || String(erro)
    };
  }
}

/**
 * Registro automático do adaptador (se o registry existir).
 * Chamado no bootstrap / inicialização USB.
 */
function SOUSA_ADAPTER_ANTHROPIC_MESSAGES_registrar() {
  if (typeof SOUSA_USB_ADAPTER_registrar === "function") {
    SOUSA_USB_ADAPTER_registrar("ANTHROPIC_MESSAGES", {
      execute: SOUSA_ADAPTER_ANTHROPIC_MESSAGES_execute,
      nome: "Claude / Anthropic Messages",
      versao: "1.0.0"
    });
    return { ok: true, status: "ADAPTADOR_REGISTRADO", protocolo: "ANTHROPIC_MESSAGES" };
  }
  return {
    ok: false,
    status: "REGISTRY_AUSENTE",
    mensagem: "SOUSA_USB_ADAPTER_registrar não disponível. Adaptador ainda utilizável via USB legado."
  };
}

/**
 * Teste rápido (requer ANTHROPIC_API_KEY no Cofre).
 */
function testarSOUSA_ADAPTER_CLAUDE() {
  var r = SOUSA_ADAPTER_ANTHROPIC_MESSAGES_execute(
    {
      id: "CLAUDE",
      provedor: "CLAUDE",
      modelo: "claude-sonnet-4-20250514",
      endpoint: "https://api.anthropic.com/v1/messages",
      protocolo: "ANTHROPIC_MESSAGES",
      api_key: "ANTHROPIC_API_KEY",
      autenticacao: { tipo: "X_API_KEY_COFRE", chave_cofre: "ANTHROPIC_API_KEY" }
    },
    { prompt: "Responda apenas: OK Claude integrado no SOUSA 2.0" }
  );
  Logger.log(JSON.stringify(r, null, 2));
  return r;
}
