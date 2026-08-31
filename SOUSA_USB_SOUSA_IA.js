/**
 * ==========================================================
 * SOUSA 2.0 — ENCAIXE SOUSA IA (USB Plug and Play)
 * USB Universal v1.0.2 — 2026-08-10
 * ==========================================================
 * SOUSA IA NÃO é um provedor cloud a mais na lista.
 * SOUSA IA é a UNIÃO das capacidades das APIs USB operacionais
 * da cascata — a marca que orquestra o engate coletivo.
 *
 * Analogia:
 *   Cada USB da cascata = ferramenta no painel
 *   SOUSA IA            = o artesão que escolhe e usa as ferramentas
 *
 * Fluxo:
 *   Chamada a SOUSA IA
 *        ↓
 *   Adaptador SOUSA_IA_CHAT
 *        ↓
 *   União de capacidades dos USBs operacionais
 *        ↓
 *   Cascata / seleção por capacidade
 *        ↓
 *   Resultado assinado como SOUSA IA
 *        ↓
 *   (provedor_backend = quem de fato respondeu, em metadado)
 *
 * O Executor Universal continua agnóstico.
 * SOUSA IA encaixa pelo contrato — como qualquer USB.
 * ==========================================================
 */

/**
 * Configuração do encaixe SOUSA IA.
 * Credenciais nunca aqui — só nos USBs da cascata / Cofre.
 */
var SOUSA_IA_CONFIG = {
  id: "SOUSA_IA",
  provedor: "SOUSA IA",
  protocolo: "SOUSA_IA_CHAT",

  // Capacidade especial: união — o adaptador expande em runtime
  capacidades: ["TEXTO", "CHAT", "SOUSA_NATIVO", "UNIAO_CASCATA"],

  entrada: { tipo: "CHAT_MESSAGES" },
  saida: { tipo: "TEXTO" },
  autenticacao: { tipo: "NENHUMA" }, // auth vive em cada USB da cascata

  modelo: "sousa-ia-uniao",
  endpoint: null, // não tem endpoint próprio — usa a cascata
  prioridade: 0,  // preferencial: quem pede "SOUSA IA" cai aqui primeiro
  timeout_ms: 90000,
  retry: 0,
  versao: "1.0.2-lab",
  autorizado: true,

  metadados: {
    marca: "SOUSA IA",
    produto: "SOUSA 2.0",
    ambiente: "LAB",
    natureza: "UNIAO_CASCATA",
    identidade: "SOUSA IA — união das capacidades das APIs engatadas",
    // Excluir a si mesmo da cascata interna (evita recursão)
    excluir_ids: ["SOUSA_IA", "SOUSA_IA"],
    // Se true, anexa no resultado qual USB backend venceu
    reportar_backend: true
  }
};

/**
 * Calcula a união de capacidades de todos os USBs operacionais
 * (exceto o próprio SOUSA IA).
 */
function SOUSA_IA_unioesCapacidades() {
  var uniao = {};
  var detalhe = [];
  if (typeof SOUSA_USB_listar !== "function") {
    return { capacidades: ["TEXTO"], fontes: [] };
  }
  var lista = SOUSA_USB_listar({ apenas_operacional: true }) || [];
  var excluir = (SOUSA_IA_CONFIG.metadados && SOUSA_IA_CONFIG.metadados.excluir_ids) || ["SOUSA_IA"];
  lista.forEach(function (u) {
    if (excluir.indexOf(u.id) !== -1) return;
    (u.capacidades || []).forEach(function (c) {
      var key = String(c).toUpperCase();
      uniao[key] = true;
    });
    detalhe.push({
      id: u.id,
      provedor: u.provedor,
      protocolo: u.protocolo,
      capacidades: u.capacidades,
      prioridade: u.prioridade
    });
  });
  return {
    capacidades: Object.keys(uniao),
    fontes: detalhe
  };
}

/**
 * Cascata interna da SOUSA IA — não usa o próprio SOUSA_IA como candidato.
 */
