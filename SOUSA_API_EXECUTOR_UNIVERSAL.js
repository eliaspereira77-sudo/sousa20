/**
 * ==========================================================
 * SOUSA 2.0 — EXECUTOR UNIVERSAL (núcleo por contrato)
 * ==========================================================
 * NÃO contém if/switch de fornecedor.
 * Fluxo:
 *   seleção (USB id ou capacidade)
 *     → obter USB do registry
 *     → validar estado OPERACIONAL
 *     → obter adaptador pelo protocolo
 *     → adaptador.execute(usb, contexto)
 *
 * Novo provedor compatível = SOUSA_USB_conectar(contrato)
 * sem alterar este arquivo.
 * ==========================================================
 */

/**
 * Executa a partir de uma seleção { recurso_escolhido: id } ou USB direta.
 */
function SOUSA_API_EXECUTOR_UNIVERSAL(selecao, contexto) {
  // Bootstrap defensivo (idempotente)
  if (typeof SOUSA_USB_ADAPTER_listar === "function" && SOUSA_USB_ADAPTER_listar().length === 0) {
    if (typeof SOUSA_USB_ADAPTER_bootstrap === "function") SOUSA_USB_ADAPTER_bootstrap();
  }

  if (!selecao) {
    return { ok: false, status: "SELECAO_INVALIDA", mensagem: "Seleção ausente." };
  }

  var usb = null;

  // Caminho 1: seleção já traz usb
  if (selecao.usb && selecao.usb.id) {
    usb = selecao.usb;
  }
  // Caminho 2: id no registry
  else if (selecao.recurso_escolhido && typeof SOUSA_USB_obter === "function") {
    usb = SOUSA_USB_obter(selecao.recurso_escolhido);
  }

  // Caminho 3: compat legado — preparar via cascata estática se registry vazio
  if (!usb && selecao.recurso_escolhido && typeof SOUSA_API_USB_preparar === "function") {
    var prep = SOUSA_API_USB_preparar(selecao);
    if (prep && prep.ok) {
      // materializa USB mínima a partir do preparado legado
      usb = SOUSA_USB_normalizar({
        id: prep.provedor,
        provedor: prep.provedor,
        protocolo: prep.protocolo,
        capacidades: ["TEXTO"],
        entrada: { tipo: "CHAT_MESSAGES" },
        saida: { tipo: "TEXTO" },
        autenticacao: prep.api_key
          ? { tipo: prep.protocolo === "GEMINI_GENERATE_CONTENT" ? "QUERY_KEY_COFRE" : "BEARER_COFRE", chave_cofre: prep.api_key }
          : { tipo: "NENHUMA" },
        modelo: prep.modelo,
        endpoint: prep.endpoint,
        autorizado: true,
        estado: SOUSA_USB_ESTADOS.OPERACIONAL
      });
    } else if (prep) {
      return prep;
    }
  }

  if (!usb) {
    return {
      ok: false,
      status: "USB_NAO_ENCONTRADA",
      recurso: selecao.recurso_escolhido || null,
      mensagem: "Nenhuma USB conectada com este id. Use SOUSA_USB_conectar() ou semeie a cascata."
    };
  }

  if (!usb.protocolo || String(usb.protocolo).trim() === "") {
    return {
      ok: false,
      status: "PROTOCOLO_AUSENTE",
      id: usb.id || null,
      provedor: usb.provedor || null,
      mensagem: "USB sem protocolo — contrato incompleto."
    };
  }

  if (usb.estado && usb.estado !== SOUSA_USB_ESTADOS.OPERACIONAL && usb.estado !== SOUSA_USB_ESTADOS.CONECTADA && usb.estado !== SOUSA_USB_ESTADOS.AUTORIZADA) {
    // ainda permite se autorizado implicitamente no objeto materializado
    if (usb.autorizado !== true) {
      return {
        ok: false,
        status: "USB_NAO_OPERACIONAL",
        estado: usb.estado,
        id: usb.id,
        mensagem: "USB compatível mas não operacional/autorizada."
      };
    }
  }

  var adapter = SOUSA_USB_ADAPTER_obter(usb.protocolo);
  if (!adapter) {
    return {
      ok: false,
      status: "PROTOCOLO_SEM_ADAPTADOR",
      protocolo: usb.protocolo,
      provedor: usb.provedor,
      mensagem: "Registre um adaptador com SOUSA_USB_ADAPTER_registrar() para este protocolo."
    };
  }

  try {
    return adapter.execute(usb, contexto || {});
  } catch (erro) {
    return {
      ok: false,
      status: "ERRO_ADAPTADOR",
      provedor: usb.provedor,
      protocolo: usb.protocolo,
      mensagem: erro.message || String(erro)
    };
  }
}

/**
 * Execução com cascata/fallback dinâmico por capacidade.
 * A → falha → B → ...
 */
function SOUSA_API_EXECUTOR_COM_CASCATA(capacidade, contexto, opcoes) {
  var opts = opcoes || {};
  var lista = typeof SOUSA_USB_listar === "function"
    ? SOUSA_USB_listar({ apenas_operacional: true })
    : [];

  var cap = String(capacidade || "TEXTO").toUpperCase();
  lista = lista.filter(function (u) {
    return (u.capacidades || []).some(function (c) {
      return String(c).toUpperCase() === cap;
    });
  });

  // Política de disponibilidade: recursos em cooldown não participam da cascata.
  if (typeof SOUSA_POLITICA_cooldown === "function") {
    lista = lista.filter(function (u) {
      return !SOUSA_POLITICA_cooldown(u.id);
    });
  }

  // Mantém prioridade menor = maior prioridade.
  lista.sort(function (a, b) {
    return (a.prioridade || 100) - (b.prioridade || 100);
  });

  if (lista.length === 0 && typeof SOUSA_USB_semearCascataLegada === "function") {
    SOUSA_USB_ADAPTER_bootstrap();
    SOUSA_USB_semearCascataLegada();
    lista = SOUSA_USB_listar({ apenas_operacional: true }).filter(function (u) {
      return (u.capacidades || []).some(function (c) {
        return String(c).toUpperCase() === cap;
      });
    });
  }

  var tentativas = [];
  for (var i = 0; i < lista.length; i++) {
    var usb = lista[i];
    var resultado = SOUSA_API_EXECUTOR_UNIVERSAL({ recurso_escolhido: usb.id, usb: usb }, contexto);
    tentativas.push({
      id: usb.id,
      provedor: usb.provedor,
      ok: !!(resultado && resultado.ok),
      status: resultado && resultado.status
    });
    if (resultado && resultado.ok) {
      resultado.cascata = { tentativas: tentativas, vencedor: usb.id };
      return resultado;
    }
    if (opts.parar_em && resultado && opts.parar_em.indexOf(resultado.status) !== -1) {
      break;
    }
  }

  return {
    ok: false,
    status: "CASCATA_ESGOTADA",
    capacidade: cap,
    tentativas: tentativas,
    mensagem: "Nenhum recurso USB operacional respondeu com sucesso."
  };
}

/** Alias legado */
function SOUSA_API_EXECUTOR_normalizarContexto(contexto) {
  return SOUSA_USB_normalizarContexto(contexto);
}

