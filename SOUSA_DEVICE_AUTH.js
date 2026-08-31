/**
 * ==========================================================
 * SOUSA 2.0 — AUTENTICAÇÃO DE DISPOSITIVOS & LOG DE SEGURANÇA
 * ==========================================================
 */

var AUTHORIZED_DEVICES = [
  { device_id: "PC-ESCOLA-001", status: "CONDICIONAL", tipo: "DESKTOP" },
  { device_id: "ANDROID-001", status: "ATIVO", tipo: "ANDROID" }
];

function S20_validarDevice(deviceId) {
  var dev = AUTHORIZED_DEVICES.find(function(d) { return d.device_id === deviceId; });
  if (!dev) return { autorizado: false, motivo: "DEVICE_NAO_CADASTRADO" };
  return { autorizado: true, device: dev };
}

function S20_registrarLogSeguranca(deviceId, sessionId, resultado, motivo) {
  var evento = {
    data: new Date().toISOString(),
    device_id: deviceId || "N/A",
    session_id: sessionId || "N/A",
    resultado: resultado,
    motivo: motivo
  };
  return { ok: true, evento: evento };
}