function SOUSA_IA_executarCascata(capacidade, contexto) {
  var cap = String(capacidade || "TEXTO").toUpperCase();
  var excluir = (SOUSA_IA_CONFIG.metadados && SOUSA_IA_CONFIG.metadados.excluir_ids) || ["SOUSA_IA"];
  var lista = [];
  if (typeof SOUSA_USB_listar === "function") {
    lista = SOUSA_USB_listar({ apenas_operacional: true }) || [];
  }
  lista = lista.filter(function (u) {
    if (excluir.indexOf(u.id) !== -1) return false;
    return (u.capacidades || []).some(function (c) {
      return String(c).toUpperCase() === cap;
    });
  });

  // Ordena por prioridade
  lista.sort(function (a, b) {
    return (a.prioridade || 100) - (b.prioridade || 100);
  });

  var tentativas = [];
  for (var i = 0; i < lista.length; i++) {
    var usb = lista[i];
    var resultado = SOUSA_API_EXECUTOR_UNIVERSAL(
      { recurso_escolhido: usb.id, usb: usb },
      contexto
    );
    tentativas.push({
      id: usb.id,
      provedor: usb.provedor,
      protocolo: usb.protocolo,
      ok: !!(resultado && resultado.ok),
      status: resultado && resultado.status
    });
    if (resultado && resultado.ok) {
      return {
        ok: true,
        resultado: resultado,
        backend: {
          id: usb.id,
          provedor: usb.provedor,
          protocolo: usb.protocolo,
          modelo: resultado.modelo || usb.modelo
        },
        tentativas: tentativas
      };
    }
  }

  return {
    ok: false,
    status: "CASCATA_SOUSA_IA_ESGOTADA",
    tentativas: tentativas,
    mensagem: "Nenhum USB operacional da cascata respondeu para capacidade " + cap
  };
}

/**
 * Adaptador SOUSA_IA_CHAT — união da cascata sob a marca SOUSA IA.
 */
function SOUSA_USB_ADAPTER_sousa_ia() {
  return {
    protocolo: "SOUSA_IA_CHAT",
    versao: "1.0.2",
    descricao: "SOUSA IA — união das capacidades das USBs da cascata",
    execute: function (usb, contexto) {
      // Garante que há USBs na cascata (boot/seed se necessário)
      if (typeof SOUSA_USB_listar === "function") {
        var n = SOUSA_USB_listar({ apenas_operacional: true }).filter(function (u) {
          return u.id !== "SOUSA_IA" && u.id !== "SOUSA_IA";
        }).length;
        if (n === 0 && typeof SOUSA_USB_bootSeguro === "function") {
          SOUSA_USB_bootSeguro({ forcar: true });
        }
        if (n === 0 && typeof SOUSA_USB_semearCascataLegada === "function") {
          if (typeof SOUSA_USB_ADAPTER_bootstrap === "function") SOUSA_USB_ADAPTER_bootstrap();
          SOUSA_USB_semearCascataLegada();
        }
      }

      var uniao = SOUSA_IA_unioesCapacidades();
      var cascata = SOUSA_IA_executarCascata("TEXTO", contexto);

      if (!cascata.ok) {
        return {
          ok: false,
          status: cascata.status || "SOUSA_IA_SEM_BACKEND",
          provedor: "SOUSA IA",
          protocolo: "SOUSA_IA_CHAT",
          sousa_ia: true,
          uniao_capacidades: uniao.capacidades,
          fontes_cascata: uniao.fontes,
          tentativas: cascata.tentativas || [],
          mensagem: cascata.mensagem || "Cascata sem recurso disponível"
        };
      }

      var r = cascata.resultado || {};
      var out = {
        ok: true,
        status: "EXECUCAO_CONCLUIDA",
        provedor: "SOUSA IA",
        protocolo: "SOUSA_IA_CHAT",
        modelo: "sousa-ia-uniao",
        sousa_ia: true,
        texto: r.texto,
        uniao_capacidades: uniao.capacidades,
        fontes_cascata: uniao.fontes.map(function (f) { return f.id; })
      };

      if (usb.metadados && usb.metadados.reportar_backend !== false) {
        out.backend = cascata.backend;
        out.cascata = { tentativas: cascata.tentativas, vencedor: cascata.backend && cascata.backend.id };
      }

      // Propaga campos úteis do backend sem trocar a marca
      if (r.codigo_http) out.codigo_http = r.codigo_http;
      if (r.simulacao) out.simulacao = r.simulacao;

      return out;
    }
  };
}

