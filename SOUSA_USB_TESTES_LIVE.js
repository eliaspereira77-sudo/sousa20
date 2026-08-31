/**
 * ==========================================================
 * SOUSA 2.0 — TESTES LIVE (Lab, com chave real)
 * USB Universal v1.0.1 — 2026-08-10
 * ==========================================================
 * Rodar SOMENTE no Lab, com pelo menos uma chave no Cofre.
 *
 *   testarUSBLiveEssencial()
 *   testarUSBLiveCascata()
 *   testarUSBLiveChecklist()
 *
 * Não grava em Produção. Não expõe valores de chave no log.
 * ==========================================================
 */

/**
 * Checklist pré-live: estrutura + cofre (sem chamar rede).
 */
function testarUSBLiveChecklist() {
  var itens = [];

  function ok(nome, cond, det) {
    itens.push({ nome: nome, ok: !!cond, detalhe: det || "" });
    Logger.log((cond ? "PASS" : "FAIL") + " — " + nome + (det ? " | " + det : ""));
  }

  // Boot
  var boot = typeof SOUSA_USB_bootSeguro === "function"
    ? SOUSA_USB_bootSeguro({ forcar: true })
    : (typeof SOUSA_USB_inicializar === "function" ? SOUSA_USB_inicializar({ reset: true }) : null);
  ok("boot", boot && boot.ok, boot && boot.status);

  // Adaptadores
  var ads = typeof SOUSA_USB_ADAPTER_listar === "function" ? SOUSA_USB_ADAPTER_listar() : [];
  ok("adaptadores", ads.length >= 3, "n=" + ads.length);

  // USBs operacionais
  var usbs = typeof SOUSA_USB_listar === "function" ? SOUSA_USB_listar({ apenas_operacional: true }) : [];
  ok("usbs_operacionais", usbs.length > 0, "n=" + usbs.length);

  // Cofre: só verifica PRESENÇA, não valor
  var chaves = ["GEMINI_API_KEY", "GROQ_API_KEY", "CEREBRAS_API_KEY", "DEEPSEEK_API_KEY", "MISTRAL_API_KEY", "OPENROUTER_API_KEY"];
  var presentes = [];
  chaves.forEach(function (k) {
    var v = null;
    try { v = PropertiesService.getScriptProperties().getProperty(k); } catch (e) {}
    if (v) presentes.push(k);
  });
  ok("cofre_pelo_menos_uma_chave", presentes.length > 0, "presentes=" + presentes.join(","));

  // Persistência disponível
  ok("persistencia_api", typeof SOUSA_USB_REGISTRY_salvar === "function" && typeof SOUSA_USB_REGISTRY_carregar === "function");

  var falhas = itens.filter(function (i) { return !i.ok; });
  var rel = {
    ok: falhas.length === 0,
    total: itens.length,
    aprovados: itens.length - falhas.length,
    falhas: falhas,
    itens: itens,
    chaves_detectadas: presentes.length, // quantidade, não nomes+valores
    timestamp: new Date().toISOString()
  };
  Logger.log(JSON.stringify(rel, null, 2));
  return rel;
}

/**
 * Live essencial: tenta cascata TEXTO com prompt mínimo.
 * Para no primeiro sucesso. Não loga corpo completo se enorme.
 */
function testarUSBLiveEssencial() {
  if (typeof SOUSA_USB_bootSeguro === "function") {
    SOUSA_USB_bootSeguro({ forcar: true });
  }

  var contexto = {
    systemInstruction: "Responda com exatamente uma palavra: PONG",
    history: [{ role: "user", content: "ping" }]
  };

  var inicio = Date.now();
  var r = SOUSA_API_EXECUTOR_COM_CASCATA("TEXTO", contexto);
  var ms = Date.now() - inicio;

  var resumo = {
    ok: !!(r && r.ok),
    status: r && r.status,
    provedor: r && r.provedor,
    protocolo: r && r.protocolo,
    modelo: r && r.modelo,
    texto_preview: r && r.texto ? String(r.texto).substring(0, 120) : null,
    cascata: r && r.cascata ? r.cascata : null,
    latencia_ms: ms,
    timestamp: new Date().toISOString()
  };

  Logger.log("=== LIVE ESSENCIAL ===");
  Logger.log(JSON.stringify(resumo, null, 2));
  return resumo;
}

