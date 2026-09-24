/**
 * SOUSA 2.0 — USB BOOT
 * Primeira acao: IDENTIDADE. Sem isso, o SOUSA arrasta lixo de novo.
 */

var SOUSA_USB_BOOT_DONE = false;

function SOUSA_USB_boot(opcoes) {
  var opts = opcoes || {};

  var identidade = { ok: false, status: "IDENTIDADE_AUSENTE" };
  if (typeof SOUSA_IDENTIDADE_boot === "function") {
    identidade = SOUSA_IDENTIDADE_boot();
  }

  if (SOUSA_USB_BOOT_DONE && opts.forcar !== true) {
    return {
      ok: true,
      status: "BOOT_JA_FEITO",
      identidade: identidade,
      versao: typeof SOUSA_USB_VERSAO !== "undefined" ? SOUSA_USB_VERSAO : "1.0.1"
    };
  }

  if (typeof SOUSA_USB_ADAPTER_bootstrap === "function") {
    SOUSA_USB_ADAPTER_bootstrap();
  }

  var carregado = { ok: false, conectadas: 0 };
  if (typeof SOUSA_USB_REGISTRY_carregar === "function") {
    carregado = SOUSA_USB_REGISTRY_carregar();
  }

  var seed = null;
  var nMemoria = (typeof SOUSA_USB_listar === "function") ? SOUSA_USB_listar().length : 0;
  if (nMemoria === 0 && typeof SOUSA_USB_semearCascataLegada === "function") {
    seed = SOUSA_USB_semearCascataLegada();
    if (opts.persistir_seed === true && typeof SOUSA_USB_REGISTRY_salvar === "function") {
      SOUSA_USB_REGISTRY_salvar();
    }
  }

  SOUSA_USB_BOOT_DONE = true;

  return {
    ok: true,
    status: "USB_BOOT_OK",
    identidade: identidade,
    versao: typeof SOUSA_USB_VERSAO !== "undefined" ? SOUSA_USB_VERSAO : "1.0.1",
    persistencia: carregado,
    seed: seed
  };
}

function SOUSA_USB_bootSeguro(opcoes) {
  try {
    return SOUSA_USB_boot(opcoes);
  } catch (e) {
    return { ok: false, status: "USB_BOOT_ERRO", mensagem: e.message || String(e) };
  }
}