function SOUSA_USB_SOUSA_IA_registrarAdaptador() {
  if (typeof SOUSA_USB_ADAPTER_registrar !== "function") {
    return { ok: false, status: "ADAPTER_STORE_AUSENTE" };
  }
  return SOUSA_USB_ADAPTER_registrar(SOUSA_USB_ADAPTER_sousa_ia());
}

/**
 * Conecta SOUSA IA no registry.
 * Atualiza capacidades para refletir a união atual da cascata.
 */
function SOUSA_USB_SOUSA_IA_conectar(overrides, persistir) {
  SOUSA_USB_SOUSA_IA_registrarAdaptador();

  // Seed da cascata se ainda vazia (para a união ter fontes)
  if (typeof SOUSA_USB_listar === "function" && SOUSA_USB_listar({ apenas_operacional: true }).length === 0) {
    if (typeof SOUSA_USB_ADAPTER_bootstrap === "function") SOUSA_USB_ADAPTER_bootstrap();
    if (typeof SOUSA_USB_semearCascataLegada === "function") SOUSA_USB_semearCascataLegada();
  }

  var cfg = {};
  var base = SOUSA_IA_CONFIG || {};
  Object.keys(base).forEach(function (k) { cfg[k] = base[k]; });
  if (overrides && typeof overrides === "object") {
    Object.keys(overrides).forEach(function (k) { cfg[k] = overrides[k]; });
  }

  // União dinâmica de capacidades no momento do engate
  var uniao = SOUSA_IA_unioesCapacidades();
  var caps = ["SOUSA_NATIVO", "UNIAO_CASCATA"].concat(uniao.capacidades || []);
  // unique
  var seen = {};
  cfg.capacidades = [];
  caps.forEach(function (c) {
    var k = String(c).toUpperCase();
    if (!seen[k]) { seen[k] = true; cfg.capacidades.push(k); }
  });

  cfg.id = cfg.id || "SOUSA_IA";
  cfg.provedor = cfg.provedor || "SOUSA IA";
  cfg.protocolo = "SOUSA_IA_CHAT";
  cfg.entrada = cfg.entrada || { tipo: "CHAT_MESSAGES" };
  cfg.saida = cfg.saida || { tipo: "TEXTO" };
  cfg.autenticacao = { tipo: "NENHUMA" };
  cfg.autorizado = cfg.autorizado !== false;
  cfg.metadados = cfg.metadados || {};
  cfg.metadados.natureza = "UNIAO_CASCATA";
  cfg.metadados.fontes_no_engate = uniao.fontes.map(function (f) { return f.id; });

  var devePersistir = persistir !== false;
  if (devePersistir && typeof SOUSA_USB_conectarEPersistir === "function") {
    return SOUSA_USB_conectarEPersistir(cfg);
  }
  if (typeof SOUSA_USB_conectar === "function") {
    return SOUSA_USB_conectar(cfg);
  }
  return { ok: false, status: "REGISTRY_AUSENTE" };
}

function SOUSA_USB_SOUSA_IA_desconectar(persistir) {
  if (persistir !== false && typeof SOUSA_USB_desconectarEPersistir === "function") {
    return SOUSA_USB_desconectarEPersistir("SOUSA_IA");
  }
  if (typeof SOUSA_USB_desconectar === "function") {
    return SOUSA_USB_desconectar("SOUSA_IA");
  }
  return { ok: false, status: "REGISTRY_AUSENTE" };
}

function SOUSA_USB_SOUSA_IA_status() {
  var usb = typeof SOUSA_USB_obter === "function" ? SOUSA_USB_obter("SOUSA_IA") : null;
  var adapter = typeof SOUSA_USB_ADAPTER_obter === "function"
    ? SOUSA_USB_ADAPTER_obter("SOUSA_IA_CHAT")
    : null;
  var uniao = SOUSA_IA_unioesCapacidades();
  return {
    ok: true,
    natureza: "UNIAO_CASCATA",
    encaixe_definido: true,
    adaptador_registrado: !!adapter,
    conectado: !!usb,
    operacional: !!(usb && (usb.estado === "OPERACIONAL" || (typeof SOUSA_USB_ESTADOS !== "undefined" && usb.estado === SOUSA_USB_ESTADOS.OPERACIONAL))),
    uniao_capacidades: uniao.capacidades,
    fontes_cascata: uniao.fontes,
    config: {
      id: SOUSA_IA_CONFIG.id,
      protocolo: SOUSA_IA_CONFIG.protocolo,
      modelo: SOUSA_IA_CONFIG.modelo,
      prioridade: SOUSA_IA_CONFIG.prioridade,
      ambiente: (SOUSA_IA_CONFIG.metadados && SOUSA_IA_CONFIG.metadados.ambiente) || null
    },
    usb: usb ? { id: usb.id, estado: usb.estado, capacidades: usb.capacidades, prioridade: usb.prioridade } : null
  };
}

