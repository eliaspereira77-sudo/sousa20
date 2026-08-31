/**
 * SOUSA 2.0 — SINCRONIZADOR DE ESTADO COM A NUVEM
 * Camada neutra: não contém credenciais e não executa deploy automático.
 * Usa a persistência oficial do Drive já presente no projeto.
 */

function SOUSA_NUVEM_sincronizarEstado(chave, payload, opcoes) {
  if (typeof SOUSA_DRIVE_salvarEstado !== "function") {
    return { ok: false, status: "PERSISTENCIA_DRIVE_AUSENTE" };
  }
  return SOUSA_DRIVE_salvarEstado(chave, payload, opcoes || {});
}

function SOUSA_NUVEM_recuperarEstado(chave) {
  if (typeof SOUSA_DRIVE_carregarEstado !== "function") {
    return { ok: false, status: "PERSISTENCIA_DRIVE_AUSENTE" };
  }
  return SOUSA_DRIVE_carregarEstado(chave);
}

function SOUSA_NUVEM_registrarConvergencia(manifesto) {
  return SOUSA_NUVEM_sincronizarEstado("CONVERGENCIA_99_99", manifesto, { manterHistorico: true });
}
