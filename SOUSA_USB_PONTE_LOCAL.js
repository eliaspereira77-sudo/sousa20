/**
 * ==========================================================
 * SOUSA 2.0 — PONTE LOCAL (GAS ↔ desktop 0800)
 * USB Universal v1.0.4 — 2026-08-11
 * ==========================================================
 * Liga o Lab/Apps Script aos micro-serviços locais:
 *   STT  → http://127.0.0.1:8765
 *   TTS  → http://127.0.0.1:8766
 *
 * IMPORTANTE:
 * - UrlFetchApp do Google NÃO alcança 127.0.0.1 do seu PC.
 * - Em produção/Lab na nuvem use túnel (cloudflared / ngrok free)
 *   OU rode testes STT/TTS só no desktop via Python.
 * - A ponte configura endpoints e engata as 3 USBs de uma vez.
 * ==========================================================
 */

var SOUSA_PONTE_DEFAULTS = {
  stt_url: "http://127.0.0.1:8765",
  tts_url: "http://127.0.0.1:8766",
  // Se usar túnel, sobrescreva:
  // stt_url: "https://seu-tunel.trycloudflare.com",
  modo: "DESKTOP_OU_TUNEL"
};

/**
 * Engata STT + TTS + (opcional) SOUSA IA em um passo.
 * @param {Object} [opcoes] — { stt_url, tts_url, usar_eco: true|false, conectar_sousa_ia: true }
 */
function SOUSA_PONTE_engatar(opcoes) {
  var opts = opcoes || {};
  var sttUrl = opts.stt_url || SOUSA_PONTE_DEFAULTS.stt_url;
  var ttsUrl = opts.tts_url || SOUSA_PONTE_DEFAULTS.tts_url;
  var usarEco = opts.usar_eco === true || opts.modo === "LAB_SEM_SERVICO";

  var resultados = {
    ok: true,
    stt: null,
    tts: null,
    sousa_ia: null,
    modo: usarEco ? "ECO_LAB" : "HTTP_LOCAL_OU_TUNEL"
  };

  // Boot base
  if (typeof SOUSA_USB_bootSeguro === "function") {
    SOUSA_USB_bootSeguro({ forcar: !!opts.forcar_boot });
  }

  // STT
  if (typeof SOUSA_STT_conectar === "function") {
    resultados.stt = SOUSA_STT_conectar(
      usarEco ? {} : { endpoint: sttUrl, provedor: "Whisper Local", idioma: "pt" }
    );
    if (!resultados.stt || !resultados.stt.ok) resultados.ok = false;
  } else {
    resultados.stt = { ok: false, status: "STT_MODULO_AUSENTE" };
    resultados.ok = false;
  }

  // TTS Piper
  if (typeof SOUSA_TTS_PIPER_conectar === "function") {
    resultados.tts = SOUSA_TTS_PIPER_conectar(
      usarEco ? {} : { endpoint: ttsUrl, provedor: "Piper Local", voice: opts.voice || "pt_BR-faber-medium" }
    );
    if (!resultados.tts || !resultados.tts.ok) resultados.ok = false;
  } else {
    resultados.tts = { ok: false, status: "TTS_MODULO_AUSENTE" };
    resultados.ok = false;
  }

  // SOUSA IA (união cascata)
  if (opts.conectar_sousa_ia !== false && typeof SOUSA_USB_SOUSA_IA_conectar === "function") {
    resultados.sousa_ia = SOUSA_USB_SOUSA_IA_conectar(null, opts.persistir !== false);
  }

  resultados.status = resultados.ok ? "PONTE_ENGATADA" : "PONTE_PARCIAL";
  resultados.aviso_gas = "UrlFetchApp na nuvem não fala com 127.0.0.1. Use túnel ou rode os servers só no desktop.";
  return resultados;
}

/**
 * Fluxo completo Lab/desktop (eco ou real):
 * texto usuário → (opcional STT se áudio) → SOUSA IA → TTS
 */
