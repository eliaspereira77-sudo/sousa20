/**
 * ==========================================================
 * SOUSA 2.0 — USB TTS PIPER (Text-to-Speech 0800)
 * USB Universal v1.0.4 — 2026-08-11
 * ==========================================================
 * Encaixe prioritário de TTS local (Piper no desktop).
 * Protocolos:
 *   TTS_PIPER_HTTP — micro-serviço local Piper
 *   TTS_ECO        — já existe em DNA/VOZ; reusa se disponível
 *
 * Completa o caminho 0800: texto → áudio sem GPU.
 * ==========================================================
 */

function SOUSA_USB_ADAPTER_tts_piper_http() {
  return {
    protocolo: "TTS_PIPER_HTTP",
    versao: "1.0.0",
    descricao: "TTS Piper via micro-serviço local (CPU, PT-BR)",
    execute: function (usb, contexto) {
      var texto = (contexto && (contexto.texto || contexto.prompt)) || "";
      if (!texto) {
        return { ok: false, status: "TEXTO_AUSENTE", capacidade: "VOZ" };
      }
      if (!usb.endpoint) {
        return { ok: false, status: "ENDPOINT_AUSENTE", capacidade: "VOZ" };
      }

      var payload = {
        text: texto,
        voice: (usb.metadados && usb.metadados.voice) || "pt_BR-faber-medium",
        speaker_id: (usb.metadados && usb.metadados.speaker_id) || null
      };

      try {
        var resp = UrlFetchApp.fetch(String(usb.endpoint).replace(/\/+$/, "") + "/tts", {
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
            status: "ERRO_TTS",
            capacidade: "VOZ",
            codigo_http: codigo,
            detalhe: String(body).substring(0, 400)
          };
        }
        return {
          ok: true,
          status: "EXECUCAO_CONCLUIDA",
          provedor: usb.provedor || "Piper Local",
          protocolo: "TTS_PIPER_HTTP",
          capacidade: "VOZ",
          codigo_http: codigo,
          texto: texto,
          audio_base64: parsed && parsed.audio_base64 ? parsed.audio_base64 : null,
          audio_url: parsed && (parsed.audio_url || parsed.url) ? (parsed.audio_url || parsed.url) : null,
          voice: payload.voice,
          formato: (parsed && parsed.format) || "wav"
        };
      } catch (erro) {
        return {
          ok: false,
          status: "ERRO_REDE_TTS",
          capacidade: "VOZ",
          mensagem: erro.message || String(erro),
          dica: "Suba o micro-serviço: python local_services/tts/server.py"
        };
      }
    }
  };
}

function SOUSA_TTS_PIPER_bootstrapAdaptadores() {
  var r = [];
  if (typeof SOUSA_USB_ADAPTER_registrar === "function") {
    r.push(SOUSA_USB_ADAPTER_registrar(SOUSA_USB_ADAPTER_tts_piper_http()));
    // TTS_ECO pode já estar em DNA/VOZ
    if (typeof SOUSA_USB_ADAPTER_tts_eco === "function" && !SOUSA_USB_ADAPTER_obter("TTS_ECO")) {
      r.push(SOUSA_USB_ADAPTER_registrar(SOUSA_USB_ADAPTER_tts_eco()));
    }
  }
  return { ok: true, resultados: r };
}

function SOUSA_TTS_PIPER_conectar(opcoes) {
  SOUSA_TTS_PIPER_bootstrapAdaptadores();
  var opts = opcoes || {};
  var temEndpoint = !!(opts.endpoint);
  var usb = {
    id: opts.id || "SOUSA_TTS_PIPER",
    provedor: opts.provedor || (temEndpoint ? "Piper Local" : "TTS Eco"),
    protocolo: opts.protocolo || (temEndpoint ? "TTS_PIPER_HTTP" : "TTS_ECO"),
    capacidades: ["VOZ", "TTS", "TEXTO_AUDIO"],
    entrada: { tipo: "TEXTO" },
    saida: { tipo: "AUDIO" },
    autenticacao: { tipo: "NENHUMA" },
    endpoint: opts.endpoint || null,
    prioridade: opts.prioridade || 1,
    autorizado: true,
    metadados: {
      voice: opts.voice || "pt_BR-faber-medium",
      stack_recomendado: "piper",
      headers: opts.headers || null
    }
  };
  // Se sem endpoint e TTS_ECO não registrado, força HTTP só com endpoint
  if (!temEndpoint && typeof SOUSA_USB_ADAPTER_obter === "function" && !SOUSA_USB_ADAPTER_obter("TTS_ECO")) {
    // registra eco mínimo inline
    SOUSA_USB_ADAPTER_registrar({
      protocolo: "TTS_ECO",
      versao: "1.0.0",
      execute: function (u, c) {
        return {
          ok: true,
          status: "EXECUCAO_CONCLUIDA",
          provedor: u.provedor,
          protocolo: "TTS_ECO",
          capacidade: "VOZ",
          simulacao: true,
          texto: (c && c.texto) || "",
          mensagem: "TTS eco — no desktop use Piper em :8766"
        };
      }
    });
    usb.protocolo = "TTS_ECO";
  }
  if (typeof SOUSA_USB_conectarEPersistir === "function") {
    return SOUSA_USB_conectarEPersistir(usb);
  }
  return SOUSA_USB_conectar(usb);
}

function SOUSA_TTS_PIPER_falar(texto, opcoes) {
  var opts = opcoes || {};
  SOUSA_TTS_PIPER_bootstrapAdaptadores();
  var id = opts.usb_id || "SOUSA_TTS_PIPER";
  var usb = typeof SOUSA_USB_obter === "function" ? SOUSA_USB_obter(id) : null;
  if (!usb) {
    var lista = typeof SOUSA_USB_listar === "function"
      ? SOUSA_USB_listar({ capacidade: "VOZ", apenas_operacional: true })
      : [];
    usb = lista[0] || null;
  }
  if (!usb) {
    return { ok: false, status: "TTS_NAO_ENGATADO", mensagem: "Use SOUSA_TTS_PIPER_conectar() primeiro." };
  }
  return SOUSA_API_EXECUTOR_UNIVERSAL(
    { recurso_escolhido: usb.id, usb: usb },
    { texto: texto }
  );
}