/**
 * Live cascata: força relatório de tentativas (mesmo se primeiro ok).
 * Usa prioridade alta em eco de teste se registrado; senão só cloud.
 */
function testarUSBLiveCascata() {
  if (typeof SOUSA_USB_bootSeguro === "function") {
    SOUSA_USB_bootSeguro({ forcar: true });
  }

  var lista = SOUSA_USB_listar({ apenas_operacional: true });
  var tentativas = [];

  lista.forEach(function (usb) {
    // Pular eco de teste em live real (opcional: incluir)
    if (usb.protocolo === "TESTE_ECO") return;

    var inicio = Date.now();
    var r = SOUSA_API_EXECUTOR_UNIVERSAL({ recurso_escolhido: usb.id, usb: usb }, {
      texto: "Responda só: OK"
    });
    tentativas.push({
      id: usb.id,
      provedor: usb.provedor,
      protocolo: usb.protocolo,
      ok: !!(r && r.ok),
      status: r && r.status,
      latencia_ms: Date.now() - inicio,
      preview: r && r.texto ? String(r.texto).substring(0, 80) : null
    });
  });

  var algumOk = tentativas.some(function (t) { return t.ok; });
  var rel = {
    ok: algumOk,
    status: algumOk ? "PELO_MENOS_UM_OK" : "TODOS_FALHARAM",
    tentativas: tentativas,
    timestamp: new Date().toISOString()
  };
  Logger.log("=== LIVE CASCATA ===");
  Logger.log(JSON.stringify(rel, null, 2));
  return rel;
}

/**
 * Persistência: conectar X → salvar → limpar memória → carregar → executar.
 * Usa TESTE_ECO (sem rede) para provar o ciclo.
 */
function testarUSBPersistenciaCiclo() {
  SOUSA_USB_REGISTRY_STORE = {};
  if (typeof SOUSA_USB_ADAPTER_bootstrap === "function") SOUSA_USB_ADAPTER_bootstrap();

  var conn = SOUSA_USB_conectarEPersistir({
    id: "PERSIST_TESTE_X",
    provedor: "PersistX",
    protocolo: "TESTE_ECO",
    capacidades: ["TEXTO"],
    entrada: { tipo: "CHAT_MESSAGES" },
    saida: { tipo: "TEXTO" },
    autenticacao: { tipo: "NENHUMA" },
    autorizado: true,
    prioridade: 1
  });

  // Simula “nova execução”: zera memória
  SOUSA_USB_REGISTRY_STORE = {};
  var load = SOUSA_USB_REGISTRY_carregar();
  var usb = SOUSA_USB_obter("PERSIST_TESTE_X");
  var exec = usb
    ? SOUSA_API_EXECUTOR_UNIVERSAL({ recurso_escolhido: "PERSIST_TESTE_X" }, { texto: "persist-ok" })
    : { ok: false, status: "NAO_CARREGOU" };

  // Limpa lixo de teste
  SOUSA_USB_desconectarEPersistir("PERSIST_TESTE_X");

  var rel = {
    ok: conn.ok && load.ok && exec.ok && String(exec.texto || "").indexOf("persist-ok") !== -1,
    conectar: conn,
    carregar: load,
    executar: { ok: exec.ok, status: exec.status, preview: exec.texto ? String(exec.texto).substring(0, 80) : null },
    timestamp: new Date().toISOString()
  };
  Logger.log("=== PERSISTÊNCIA CICLO ===");
  Logger.log(JSON.stringify(rel, null, 2));
  return rel;
}