/**
 * Teste do encaixe como UNIÃO da cascata.
 */
function testarEncaixeSousaIA() {
  var logs = [];
  function check(nome, cond, det) {
    logs.push({ nome: nome, ok: !!cond, detalhe: det || "" });
    Logger.log((cond ? "PASS" : "FAIL") + " — " + nome + (det ? " | " + det : ""));
  }

  if (typeof SOUSA_USB_bootSeguro === "function") SOUSA_USB_bootSeguro({ forcar: true });
  else {
    if (typeof SOUSA_USB_ADAPTER_bootstrap === "function") SOUSA_USB_ADAPTER_bootstrap();
    if (typeof SOUSA_USB_semearCascataLegada === "function") SOUSA_USB_semearCascataLegada();
  }

  // Garante ao menos um USB eco na cascata para teste sem rede
  if (typeof SOUSA_USB_ADAPTER_obter === "function" && SOUSA_USB_ADAPTER_obter("TESTE_ECO")) {
    SOUSA_USB_conectar({
      id: "ECO_CASCATA_TESTE",
      provedor: "EcoCascata",
      protocolo: "TESTE_ECO",
      capacidades: ["TEXTO"],
      entrada: { tipo: "CHAT_MESSAGES" },
      saida: { tipo: "TEXTO" },
      autenticacao: { tipo: "NENHUMA" },
      autorizado: true,
      prioridade: 5
    });
  }

  var reg = SOUSA_USB_SOUSA_IA_registrarAdaptador();
  check("adaptador", reg && reg.ok, JSON.stringify(reg));

  var conn = SOUSA_USB_SOUSA_IA_conectar(null, false);
  check("conectar_uniao", conn && conn.ok, JSON.stringify(conn));

  var st = SOUSA_USB_SOUSA_IA_status();
  check("status_natureza_uniao", st.natureza === "UNIAO_CASCATA", JSON.stringify(st.natureza));
  check("status_tem_fontes", (st.fontes_cascata || []).length > 0, "fontes=" + (st.fontes_cascata || []).map(function (f) { return f.id; }).join(","));

  var exec = SOUSA_API_EXECUTOR_UNIVERSAL(
    { recurso_escolhido: "SOUSA_IA" },
    { texto: "ping-sousa-ia" }
  );
  check(
    "executar_marca_sousa_ia",
    exec && exec.ok && exec.sousa_ia === true && exec.provedor === "SOUSA IA",
    JSON.stringify({
      ok: exec && exec.ok,
      provedor: exec && exec.provedor,
      backend: exec && exec.backend,
      preview: exec && exec.texto ? String(exec.texto).substring(0, 100) : null
    })
  );
  check(
    "backend_reportado",
    exec && exec.backend && exec.backend.id,
    exec && exec.backend ? JSON.stringify(exec.backend) : "ausente"
  );

  var falhas = logs.filter(function (x) { return !x.ok; });
  var rel = {
    ok: falhas.length === 0,
    total: logs.length,
    aprovados: logs.length - falhas.length,
    falhas: falhas,
    itens: logs,
    natureza: "UNIAO_CASCATA",
    timestamp: new Date().toISOString()
  };
  Logger.log("=== ENCAIXE SOUSA IA (UNIÃO) ===");
  Logger.log(JSON.stringify(rel, null, 2));
  return rel;
}

/** Alias de nome (compat) */
var SOUSA_USB_SOUSA_IA_conectar = SOUSA_USB_SOUSA_IA_conectar;
var SOUSA_USB_SOUSA_IA_status = SOUSA_USB_SOUSA_IA_status;
var testarEncaixeSousaIA = testarEncaixeSousaIA;
