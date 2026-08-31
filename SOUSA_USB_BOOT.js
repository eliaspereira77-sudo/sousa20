/**
 * ==========================================================
 * SOUSA 2.0 — USB BOOT (integração Lab)
 * USB Universal v1.0.1 — 2026-08-10
 * ==========================================================
 * Chamada única no início do fluxo do Lab.
 * Não altera Produção. Não reescreve o Core inteiro.
 *
 * Uso no Core do LAB (uma linha, cedo no doPost/doGet ou no boot):
 *   SOUSA_USB_boot();
 *
 * Ou no onOpen / função de setup do Lab.
 * ==========================================================
 */

var SOUSA_USB_BOOT_DONE = false;

/**
 * Inicializa adaptadores, carrega registry persistido,
 * se vazio semeia cascata legada, e marca boot feito.
 * Idempotente na mesma execução de script.
 */
function SOUSA_USB_boot(opcoes) {
  var opts = opcoes || {};
  if (SOUSA_USB_BOOT_DONE && opts.forcar !== true) {
    return {
      ok: true,
      status: "BOOT_JA_FEITO",
      versao: typeof SOUSA_USB_VERSAO !== "undefined" ? SOUSA_USB_VERSAO : "1.0.1"
    };
  }

  // 1) Adaptadores de protocolo
  if (typeof SOUSA_USB_ADAPTER_bootstrap === "function") {
    SOUSA_USB_ADAPTER_bootstrap();
  }
  // 1b) Encaixe Sousa IA (marca própria) — só registra adaptador; conectar é explícito ou via seed
  if (typeof SOUSA_USB_SOUSA_IA_registrarAdaptador === "function") {
    SOUSA_USB_SOUSA_IA_registrarAdaptador();
  }
  if (typeof SOUSA_IA_VOZ_bootstrapAdaptadores === "function") {
    SOUSA_IA_VOZ_bootstrapAdaptadores();
  }
  if (typeof SOUSA_STT_bootstrapAdaptadores === "function") {
    SOUSA_STT_bootstrapAdaptadores();
  }
  if (typeof SOUSA_TTS_PIPER_bootstrapAdaptadores === "function") {
    SOUSA_TTS_PIPER_bootstrapAdaptadores();
  }

  // 2) Tentar carregar USBs persistidas
  var carregado = { ok: false, conectadas: 0 };
  if (typeof SOUSA_USB_REGISTRY_carregar === "function") {
    carregado = SOUSA_USB_REGISTRY_carregar();
  }

  // 3) Se registry vazio, semear cascata legada
  var seed = null;
  var nMemoria = (typeof SOUSA_USB_listar === "function") ? SOUSA_USB_listar().length : 0;
  if (nMemoria === 0 && typeof SOUSA_USB_semearCascataLegada === "function") {
    seed = SOUSA_USB_semearCascataLegada();
    // Opcional: persistir a semente para próximas execuções
    if (opts.persistir_seed === true && typeof SOUSA_USB_REGISTRY_salvar === "function") {
      SOUSA_USB_REGISTRY_salvar();
    }
  }

  SOUSA_USB_BOOT_DONE = true;

  return {
    ok: true,
    status: "USB_BOOT_OK",
    versao: typeof SOUSA_USB_VERSAO !== "undefined" ? SOUSA_USB_VERSAO : "1.0.1",
    persistencia: carregado,
    seed: seed,
    usbs_operacionais: (typeof SOUSA_USB_listar === "function")
      ? SOUSA_USB_listar({ apenas_operacional: true }).map(function (u) {
          return { id: u.id, protocolo: u.protocolo, prioridade: u.prioridade };
        })
      : []
  };
}

/**
 * Ponto de chamada seguro para o Core Lab.
 * Nunca lança — retorna status mesmo em falha.
 */
function SOUSA_USB_bootSeguro(opcoes) {
  try {
    return SOUSA_USB_boot(opcoes);
  } catch (e) {
    return {
      ok: false,
      status: "USB_BOOT_ERRO",
      mensagem: e.message || String(e)
    };
  }
}

/**
 * Trecho de referência para colar no Core do LAB (NÃO na Produção).
 *
 * Dentro de doPost / roteador, ANTES de chamar API:
 *
 *   // --- USB Universal (Lab) ---
 *   if (typeof SOUSA_USB_bootSeguro === "function") {
 *     SOUSA_USB_bootSeguro();
 *   }
 *   // -------------------------
 *
 * Para chat/texto via cascata dinâmica:
 *
 *   var r = SOUSA_API_EXECUTOR_COM_CASCATA("TEXTO", {
 *     systemInstruction: systemInstruction,
 *     history: history
 *   });
 *   if (r && r.ok) { texto = r.texto; provedor = r.provedor; }
 */
function SOUSA_USB_documentarIntegracaoCore() {
  return {
    arquivo: "SOUSA_USB_BOOT.gs",
    onde: "Lab Core — início de doPost/doGet ou setup",
    chamada: "SOUSA_USB_bootSeguro()",
    producao: "NÃO colar em Produção até homologação explícita"
  };
}
