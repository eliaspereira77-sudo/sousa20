'use strict';

/**
 * SOUSA 2.0 — MAINTENANCE ORCHESTRATOR
 * Versão 1.1.0
 *
 * Orquestração de alto nível da manutenção.
 *
 * FLUXO:
 * TEAM_TRIGGER
 *   ↓
 * MAINTENANCE_ORCHESTRATOR
 *   ↓
 * AUTO_REPAIR_COORDINATOR 1.1.0
 *   ↓
 * DETECT → DIAGNOSE → BACKUP → PROPOSE
 *   ↓
 * SANDBOX → VALIDATE
 *   ↓
 * PROMOTION_BLOCKED
 *
 * Produção permanece protegida.
 */

const fs = require('fs');
const path = require('path');

const Coordinator =
  require('./SOUSA_AUTO_REPAIR_COORDINATOR.js');

const CONFIG = {
  version: '1.1.0',
  coordinatorVersion: Coordinator.CONFIG.version,
  automatic: Coordinator.CONFIG.automatic,
  sandboxFirst: Coordinator.CONFIG.sandboxFirst,
  productionWrite: Coordinator.CONFIG.productionWrite,
  automaticPromotion: Coordinator.CONFIG.automaticPromotion
};


/**
 * Verifica se o alvo existe.
 */
function validateTarget(target) {

  if (!target) {
    throw new Error('Target obrigatório.');
  }

  const absolute = path.resolve(target);

  if (!fs.existsSync(absolute)) {
    throw new Error(
      `Target não encontrado: ${absolute}`
    );
  }

  return absolute;
}


/**
 * Diagnóstico delegado ao Coordinator.
 *
 * Mantém a função pública para compatibilidade
 * com módulos que já utilizam o Orchestrator.
 */
function diagnose(target) {

  const absoluteTarget =
    validateTarget(target);

  return Coordinator.execute({
    event: 'SOUSA_DIAGNOSTIC_REQUEST_V1_1',
    target: absoluteTarget,
    objective:
      'Diagnosticar o alvo e determinar se manutenção é necessária.'
  });
}


/**
 * Execução principal da missão de manutenção.
 *
 * O Coordinator 1.1.0 passa a ser o núcleo da cadeia.
 */
function executeMission({
  target,
  repairedContent = null,
  event = 'SOUSA_MAINTENANCE_MISSION_V1_1',
  objective = 'Diagnosticar, reparar deterministicamente, validar em Sandbox e proteger a produção.'
}) {

  const startedAt =
    new Date().toISOString();

  const absoluteTarget =
    validateTarget(target);

  /*
   * Compatibilidade:
   *
   * repairedContent permanece aceito no contrato,
   * mas o novo fluxo automático não depende dele.
   *
   * O Coordinator/Engine é responsável pelo reparo
   * determinístico quando houver capacidade conhecida.
   */

  const result =
    Coordinator.execute({
      event,
      target: absoluteTarget,
      objective
    });

  return {
    ...result,

    orchestrator: {
      name: 'SOUSA_MAINTENANCE_ORCHESTRATOR',
      version: CONFIG.version,
      coordinatorVersion: CONFIG.coordinatorVersion
    },

    compatibility: {
      repairedContentProvided:
        typeof repairedContent === 'string' &&
        repairedContent.length > 0,

      automaticCoordinator:
        CONFIG.automatic
    },

    safety: {
      productionWrite:
        CONFIG.productionWrite,

      sandboxFirst:
        CONFIG.sandboxFirst,

      automaticPromotion:
        CONFIG.automaticPromotion
    },

    startedAt,
    finishedAt:
      new Date().toISOString()
  };
}


module.exports = {
  CONFIG,
  validateTarget,
  diagnose,
  executeMission
};
