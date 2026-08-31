/**
 * ==========================================================
 * SOUSA 2.0 — DNA DIGITAL + IDENTIDADE + MEMÓRIA + VOZ
 * USB Universal v1.0.3 — 2026-08-10
 * ==========================================================
 * Extensões Plug and Play da SOUSA IA:
 *
 * 1) DNA DIGITAL / IDENTIDADE
 *    Perfil estável: quem é, tom, princípios, limites.
 *    Persistido como contrato (não é hardcode no Executor).
 *
 * 2) APRENDER / TREINAR EM CONTEXTOS
 *    Memória de contexto + feedback do fundador.
 *    Não é fine-tune de pesos de LLM no Apps Script.
 *    É aprendizado operacional: preferências, correções,
 *    exemplos, contextos aprovados — injetados na próxima chamada.
 *
 * 3) VOZ (clonada do fundador)
 *    Capacidade VOZ como USB: adaptador de síntese.
 *    O provedor de voz encaixa por contrato.
 *    A voz é identidade; o motor TTS é encaixe.
 *
 * Tudo engata sem alterar o Executor Universal.
 * ==========================================================
 */

/* ----------------------------------------------------------
 * 1. DNA DIGITAL — identidade da SOUSA IA
 * ---------------------------------------------------------- */

var SOUSA_IA_DNA_PROP = "SOUSA_IA_DNA_JSON";

/**
 * DNA padrão (fundador pode sobrescrever e persistir).
 * Este é o "quem sou eu" da SOUSA IA.
 */
var SOUSA_IA_DNA_PADRAO = {
  versao: "1.0.3",
  identidade: {
    nome: "SOUSA IA",
    origem: "União das capacidades das USBs do SOUSA 2.0",
    fundador: "Elias",
    missao: "Servir o ecossistema SOUSA com a voz, o critério e o DNA do fundador",
    natureza: "UNIAO_CASCATA + IDENTIDADE_PROPRIA"
  },
  tom: {
    estilo: "direto, claro, técnico quando preciso, humano sempre",
    idioma_preferencial: "pt-BR",
    formalidade: "profissional-acessivel",
    evita: ["jargão vazio", "promessas não comprovadas", "tom genérico de chatbot"]
  },
  principios: [
    "Universalidade por contrato (USB Plug and Play)",
    "Segurança: credenciais só no Cofre",
    "Produção só após Lab homologado",
    "Não afirmar o que não foi comprovado",
    "A cor muda; o encaixe não"
  ],
  limites: {
    nao_faz: ["alterar Produção sem autorização", "expor segredos", "inventar fatos"],
    escopo: "SOUSA 2.0 e ecossistema autorizado pelo fundador"
  },
  voz: {
    habilitada: false, // true quando USB de voz engatada + voice_id configurado
    voice_id_cofre: "SOUSA_IA_VOICE_ID", // nome da propriedade, não o valor
    provedor_voz_preferencial: null,     // id da USB de voz
    idioma: "pt-BR",
    nota: "Voz do fundador via adaptador USB — não embutida no Executor"
  },
  aprendizado: {
    habilitado: true,
    max_exemplos: 50,
    max_correcoes: 100,
    injetar_em_system: true
  }
};

function SOUSA_IA_DNA_obter() {
  try {
    var raw = PropertiesService.getScriptProperties().getProperty(SOUSA_IA_DNA_PROP);
    if (raw) {
      var parsed = JSON.parse(raw);
      return { ok: true, fonte: "PERSISTIDO", dna: parsed };
    }
  } catch (e) {}
  return { ok: true, fonte: "PADRAO", dna: SOUSA_IA_DNA_PADRAO };
}

function SOUSA_IA_DNA_salvar(dna) {
  try {
    var atual = SOUSA_IA_DNA_obter().dna || {};
    var merged = SOUSA_IA_DNA_mesclar(atual, dna || {});
    merged.versao = merged.versao || "1.0.3";
    merged.atualizado_em = new Date().toISOString();
    PropertiesService.getScriptProperties().setProperty(SOUSA_IA_DNA_PROP, JSON.stringify(merged));
    return { ok: true, status: "DNA_SALVO", dna: merged };
  } catch (e) {
    return { ok: false, status: "DNA_ERRO", mensagem: e.message || String(e) };
  }
}

