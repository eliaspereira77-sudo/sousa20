/**
 * ==========================================================
 * SOUSA 2.0 — USB STT (Speech-to-Text)
 * USB Universal v1.0.4 — 2026-08-11
 * ==========================================================
 * Encaixe Plug and Play: áudio → texto.
 * Protocolos:
 *   STT_HTTP_JSON  — micro-serviço local (faster-whisper etc.)
 *   STT_ECO        — Lab sem backend (eco controlado)
 *
 * NÃO altera o Executor. Só registra adaptadores + USB.
 * ==========================================================
 */

function SOUSA_USB_ADAPTER_stt_eco() {
  return {
    protocolo: "STT_ECO",
    versao: "1.0.0",
    descricao: "STT de teste — confirma encaixe sem transcrever de verdade",
    execute: function (usb, contexto) {
      var hint = (contexto && (contexto.texto || contexto.prompt || contexto.audio_hint)) || "";
      return {
        ok: true,
        status: "EXECUCAO_CONCLUIDA",
        provedor: usb.provedor || "STT Eco",
        protocolo: "STT_ECO",
        capacidade: "STT",
        simulacao: true,
        texto: hint ? ("[STT-ECO] " + hint) : "[STT-ECO] (sem áudio — encaixe OK)",
        mensagem: "Encaixe STT ativo. No desktop: suba local_services/stt e use protocolo STT_HTTP_JSON."
      };
    }
  };
}

function SOUSA_USB_ADAPTER_stt_http_json() {
  return {
    protocolo: "STT_HTTP_JSON",
    versao: "1.0.0",
    descricao: "STT via micro-serviço local (faster-whisper / Vosk)",
    execute: function (usb, contexto) {
      if (!usb.endpoint) {
        return { ok: false, status: "ENDPOINT_AUSENTE", capacidade: "STT" };
      }
      var payload = {
        language: (usb.metadados && usb.metadados.idioma) || "pt",
        model: (usb.metadados && usb.metadados.modelo) || "base"
      };
      // Áudio: base64 ou URL — conforme o serviço local
      if (contexto && contexto.audio_base64) payload.audio_base64 = contexto.audio_base64;
      if (contexto && contexto.audio_url) payload.audio_url = contexto.audio_url;
      if (contexto && contexto.texto) payload.hint = contexto.texto;

      if (!payload.audio_base64 && !payload.audio_url) {
        return {
          ok: false,
          status: "AUDIO_AUSENTE",
          capacidade: "STT",
          mensagem: "Informe contexto.audio_base64 ou contexto.audio_url"
        };
      }

      try {
        var resp = UrlFetchApp.fetch(String(usb.endpoint).replace(/\/+$/, "") + "/stt", {
          method: "post",
          contentType: "application/json",
          payload: JSON.stringify(payload),
          muteHttpExceptions: true,
          headers: (usb.metadados && usb.metadados.headers) || {}
        });
        var codigo = resp.getResponseCode();
        var body = resp.getContentText();
        var parsed = null;
        try { parsed = JSON.parse(body); } catch (e) {}
        if (codigo < 200 || codigo >= 300) {
          return {
            ok: false,
            status: "ERRO_STT",
            capacidade: "STT",
            codigo_http: codigo,
            detalhe: String(body).substring(0, 400)
          };
        }
        var texto = parsed && (parsed.text || parsed.texto || parsed.transcription);
        if (texto == null) {
          return { ok: false, status: "RESPOSTA_INVALIDA", capacidade: "STT", codigo_http: codigo, bruto: String(body).substring(0, 300) };
        }
        return {
          ok: true,
          status: "EXECUCAO_CONCLUIDA",
          provedor: usb.provedor,
          protocolo: "STT_HTTP_JSON",
          capacidade: "STT",
          codigo_http: codigo,
          texto: String(texto),
          idioma: parsed.language || payload.language,
          modelo: parsed.model || payload.model
        };
      } catch (erro) {
        return {
          ok: false,
          status: "ERRO_REDE_STT",
          capacidade: "STT",
          mensagem: erro.message || String(erro),
          dica: "Suba o micro-serviço: python local_services/stt/server.py"
        };
      }
    }
  };
}

function SOUSA_STT_bootstrapAdaptadores() {
  var r = [];
  if (typeof SOUSA_USB_ADAPTER_registrar === "function") {
    r.push(SOUSA_USB_ADAPTER_registrar(SOUSA_USB_ADAPTER_stt_eco()));
    r.push(SOUSA_USB_ADAPTER_registrar(SOUSA_USB_ADAPTER_stt_http_json()));
  }
  return { ok: true, resultados: r };
}

/**
 * Conecta USB STT (eco no Lab; HTTP no desktop com serviço local).
 */
function SOUSA_STT_conectar(opcoes) {
  SOUSA_STT_bootstrapAdaptadores();
  var opts = opcoes || {};
  var temEndpoint = !!(opts.endpoint);
  var usb = {
    id: opts.id || "SOUSA_STT",
    provedor: opts.provedor || (temEndpoint ? "Whisper Local" : "STT Eco"),
    protocolo: opts.protocolo || (temEndpoint ? "STT_HTTP_JSON" : "STT_ECO"),
    capacidades: ["STT", "AUDIO_TEXTO"],
    entrada: { tipo: "AUDIO" },
    saida: { tipo: "TEXTO" },
    autenticacao: { tipo: "NENHUMA" },
    endpoint: opts.endpoint || null,
    prioridade: opts.prioridade || 1,
    autorizado: true,
    metadados: {
      idioma: opts.idioma || "pt",
      modelo: opts.modelo || "base",
      headers: opts.headers || null,
      stack_recomendado: "faster-whisper"
    }
  };
  if (typeof SOUSA_USB_conectarEPersistir === "function") {
    return SOUSA_USB_conectarEPersistir(usb);
  }
  return SOUSA_USB_conectar(usb);
}

/**
 * Transcreve áudio via USB STT engatada.
 */
function SOUSA_STT_transcrever(contexto, opcoes) {
  var opts = opcoes || {};
  SOUSA_STT_bootstrapAdaptadores();
  var id = opts.usb_id || "SOUSA_STT";
  var usb = typeof SOUSA_USB_obter === "function" ? SOUSA_USB_obter(id) : null;
  if (!usb) {
    var lista = typeof SOUSA_USB_listar === "function"
      ? SOUSA_USB_listar({ capacidade: "STT", apenas_operacional: true })
      : [];
    usb = lista[0] || null;
  }
  if (!usb) {
    return { ok: false, status: "STT_NAO_ENGATADO", mensagem: "Use SOUSA_STT_conectar() primeiro." };
  }
  return SOUSA_API_EXECUTOR_UNIVERSAL({ recurso_escolhido: usb.id, usb: usb }, contexto || {});
}
