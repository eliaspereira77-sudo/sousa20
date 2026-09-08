'use strict';

/**
 * SOUSA 2.0 — MAINTENANCE AGENT
 * Versão 1.1.0
 *
 * Função:
 * Preparar missões de manutenção para agentes de engenharia.
 *
 * Segurança:
 * - não altera produção diretamente;
 * - não executa código recebido durante inspeção;
 * - trabalha com contexto controlado;
 * - reparos passam pelo Sandbox;
 * - promoção pertence ao fluxo superior de Auto Repair.
 */

const fs = require('fs');
const path = require('path');

const SelfTest = require('./SOUSA_SELF_TEST_REPAIR.js');
const Sandbox = require('./SOUSA_AUTO_REPAIR_SANDBOX.js');

const CONFIG = {
  version: '1.1.0',
  maxAttempts: 3,
  mode: 'SAFE_SANDBOX',
  productionWrite: false,
  sandboxFirst: true,
  automaticDeletion: false,
  requiresValidation: true,
  safety: {
    automaticDeletion: false
  }
};


/**
 * Inspeciona um arquivo sem disparar autorreparo.
 */
function inspect(target) {

  const absoluteTarget = path.resolve(target);

  if (!fs.existsSync(absoluteTarget)) {
    throw new Error(
      `Arquivo não encontrado: ${absoluteTarget}`
    );
  }

  const stat = fs.statSync(absoluteTarget);

  if (stat.isDirectory()) {
    throw new Error(
      `inspect() espera um arquivo. Use inspectHygiene() para diretórios: ${absoluteTarget}`
    );
  }

  const content =
    fs.readFileSync(absoluteTarget, 'utf8');

  const test =
    SelfTest.syntaxTest(absoluteTarget);

  return {
    target: absoluteTarget,
    directory: path.dirname(absoluteTarget),
    name: path.basename(absoluteTarget),
    extension: path.extname(absoluteTarget),
    size: content.length,
    content,
    test
  };
}


/**
 * Inspeção de higiene.
 *
 * Aceita arquivo OU diretório.
 * Não remove arquivos automaticamente.
 */
function inspectHygiene(target) {

  const absoluteTarget = path.resolve(target);

  if (!fs.existsSync(absoluteTarget)) {
    throw new Error(
      `Alvo não encontrado: ${absoluteTarget}`
    );
  }

  const stat = fs.statSync(absoluteTarget);

  const inspection = stat.isDirectory()
    ? {
        target: absoluteTarget,
        directory: absoluteTarget,
        name: path.basename(absoluteTarget),
        extension: '',
        size: 0,
        content: null,
        test: {
          success: true,
          skipped: true,
          reason: 'Alvo é diretório; teste de sintaxe não se aplica.'
        }
      }
    : inspect(absoluteTarget);

  const directory = inspection.directory;

  const files =
    fs.readdirSync(directory, { withFileTypes: true })
      .filter(entry => entry.isFile())
      .map(entry => entry.name);

  const backups =
    files.filter(name =>
      /backup|\.BACKUP_|\.auto-repair-backup-|\.pre-|\.restauracao-|\.OLD/i.test(name)
    );

  const sandboxes =
    files.filter(name =>
      /sandbox|\.auto-repair-sandbox-/i.test(name)
    );

  const tests =
    files.filter(name =>
      /TESTE|test/i.test(name)
    );

  return {
    ...inspection,

    hygiene: {
      directory,
      totalFiles: files.length,
      backups,
      sandboxes,
      tests,
      automaticDeletion: false,
      possibleOrphans: [],
      possibleIncompatibilities: []
    }
  };
}


/**
 * Cria uma missão para o agente de engenharia.
 */
function createMission({
  target,
  objective
}) {

  if (!objective) {
    throw new Error(
      'Objetivo da manutenção é obrigatório.'
    );
  }

  const inspection =
    inspect(target);

  const hygiene =
    inspectHygiene(target);

  return {
    agent: 'SOUSA_MAINTENANCE_AGENT',
    version: CONFIG.version,

    missionId:
      `MAINT-${Date.now()}`,

    target: inspection.target,

    objective,

    currentState: {
      syntaxHealthy:
        inspection.test.success,

      contentSize:
        inspection.size,

      hygiene: {
        totalFiles:
          hygiene.hygiene.totalFiles,

        backups:
          hygiene.hygiene.backups.length,

        sandboxes:
          hygiene.hygiene.sandboxes.length,

        tests:
          hygiene.hygiene.tests.length
      }
    },

    permissions: {
      read: true,
      sandboxWrite: true,
      productionWrite: false,
      executeUnknownCode: false,
      automaticDeletion: false
    },

    workflow: [
      'INSPECT',
      'DIAGNOSE',
      'CLASSIFY',
      'PROPOSE_REPAIR',
      'SANDBOX_TEST',
      'VALIDATE',
      'PROMOTE_PENDING'
    ]
  };
}


/**
 * Recebe uma proposta produzida pelo agente
 * de engenharia e a envia ao Sandbox.
 */
function submitRepair({
  target,
  repairedContent,
  objective
}) {

  const mission =
    createMission({
      target,
      objective
    });

  const result =
    Sandbox.repair({
      sourceFile: mission.target,
      repairedContent
    });

  return {
    mission,

    result,

    promotion: {
      allowed: false,
      reason:
        'A promoção depende do Validator e das políticas de produção.'
    }
  };
}


module.exports = {
  CONFIG,
  inspect,
  inspectHygiene,
  createMission,
  submitRepair
};