function SOUSA_IA_DNA_mesclar(base, over) {
  var out = {};
  Object.keys(base || {}).forEach(function (k) { out[k] = base[k]; });
  Object.keys(over || {}).forEach(function (k) {
    if (over[k] && typeof over[k] === "object" && !Array.isArray(over[k]) && typeof out[k] === "object" && out[k] && !Array.isArray(out[k])) {
      out[k] = SOUSA_IA_DNA_mesclar(out[k], over[k]);
    } else {
      out[k] = over[k];
    }
  });
  return out;
}

function SOUSA_IA_DNA_resetar() {
  try {
    PropertiesService.getScriptProperties().deleteProperty(SOUSA_IA_DNA_PROP);
    return { ok: true, status: "DNA_RESETADO", dna: SOUSA_IA_DNA_PADRAO };
  } catch (e) {
    return { ok: false, status: "DNA_ERRO", mensagem: e.message || String(e) };
  }
}

/**
 * Materializa o DNA como systemInstruction para a cascata.
 */
function SOUSA_IA_DNA_comoSystemInstruction() {
  var dna = SOUSA_IA_DNA_obter().dna;
  var id = dna.identidade || {};
  var tom = dna.tom || {};
  var linhas = [];
  linhas.push("Você é " + (id.nome || "SOUSA IA") + ".");
  if (id.missao) linhas.push("Missão: " + id.missao);
  if (id.fundador) linhas.push("Fundador de referência: " + id.fundador + ".");
  if (tom.estilo) linhas.push("Tom: " + tom.estilo + ".");
  if (tom.idioma_preferencial) linhas.push("Idioma preferencial: " + tom.idioma_preferencial + ".");
  if (dna.principios && dna.principios.length) {
    linhas.push("Princípios: " + dna.principios.join("; ") + ".");
  }
  if (dna.limites && dna.limites.nao_faz) {
    linhas.push("Não fazer: " + dna.limites.nao_faz.join("; ") + ".");
  }
  // Memória / treinamento de contexto
  var mem = SOUSA_IA_MEMORIA_obterResumoParaPrompt();
  if (mem) linhas.push(mem);
  return linhas.join("\n");
}

/* ----------------------------------------------------------
 * 2. MEMÓRIA / APRENDIZADO POR CONTEXTO
 *    (operacional — não fine-tune de modelo)
 * ---------------------------------------------------------- */

var SOUSA_IA_MEMORIA_PROP = "SOUSA_IA_MEMORIA_JSON";

