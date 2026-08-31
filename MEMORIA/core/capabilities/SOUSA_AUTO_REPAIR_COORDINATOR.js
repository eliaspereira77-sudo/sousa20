'use strict';

/**
 * SOUSA 2.0 — AUTO REPAIR COORDINATOR
 * Versão 1.2.0
 *
 * Coordena:
 * EQUIPE -> DIAGNÓSTICO -> HIGIENIZAÇÃO -> REPARO
 * -> SANDBOX -> VALIDAÇÃO -> PROMOÇÃO BLOQUEADA
 *
 * O Maintenance Agent identifica oportunidades de
 * higienização e ampliação de capacidade.
 *
 * O Auto Repair Engine executa apenas reparos
 * determinísticos conhecidos.
 *
 * Produção permanece protegida.
 */

const MaintenanceAgent =
  require('./SOUSA_MAINTENANCE_AGENT.js');

const AutoRepair =
  require('./SOUSA_AUTO_REPAIR_ENGINE.js');

const CONFIG = {
  version: '1.2.0',
  previousVersion: '1.1.1',
  engineVersion: AutoRepair.CONFIG.version,
  maintenanceAgentVersion: MaintenanceAgent.CONFIG.version,

  automatic: true,
  sandboxFirst: true,
  productionWrite: false,
  automaticPromotion: false,

  teamTriggerDependency: false
};


/**
 * Executa uma missão coordenada.
 */
function execute({
  event = 'AUTO_REPAIR_EVENT',
  target,
  objective =
    'Diagnosticar, classificar oportunidades de manutenção, reparar deterministicamente e proteger a produção.'
}) {

  if (!target) {
    throw new Error('Target obrigatório.');
  }

  /*
   * 1. O Maintenance Agent inspeciona o alvo
   *    e identifica oportunidades de higiene.
   */
  const maintenance =
    MaintenanceAgent.createMission({
      target,
      objective
    });

  /*
   * 2. O Engine executa somente o reparo
   *    determinístico que já conhece.
   */
  const repair =
    AutoRepair.repair(
      maintenance.target
    );

  /*
   * 3. O resultado da manutenção passa a fazer
   *    parte formal da missão do Coordinator.
   */
  return {
    success: repair.success,

    version: CONFIG.version,

    engineVersion:
      CONFIG.engineVersion,

    maintenanceAgentVersion:
      CONFIG.maintenanceAgentVersion,

    automatic:
      CONFIG.automatic,

    event,

    objective,

    target:
      maintenance.target,

    maintenance: {
      missionId:
        maintenance.missionId,

      currentState:
        maintenance.currentState,

      hygiene:
        maintenance.hygiene,

      permissions:
        maintenance.permissions,

      workflow:
        maintenance.workflow
    },

    repair,

    chain: [
      'TEAM_ACTIVATED',
      'INSPECT',
      'DETECT',
      'DIAGNOSE',
      'CLASSIFY',
      'BACKUP',
      'PROPOSE_REPAIR_OR_HYGIENE',
      'SANDBOX',
      'VALIDATE',
      'PROMOTION_BLOCKED'
    ],

    responsibilities: {
      caoDeGuarda:
        'integridade',

      sousaileon:
        'coordenação_da_manutencao',

      mecanico: [
        'reparo',
        'faxina_higienizacao',
        'limpeza_componentes',
        'organizacao_residuos'
      ],

      monitorSintaxe:
        'validacao_sintatica',

      orquestrador:
        'coordenacao_do_fluxo'
    },

    safety: {
      productionWrite:
        CONFIG.productionWrite,

      sandboxFirst:
        CONFIG.sandboxFirst,

      automaticPromotion:
        CONFIG.automaticPromotion,

      automaticDeletion:
        MaintenanceAgent.CONFIG.safety.automaticDeletion
    }
  };
}


module.exports = {
  CONFIG,
  execute
};
