/**
 * ==========================================================
 * SOUSA 2.0 — USB REGISTRY PERSISTÊNCIA
 * USB Universal v1.0.1 — 2026-08-10
 * ==========================================================
 * Grava / carrega USBs conectadas em ScriptProperties.
 * Chave: SOUSA_USB_REGISTRY_JSON
 *
 * Não persiste segredos — só contrato (nomes de chave no Cofre).
 * ==========================================================
 */

var SOUSA_USB_REGISTRY_PROP_KEY = "SOUSA_USB_REGISTRY_JSON";

/**
 * Serializa USBs do registry (sem valores de credencial).
 */
function SOUSA_USB_REGISTRY_serializar() {
  var lista = [];
  if (typeof SOUSA_USB_REGISTRY_STORE === "undefined" || !SOUSA_USB_REGISTRY_STORE) {
    return "[]";
  }
  Object.keys(SOUSA_USB_REGISTRY_STORE).forEach(function (id) {
    var u = SOUSA_USB_REGISTRY_STORE[id];
    // Nunca persistir valor de chave — só referência no Cofre
    lista.push({
      id: u.id,
      provedor: u.provedor,
      protocolo: u.protocolo,
      capacidades: u.capacidades,
      entrada: u.entrada,
      saida: u.saida,
      autenticacao: u.autenticacao, // { tipo, chave_cofre } — nome, não valor
      estado: u.estado,
      modelo: u.modelo,
      endpoint: u.endpoint,
      prioridade: u.prioridade,
      timeout_ms: u.timeout_ms,
      retry: u.retry,
      limites: u.limites,
      versao: u.versao,
      metadados: u.metadados,
      autorizado: u.autorizado === true
    });
  });
  return JSON.stringify(lista);
}

/**
 * Salva registry atual no Cofre (ScriptProperties).
 */
function SOUSA_USB_REGISTRY_salvar() {
  try {
    var json = SOUSA_USB_REGISTRY_serializar();
    PropertiesService.getScriptProperties().setProperty(SOUSA_USB_REGISTRY_PROP_KEY, json);
    return {
      ok: true,
      status: "REGISTRY_SALVO",
      bytes: json.length,
      usbs: JSON.parse(json).length
    };
  } catch (e) {
    return { ok: false, status: "ERRO_SALVAR", mensagem: e.message || String(e) };
  }
}

/**
 * Carrega USBs persistidas e reconecta via contrato.
 * Não executa — só engata no registry em memória.
 */
function SOUSA_USB_REGISTRY_carregar() {
  try {
    var json = PropertiesService.getScriptProperties().getProperty(SOUSA_USB_REGISTRY_PROP_KEY);
    if (!json) {
      return { ok: true, status: "REGISTRY_VAZIO", conectadas: 0 };
    }
    var lista = JSON.parse(json);
    if (!Array.isArray(lista)) {
      return { ok: false, status: "REGISTRY_CORRUPTO", mensagem: "JSON não é array" };
    }
    var conectadas = 0;
    var rejeitadas = [];
    lista.forEach(function (item) {
      // Reconecta pelo contrato — validação completa de novo
      var r = SOUSA_USB_conectar(item);
      if (r.ok) conectadas++;
      else rejeitadas.push({ id: item.id, motivo: r.motivo || r.status });
    });
    return {
      ok: true,
      status: "REGISTRY_CARREGADO",
      conectadas: conectadas,
      rejeitadas: rejeitadas
    };
  } catch (e) {
    return { ok: false, status: "ERRO_CARREGAR", mensagem: e.message || String(e) };
  }
}

/**
 * Apaga persistência (não mexe no registry em memória).
 */
function SOUSA_USB_REGISTRY_limparPersistencia() {
  try {
    PropertiesService.getScriptProperties().deleteProperty(SOUSA_USB_REGISTRY_PROP_KEY);
    return { ok: true, status: "PERSISTENCIA_LIMPA" };
  } catch (e) {
    return { ok: false, status: "ERRO_LIMPAR", mensagem: e.message || String(e) };
  }
}

/**
 * Conectar + salvar (atalho operacional).
 */
function SOUSA_USB_conectarEPersistir(usbBruta) {
  var r = SOUSA_USB_conectar(usbBruta);
  if (r.ok) {
    var s = SOUSA_USB_REGISTRY_salvar();
    r.persistencia = s;
  }
  return r;
}

/**
 * Desconectar + salvar.
 */
function SOUSA_USB_desconectarEPersistir(id) {
  var r = SOUSA_USB_desconectar(id);
  if (r.ok) {
    r.persistencia = SOUSA_USB_REGISTRY_salvar();
  }
  return r;
}