function SOUSA_IA_MEMORIA_carregar() {
  try {
    var raw = PropertiesService.getScriptProperties().getProperty(SOUSA_IA_MEMORIA_PROP);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { exemplos: [], correcoes: [], contextos: [], versao: "1.0.3" };
}

function SOUSA_IA_MEMORIA_salvar(mem) {
  try {
    mem = mem || SOUSA_IA_MEMORIA_carregar();
    mem.atualizado_em = new Date().toISOString();
    PropertiesService.getScriptProperties().setProperty(SOUSA_IA_MEMORIA_PROP, JSON.stringify(mem));
    return { ok: true, status: "MEMORIA_SALVA", n_exemplos: (mem.exemplos || []).length, n_correcoes: (mem.correcoes || []).length };
  } catch (e) {
    return { ok: false, status: "MEMORIA_ERRO", mensagem: e.message || String(e) };
  }
}

/**
 * Treino por exemplo aprovado pelo fundador.
 * { entrada, saida_esperada, contexto?, tags? }
 */
function SOUSA_IA_aprenderExemplo(exemplo) {
  if (!exemplo || !exemplo.entrada) {
    return { ok: false, status: "EXEMPLO_INVALIDO" };
  }
  var dna = SOUSA_IA_DNA_obter().dna;
  var max = (dna.aprendizado && dna.aprendizado.max_exemplos) || 50;
  var mem = SOUSA_IA_MEMORIA_carregar();
  mem.exemplos = mem.exemplos || [];
  mem.exemplos.push({
    entrada: String(exemplo.entrada).substring(0, 2000),
    saida_esperada: exemplo.saida_esperada ? String(exemplo.saida_esperada).substring(0, 4000) : null,
    contexto: exemplo.contexto || null,
    tags: exemplo.tags || [],
    em: new Date().toISOString()
  });
  while (mem.exemplos.length > max) mem.exemplos.shift();
  return SOUSA_IA_MEMORIA_salvar(mem);
}

/**
 * Correção do fundador sobre uma resposta.
 * { entrada, saida_errada, saida_correta, nota? }
 */
function SOUSA_IA_aprenderCorrecao(correcao) {
  if (!correcao || !correcao.saida_correta) {
    return { ok: false, status: "CORRECAO_INVALIDA" };
  }
  var dna = SOUSA_IA_DNA_obter().dna;
  var max = (dna.aprendizado && dna.aprendizado.max_correcoes) || 100;
  var mem = SOUSA_IA_MEMORIA_carregar();
  mem.correcoes = mem.correcoes || [];
  mem.correcoes.push({
    entrada: correcao.entrada ? String(correcao.entrada).substring(0, 2000) : null,
    saida_errada: correcao.saida_errada ? String(correcao.saida_errada).substring(0, 2000) : null,
    saida_correta: String(correcao.saida_correta).substring(0, 4000),
    nota: correcao.nota || null,
    em: new Date().toISOString()
  });
  while (mem.correcoes.length > max) mem.correcoes.shift();
  return SOUSA_IA_MEMORIA_salvar(mem);
}

/**
 * Marca um contexto como relevante (ex.: módulo, cliente, campanha).
 */
function SOUSA_IA_aprenderContexto(ctx) {
  if (!ctx || !ctx.nome) return { ok: false, status: "CONTEXTO_INVALIDO" };
  var mem = SOUSA_IA_MEMORIA_carregar();
  mem.contextos = mem.contextos || [];
  mem.contextos.push({
    nome: String(ctx.nome).substring(0, 120),
    descricao: ctx.descricao ? String(ctx.descricao).substring(0, 1000) : null,
    dados: ctx.dados || null,
    em: new Date().toISOString()
  });
  while (mem.contextos.length > 30) mem.contextos.shift();
  return SOUSA_IA_MEMORIA_salvar(mem);
}

function SOUSA_IA_MEMORIA_obterResumoParaPrompt() {
  var dna = SOUSA_IA_DNA_obter().dna;
  if (dna.aprendizado && dna.aprendizado.habilitado === false) return "";
  if (dna.aprendizado && dna.aprendizado.injetar_em_system === false) return "";

  var mem = SOUSA_IA_MEMORIA_carregar();
  var partes = [];
  if (mem.correcoes && mem.correcoes.length) {
    var ultimas = mem.correcoes.slice(-3);
    partes.push("Correções recentes do fundador (respeitar):");
    ultimas.forEach(function (c, i) {
      partes.push((i + 1) + ". Preferir: " + (c.saida_correta || "").substring(0, 300));
    });
  }
  if (mem.exemplos && mem.exemplos.length) {
    var ex = mem.exemplos.slice(-2);
    partes.push("Exemplos aprovados:");
    ex.forEach(function (e, i) {
      partes.push((i + 1) + ". Entrada: " + (e.entrada || "").substring(0, 120) + " → Saída: " + (e.saida_esperada || "").substring(0, 200));
    });
  }
  if (mem.contextos && mem.contextos.length) {
    var cx = mem.contextos.slice(-3);
    partes.push("Contextos ativos: " + cx.map(function (c) { return c.nome; }).join(", "));
  }
  return partes.length ? partes.join("\n") : "";
}

function SOUSA_IA_MEMORIA_limpar() {
  try {
    PropertiesService.getScriptProperties().deleteProperty(SOUSA_IA_MEMORIA_PROP);
    return { ok: true, status: "MEMORIA_LIMPA" };
  } catch (e) {
    return { ok: false, status: "MEMORIA_ERRO", mensagem: e.message || String(e) };
  }
}

/* ----------------------------------------------------------
 * 3. VOZ — capacidade USB (síntese / voz do fundador)
 * ---------------------------------------------------------- */

/**
 * Contrato mínimo de uma USB de VOZ:
 * {
 *   id, provedor, protocolo: "TTS_*",
 *   capacidades: ["VOZ"],
 *   autenticacao: { tipo, chave_cofre },
 *   metadados: { voice_id_cofre: "SOUSA_IA_VOICE_ID" }
 * }
 *
 * Protocolos previstos (registrar adaptador quando houver endpoint):
 *   TTS_HTTP_JSON  — POST genérico { text, voice_id } → audio
 *   TTS_ECO        — Lab sem áudio real (marca presença)
 */

function SOUSA_USB_ADAPTER_tts_eco() {
  return {
    protocolo: "TTS_ECO",
    versao: "1.0.0",
    descricao: "TTS de teste — confirma encaixe de voz sem gerar áudio real",
    execute: function (usb, contexto) {
      var texto = (contexto && (contexto.texto || contexto.prompt)) || "";
      return {
        ok: true,
        status: "EXECUCAO_CONCLUIDA",
        provedor: usb.provedor,
        protocolo: "TTS_ECO",
        capacidade: "VOZ",
        simulacao: true,
        texto: texto,
        audio_url: null,
        mensagem: "Encaixe de voz OK (eco). Configure adaptador TTS real + voice_id no Cofre para voz do fundador."
      };
    }
  };
}

function SOUSA_USB_ADAPTER_tts_http_json() {
  return {
    protocolo: "TTS_HTTP_JSON",
    versao: "1.0.0",
    descricao: "TTS genérico HTTP JSON — Plug and Play para provedores de voz",
    execute: function (usb, contexto) {
      var texto = (contexto && (contexto.texto || contexto.prompt)) || "";
      if (!texto) return { ok: false, status: "TEXTO_AUSENTE", capacidade: "VOZ" };
      if (!usb.endpoint) return { ok: false, status: "ENDPOINT_AUSENTE", capacidade: "VOZ" };

      var voiceId = null;
      var nomeVoice = (usb.metadados && usb.metadados.voice_id_cofre) || "SOUSA_IA_VOICE_ID";
      try {
        voiceId = PropertiesService.getScriptProperties().getProperty(nomeVoice);
      } catch (e) {}
      if (!voiceId) {
        return {
          ok: false,
          status: "VOICE_ID_AUSENTE",
          capacidade: "VOZ",
          mensagem: "Configure " + nomeVoice + " no Cofre (ID da voz do fundador no provedor)."
        };
      }

      var cred = null;
      if (usb.autenticacao && usb.autenticacao.chave_cofre && typeof obterChaveAPI === "function") {
        cred = obterChaveAPI(usb.autenticacao.chave_cofre);
      }
      if (usb.autenticacao && usb.autenticacao.tipo !== "NENHUMA" && !cred) {
        return { ok: false, status: "CREDENCIAL_AUSENTE", capacidade: "VOZ" };
      }

      var payload = {
        text: texto,
        voice_id: voiceId,
        language: (usb.metadados && usb.metadados.idioma) || "pt-BR"
      };
      if (usb.metadados && usb.metadados.payload_extra) {
        Object.keys(usb.metadados.payload_extra).forEach(function (k) {
          payload[k] = usb.metadados.payload_extra[k];
        });
      }

      var headers = { "Content-Type": "application/json" };
      if (cred) headers["Authorization"] = "Bearer " + cred;
      if (usb.metadados && usb.metadados.headers) {
        Object.keys(usb.metadados.headers).forEach(function (h) {
          headers[h] = usb.metadados.headers[h];
        });
      }

      try {
        var resp = UrlFetchApp.fetch(String(usb.endpoint), {
          method: "post",
          contentType: "application/json",
          headers: headers,
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        });
        var codigo = resp.getResponseCode();
        var body = resp.getContentText();
        if (codigo < 200 || codigo >= 300) {
          return { ok: false, status: "ERRO_TTS", codigo_http: codigo, capacidade: "VOZ", detalhe: String(body).substring(0, 400) };
        }
        var parsed = null;
        try { parsed = JSON.parse(body); } catch (e) {}
        return {
          ok: true,
          status: "EXECUCAO_CONCLUIDA",
          provedor: usb.provedor,
          protocolo: "TTS_HTTP_JSON",
          capacidade: "VOZ",
          codigo_http: codigo,
          audio_url: parsed && (parsed.audio_url || parsed.url) ? (parsed.audio_url || parsed.url) : null,
          audio_base64: parsed && parsed.audio_base64 ? parsed.audio_base64 : null,
          resposta: parsed || { bruto: String(body).substring(0, 200) }
        };
      } catch (erro) {
        return { ok: false, status: "ERRO_REDE_TTS", capacidade: "VOZ", mensagem: erro.message || String(erro) };
      }
    }
  };
}

function SOUSA_IA_VOZ_bootstrapAdaptadores() {
  var r = [];
  if (typeof SOUSA_USB_ADAPTER_registrar === "function") {
    r.push(SOUSA_USB_ADAPTER_registrar(SOUSA_USB_ADAPTER_tts_eco()));
    r.push(SOUSA_USB_ADAPTER_registrar(SOUSA_USB_ADAPTER_tts_http_json()));
  }
  return { ok: true, resultados: r };
}

/**
 * Conecta USB de voz eco (Lab) ou real (com endpoint).
 */
function SOUSA_IA_VOZ_conectar(opcoes) {
  SOUSA_IA_VOZ_bootstrapAdaptadores();
  var opts = opcoes || {};
  var usb = {
    id: opts.id || "SOUSA_IA_VOZ",
    provedor: opts.provedor || "Voz do Fundador",
    protocolo: opts.protocolo || (opts.endpoint ? "TTS_HTTP_JSON" : "TTS_ECO"),
    capacidades: ["VOZ"],
    entrada: { tipo: "TEXTO" },
    saida: { tipo: "AUDIO" },
    autenticacao: opts.autenticacao || { tipo: "NENHUMA" },
    endpoint: opts.endpoint || null,
    prioridade: opts.prioridade || 1,
    autorizado: true,
    metadados: {
      voice_id_cofre: opts.voice_id_cofre || "SOUSA_IA_VOICE_ID",
      idioma: opts.idioma || "pt-BR",
      headers: opts.headers || null,
      payload_extra: opts.payload_extra || null,
      identidade: "Voz clonada do fundador — encaixe USB"
    }
  };
  if (typeof SOUSA_USB_conectarEPersistir === "function") {
    return SOUSA_USB_conectarEPersistir(usb);
  }
  return SOUSA_USB_conectar(usb);
}

/**
 * Fala um texto com a USB de voz engatada.
 */
function SOUSA_IA_falar(texto, opcoes) {
  var opts = opcoes || {};
  SOUSA_IA_VOZ_bootstrapAdaptadores();
  var id = opts.usb_id || "SOUSA_IA_VOZ";
  var usb = typeof SOUSA_USB_obter === "function" ? SOUSA_USB_obter(id) : null;
  if (!usb) {
    // tenta qualquer USB com capacidade VOZ
    var lista = typeof SOUSA_USB_listar === "function" ? SOUSA_USB_listar({ capacidade: "VOZ", apenas_operacional: true }) : [];
    usb = lista[0] || null;
  }
  if (!usb) {
    return { ok: false, status: "VOZ_NAO_ENGATADA", mensagem: "Conecte com SOUSA_IA_VOZ_conectar() primeiro." };
  }
  return SOUSA_API_EXECUTOR_UNIVERSAL({ recurso_escolhido: usb.id, usb: usb }, { texto: texto });
}

/* ----------------------------------------------------------
 * 4. EXECUÇÃO SOUSA IA COM DNA + MEMÓRIA
 * ---------------------------------------------------------- */

/**
 * Chat SOUSA IA: injeta DNA + memória no system e roda união da cascata.
 */
function SOUSA_IA_responder(textoOuContexto, opcoes) {
  var opts = opcoes || {};
  var contexto = {};
  if (typeof textoOuContexto === "string") {
    contexto = { history: [{ role: "user", content: textoOuContexto }] };
  } else {
    contexto = textoOuContexto || {};
  }

  var systemDna = SOUSA_IA_DNA_comoSystemInstruction();
  if (contexto.systemInstruction) {
    contexto.systemInstruction = systemDna + "\n\n" + contexto.systemInstruction;
  } else {
    contexto.systemInstruction = systemDna;
  }

  // Garante SOUSA IA engatada
  if (typeof SOUSA_USB_obter === "function" && !SOUSA_USB_obter("SOUSA_IA")) {
    if (typeof SOUSA_USB_SOUSA_IA_conectar === "function") {
      SOUSA_USB_SOUSA_IA_conectar(null, false);
    }
  }

  var r = SOUSA_API_EXECUTOR_UNIVERSAL(
    { recurso_escolhido: "SOUSA_IA" },
    contexto
  );

  if (r && r.ok) {
    r.dna_aplicado = true;
    r.identidade = "SOUSA IA";
  }

  // Opcional: também gerar voz
  if (opts.falar === true && r && r.ok && r.texto) {
    r.voz = SOUSA_IA_falar(r.texto, opts.voz || {});
  }

  return r;
}

/* ----------------------------------------------------------
 * 5. TESTE DO PACOTE IDENTIDADE
 * ---------------------------------------------------------- */

function testarSousaIAIdentidadeCompleta() {
  var logs = [];
  function check(n, c, d) {
    logs.push({ nome: n, ok: !!c, detalhe: d || "" });
    Logger.log((c ? "PASS" : "FAIL") + " — " + n + (d ? " | " + d : ""));
  }

  if (typeof SOUSA_USB_bootSeguro === "function") SOUSA_USB_bootSeguro({ forcar: true });
  SOUSA_IA_VOZ_bootstrapAdaptadores();

  // DNA
  var dnaSave = SOUSA_IA_DNA_salvar({
    identidade: { fundador: "Elias", nome: "SOUSA IA" },
    tom: { idioma_preferencial: "pt-BR" }
  });
  check("dna_salvar", dnaSave.ok, dnaSave.status);
  var dnaGet = SOUSA_IA_DNA_obter();
  check("dna_obter", dnaGet.ok && dnaGet.dna.identidade.nome === "SOUSA IA", dnaGet.fonte);

  // Memória / treino
  var ex = SOUSA_IA_aprenderExemplo({
    entrada: "Como o SOUSA trata APIs?",
    saida_esperada: "Por contrato USB Plug and Play, não por lista fixa de fornecedores."
  });
  check("aprender_exemplo", ex.ok, ex.status);
  var cor = SOUSA_IA_aprenderCorrecao({
    entrada: "quem e voce",
    saida_errada: "sou um assistente generico",
    saida_correta: "Sou a SOUSA IA, união das capacidades das USBs do SOUSA 2.0, com o DNA do fundador Elias."
  });
  check("aprender_correcao", cor.ok, cor.status);

  var sys = SOUSA_IA_DNA_comoSystemInstruction();
  check("system_com_dna_e_memoria", sys.indexOf("SOUSA IA") !== -1 && sys.length > 50, sys.substring(0, 120));

  // Voz eco
  var vozConn = SOUSA_IA_VOZ_conectar({});
  check("voz_conectar_eco", vozConn.ok, JSON.stringify(vozConn));
  var fala = SOUSA_IA_falar("Teste de encaixe de voz do fundador");
  check("voz_falar_eco", fala.ok && fala.capacidade === "VOZ", JSON.stringify({ ok: fala.ok, protocolo: fala.protocolo }));

  // SOUSA IA união + DNA
  if (typeof SOUSA_USB_SOUSA_IA_conectar === "function") {
    SOUSA_USB_SOUSA_IA_conectar(null, false);
  }
  // eco na cascata para não depender de chave
  if (typeof SOUSA_USB_ADAPTER_obter === "function" && SOUSA_USB_ADAPTER_obter("TESTE_ECO")) {
    SOUSA_USB_conectar({
      id: "ECO_DNA_TESTE",
      provedor: "Eco",
      protocolo: "TESTE_ECO",
      capacidades: ["TEXTO"],
      entrada: { tipo: "CHAT_MESSAGES" },
      saida: { tipo: "TEXTO" },
      autenticacao: { tipo: "NENHUMA" },
      autorizado: true,
      prioridade: 3
    });
  }

  var resp = SOUSA_IA_responder("ping identidade");
  check(
    "responder_com_identidade",
    resp && resp.ok && resp.sousa_ia && resp.dna_aplicado,
    JSON.stringify({ ok: resp && resp.ok, provedor: resp && resp.provedor, dna: resp && resp.dna_aplicado })
  );

  var falhas = logs.filter(function (x) { return !x.ok; });
  var rel = {
    ok: falhas.length === 0,
    total: logs.length,
    aprovados: logs.length - falhas.length,
    falhas: falhas,
    itens: logs,
    pilares: ["USB_PNP", "DNA_DIGITAL", "APRENDIZADO_CONTEXTO", "VOZ_FUNDADOR", "SOUSA_IA_UNIAO"],
    timestamp: new Date().toISOString()
  };
  Logger.log("=== SOUSA IA IDENTIDADE COMPLETA ===");
  Logger.log(JSON.stringify(rel, null, 2));
  return rel;
}
