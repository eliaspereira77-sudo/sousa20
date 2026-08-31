/**
 * ==========================================================
 * SOUSA 2.0 — TRANSPORTES POR PROTOCOLO
 * ==========================================================
 * Implementações de rede dos protocolos.
 * Não conhecem "Groq" ou "Cerebras" — só o contrato USB + contexto.
 * ==========================================================
 */

function SOUSA_USB_obterCredencialDeUsb(usb) {
  var auth = usb.autenticacao || {};
  if (auth.tipo === "NENHUMA" || !auth.tipo) {
    return { necessaria: false, disponivel: true, nome: null, valor: null };
  }
  var nome = auth.chave_cofre || usb.api_key || null;
  if (!nome) {
    return { necessaria: true, disponivel: false, nome: null, valor: null };
  }
  if (typeof obterChaveAPI !== "function") {
    throw new Error("obterChaveAPI ausente — Cofre indisponível");
  }
  var valor = obterChaveAPI(nome);
  return { necessaria: true, disponivel: !!valor, nome: nome, valor: valor || null };
}

function SOUSA_USB_normalizarContexto(contexto) {
  var ctx = contexto || {};
  var systemInstruction = ctx.systemInstruction || ctx.system || null;
  var history = Array.isArray(ctx.history) ? ctx.history : null;
  var texto = ctx.texto || ctx.prompt || "";
  if (!texto && systemInstruction && history && history.length) {
    var histTxt = history.map(function (msg) {
      var papel = (msg.role === "assistant" || msg.role === "model") ? "ASSISTENTE" : "USUÁRIO";
      return papel + ": " + (msg.content || "");
    }).join("\n");
    texto = systemInstruction + "\n\nHISTÓRICO:\n" + histTxt;
  } else if (!texto && systemInstruction) {
    texto = systemInstruction;
  }
  return { texto: texto, prompt: texto, systemInstruction: systemInstruction, history: history };
}