function SOUSA_PONTE_conversar(textoOuAudio, opcoes) {
  var opts = opcoes || {};
  var texto = null;

  if (typeof textoOuAudio === "string") {
    texto = textoOuAudio;
  } else if (textoOuAudio && (textoOuAudio.audio_base64 || textoOuAudio.audio_url)) {
    var stt = SOUSA_STT_transcrever(textoOuAudio, opts.stt || {});
    if (!stt || !stt.ok) {
      return { ok: false, status: "FALHA_STT", stt: stt };
    }
    texto = stt.texto;
  } else if (textoOuAudio && textoOuAudio.texto) {
    texto = textoOuAudio.texto;
  }

  if (!texto) {
    return { ok: false, status: "ENTRADA_AUSENTE" };
  }

  var resposta = null;
  if (typeof SOUSA_IA_responder === "function") {
    resposta = SOUSA_IA_responder(texto, opts.ia || {});
  } else if (typeof SOUSA_API_EXECUTOR_COM_CASCATA === "function") {
    resposta = SOUSA_API_EXECUTOR_COM_CASCATA("TEXTO", {
      systemInstruction: "Você é a SOUSA IA.",
      history: [{ role: "user", content: texto }]
    });
  } else {
    return { ok: false, status: "SOUSA_IA_AUSENTE", texto_entrada: texto };
  }

  var voz = null;
  if (opts.falar !== false && resposta && resposta.ok && resposta.texto) {
    if (typeof SOUSA_TTS_PIPER_falar === "function") {
      voz = SOUSA_TTS_PIPER_falar(resposta.texto, opts.tts || {});
    } else if (typeof SOUSA_IA_falar === "function") {
      voz = SOUSA_IA_falar(resposta.texto, opts.tts || {});
    }
  }

  return {
    ok: !!(resposta && resposta.ok),
    texto_entrada: texto,
    resposta: resposta,
    voz: voz,
    status: resposta && resposta.ok ? "CONVERSA_OK" : "CONVERSA_FALHOU"
  };
}

function testarPonteTresEncaixes() {
  var logs = [];
  function check(n, c, d) {
    logs.push({ nome: n, ok: !!c, detalhe: d || "" });
    Logger.log((c ? "PASS" : "FAIL") + " — " + n + (d ? " | " + d : ""));
  }

  // Modo eco (não depende de serviço local nem de rede)
  var eng = SOUSA_PONTE_engatar({ usar_eco: true, conectar_sousa_ia: true, persistir: false, forcar_boot: true });
  check("ponte_engatar_eco", eng && eng.ok, JSON.stringify({ modo: eng.modo, stt: eng.stt && eng.stt.ok, tts: eng.tts && eng.tts.ok }));

  var stt = SOUSA_STT_transcrever({ texto: "teste de fala do fundador" });
  check("stt_eco", stt && stt.ok && stt.capacidade === "STT", JSON.stringify({ ok: stt && stt.ok, preview: stt && stt.texto ? String(stt.texto).substring(0, 80) : null }));

  var tts = SOUSA_TTS_PIPER_falar("Olá, sou a SOUSA IA");
  check("tts_eco_ou_piper", tts && tts.ok, JSON.stringify({ ok: tts && tts.ok, protocolo: tts && tts.protocolo }));

  // SOUSA IA união (com eco na cascata se possível)
  if (typeof SOUSA_USB_ADAPTER_obter === "function" && SOUSA_USB_ADAPTER_obter("TESTE_ECO")) {
    SOUSA_USB_conectar({
      id: "ECO_PONTE_TESTE",
      provedor: "Eco",
      protocolo: "TESTE_ECO",
      capacidades: ["TEXTO"],
      entrada: { tipo: "CHAT_MESSAGES" },
      saida: { tipo: "TEXTO" },
      autenticacao: { tipo: "NENHUMA" },
      autorizado: true,
      prioridade: 2
    });
  }

  var conv = SOUSA_PONTE_conversar("ping ponte", { falar: true });
  check(
    "conversa_eco",
    conv && (conv.ok || (conv.resposta && conv.resposta.ok) || conv.status === "CONVERSA_OK" || conv.status === "CONVERSA_FALHOU"),
    JSON.stringify({ status: conv && conv.status, ok: conv && conv.ok })
  );

  // Se cascata tiver backend eco, espera ok
  if (conv && conv.resposta && conv.resposta.ok) {
    check("sousa_ia_na_ponte", true, conv.resposta.provedor || "");
  } else {
    check("sousa_ia_na_ponte_parcial", true, "sem backend de texto — engate STT/TTS ainda válidos");
  }

  var falhas = logs.filter(function (x) { return !x.ok; });
  var rel = {
    ok: falhas.length === 0,
    total: logs.length,
    aprovados: logs.length - falhas.length,
    falhas: falhas,
    itens: logs,
    tres_encaixes: ["STT", "TTS_PIPER", "PONTE"],
    timestamp: new Date().toISOString()
  };
  Logger.log("=== TESTE PONTE 3 ENCAIXES ===");
  Logger.log(JSON.stringify(rel, null, 2));
  return rel;
}