function SOUSA_USB_TRANSPORTE_gemini(usb, contexto) {
  var ctx = SOUSA_USB_normalizarContexto(contexto);
  var cred = SOUSA_USB_obterCredencialDeUsb(usb);
  if (cred.necessaria && !cred.disponivel) {
    return { ok: false, status: "CREDENCIAL_AUSENTE", provedor: usb.provedor, credencial: cred.nome };
  }
  var modelo = usb.modelo;
  if (!modelo) return { ok: false, status: "MODELO_AUSENTE", provedor: usb.provedor };

  var base = (usb.endpoint || "https://generativelanguage.googleapis.com/v1beta/models").replace(/\/+$/, "");
  var endpoint = base + "/" + modelo + ":generateContent?key=" + encodeURIComponent(cred.valor);

  var payload = { generationConfig: { temperature: 0.7, maxOutputTokens: 1024 } };
  if (ctx.systemInstruction) {
    payload.systemInstruction = { parts: [{ text: String(ctx.systemInstruction) }] };
  }
  if (ctx.history && ctx.history.length) {
    payload.contents = ctx.history.map(function (msg) {
      return {
        role: (msg.role === "assistant" || msg.role === "model") ? "model" : "user",
        parts: [{ text: String(msg.content || "") }]
      };
    });
  } else {
    payload.contents = [{ role: "user", parts: [{ text: String(ctx.texto || "") }] }];
  }

  try {
    var resp = UrlFetchApp.fetch(endpoint, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    var codigo = resp.getResponseCode();
    var bruto = resp.getContentText();
    var resultado;
    try { resultado = JSON.parse(bruto); } catch (e) {
      return { ok: false, status: "RESPOSTA_INVALIDA", provedor: usb.provedor, codigo_http: codigo, resposta_bruta: String(bruto).substring(0, 800) };
    }
    if (codigo < 200 || codigo >= 300 || resultado.error) {
      return { ok: false, status: "ERRO_PROVEDOR", provedor: usb.provedor, codigo_http: codigo, erro: resultado.error || resultado };
    }
    var textoResposta = resultado && resultado.candidates && resultado.candidates[0] &&
      resultado.candidates[0].content && resultado.candidates[0].content.parts &&
      resultado.candidates[0].content.parts[0] ? resultado.candidates[0].content.parts[0].text : null;
    if (textoResposta == null) {
      return { ok: false, status: "RESPOSTA_INVALIDA", provedor: usb.provedor, codigo_http: codigo, resposta: resultado };
    }
    return { ok: true, status: "EXECUCAO_CONCLUIDA", provedor: usb.provedor, modelo: modelo, protocolo: usb.protocolo, codigo_http: codigo, texto: textoResposta };
  } catch (erro) {
    return { ok: false, status: "ERRO_REDE", provedor: usb.provedor, mensagem: erro.message || String(erro) };
  }
}

function SOUSA_USB_TRANSPORTE_openai(usb, contexto) {
  var ctx = SOUSA_USB_normalizarContexto(contexto);
  var cred = SOUSA_USB_obterCredencialDeUsb(usb);
  if (cred.necessaria && !cred.disponivel) {
    return { ok: false, status: "CREDENCIAL_AUSENTE", provedor: usb.provedor, credencial: cred.nome };
  }
  var modelo = usb.modelo;
  if (!modelo) return { ok: false, status: "MODELO_AUSENTE", provedor: usb.provedor };
  if (!usb.endpoint) return { ok: false, status: "ENDPOINT_AUSENTE", provedor: usb.provedor };

  var endpoint = String(usb.endpoint).replace(/\/+$/, "") + "/chat/completions";
  var messages = [];
  if (ctx.systemInstruction) messages.push({ role: "system", content: String(ctx.systemInstruction) });
  if (ctx.history && ctx.history.length) {
    ctx.history.forEach(function (msg) {
      messages.push({
        role: (msg.role === "assistant" || msg.role === "model") ? "assistant" : "user",
        content: String(msg.content || "")
      });
    });
  } else {
    messages.push({ role: "user", content: String(ctx.texto || "") });
  }

  var headers = { Authorization: "Bearer " + cred.valor };
  // Headers extras só via metadados do contrato (encaixe), nunca por nome do provedor
  if (usb.metadados) {
    if (usb.metadados.openrouter_headers || usb.metadados.http_referer || usb.metadados.referer) {
      headers["HTTP-Referer"] = usb.metadados.referer || usb.metadados.http_referer || "https://sousa20.local";
      headers["X-Title"] = usb.metadados.title || usb.metadados.x_title || "SOUSA 2.0";
    }
    if (usb.metadados.headers && typeof usb.metadados.headers === "object") {
      Object.keys(usb.metadados.headers).forEach(function (h) {
        headers[h] = usb.metadados.headers[h];
      });
    }
  }

  try {
    var resp = UrlFetchApp.fetch(endpoint, {
      method: "post",
      contentType: "application/json",
      headers: headers,
      payload: JSON.stringify({ model: modelo, messages: messages, temperature: 0.7, max_tokens: 1024 }),
      muteHttpExceptions: true
    });
    var codigo = resp.getResponseCode();
    var bruto = resp.getContentText();
    var resultado;
    try { resultado = JSON.parse(bruto); } catch (e) {
      return { ok: false, status: "RESPOSTA_INVALIDA", provedor: usb.provedor, codigo_http: codigo, resposta_bruta: String(bruto).substring(0, 800) };
    }
    if (codigo < 200 || codigo >= 300 || resultado.error) {
      return { ok: false, status: "ERRO_PROVEDOR", provedor: usb.provedor, codigo_http: codigo, erro: resultado.error || resultado };
    }
    var textoResposta = resultado && resultado.choices && resultado.choices[0] && resultado.choices[0].message
      ? resultado.choices[0].message.content
      : (resultado && resultado.text ? resultado.text : null);
    if (textoResposta == null) {
      return { ok: false, status: "RESPOSTA_INVALIDA", provedor: usb.provedor, codigo_http: codigo, resposta: resultado };
    }
    return { ok: true, status: "EXECUCAO_CONCLUIDA", provedor: usb.provedor, modelo: modelo, protocolo: usb.protocolo, codigo_http: codigo, texto: textoResposta };
  } catch (erro) {
    return { ok: false, status: "ERRO_REDE_OU_LOCAL", provedor: usb.provedor, mensagem: erro.message || String(erro) };
  }
}

function SOUSA_USB_TRANSPORTE_ollama(usb, contexto) {
  var ctx = SOUSA_USB_normalizarContexto(contexto);
  var modelo = usb.modelo;
  if (!modelo) return { ok: false, status: "MODELO_AUSENTE", provedor: usb.provedor };
  var base = (usb.endpoint || "http://127.0.0.1:11434").replace(/\/+$/, "");
  var endpoint = base + "/api/chat";
  var messages = [];
  if (ctx.systemInstruction) messages.push({ role: "system", content: String(ctx.systemInstruction) });
  if (ctx.history && ctx.history.length) {
    ctx.history.forEach(function (msg) {
      messages.push({
        role: (msg.role === "assistant" || msg.role === "model") ? "assistant" : "user",
        content: String(msg.content || "")
      });
    });
  } else {
    messages.push({ role: "user", content: String(ctx.texto || "") });
  }

  try {
    var resp = UrlFetchApp.fetch(endpoint, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({ model: modelo, messages: messages, stream: false }),
      muteHttpExceptions: true
    });
    var codigo = resp.getResponseCode();
    var bruto = resp.getContentText();
    var resultado;
    try { resultado = JSON.parse(bruto); } catch (e) {
      return { ok: false, status: "RESPOSTA_INVALIDA", provedor: usb.provedor, codigo_http: codigo, resposta_bruta: String(bruto).substring(0, 800) };
    }
    if (codigo < 200 || codigo >= 300 || resultado.error) {
      return { ok: false, status: "ERRO_PROVEDOR", provedor: usb.provedor, codigo_http: codigo, erro: resultado.error || resultado };
    }
    var textoResposta = resultado && resultado.message ? resultado.message.content : null;
    if (textoResposta == null) {
      return { ok: false, status: "RESPOSTA_INVALIDA", provedor: usb.provedor, codigo_http: codigo, resposta: resultado };
    }
    return { ok: true, status: "EXECUCAO_CONCLUIDA", provedor: usb.provedor, modelo: modelo, protocolo: usb.protocolo, codigo_http: codigo, texto: textoResposta };
  } catch (erro) {
    return { ok: false, status: "ERRO_REDE_OU_LOCAL", provedor: usb.provedor, mensagem: erro.message || String(erro) };
  }
}
