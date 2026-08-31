'use strict';

/**
 * SOUSA 2.0 — MAINTENANCE AGENT
 * Versão 1.1.0
 *
 * Função:
 * Preparar e coordenar missões de manutenção segura.
 *
 * Capacidades ampliadas:
 * - inspeção;
 * - diagnóstico;
 * - reparo;
 * - higienização;
 * - identificação de duplicidades;
 * - identificação de resíduos;
 * - identificação de arquivos de quarentena;
 * - identificação de possíveis órfãos;
 * - proposta de limpeza;
 * - Sandbox;
 * - validação.
 *
 * Segurança:
 * - não altera produção diretamente;
 * - não executa código recebido;
 * - não apaga arquivos automaticamente;
 * - trabalha com contexto controlado;
 * - entrega alterações ao Sandbox/Validator.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SelfTest = require('./SOUSA_SELF_TEST_REPAIR.js');
const Sandbox = require('./SOUSA_AUTO_REPAIR_SANDBOX.js');

const CONFIG = {
  version: '1.1.0',
  previousVersion: '1.0.0',
  maxAttempts: 3,
  mode: 'SAFE_SANDBOX',

  capabilities: {
    repair: true,
    hygiene: true,
    duplicateDetection: true,
    residueDetection: true,
    quarantineDetection: true,
    orphanDetection: true,
    noiseDetection: true,
    incompatibilityDetection: true
  },

  safety: {
    productionWrite: false,
    automaticDeletion: false,
    executeUnknownCode: false,
    sandboxFirst: true
  }
};


/**
 * Calcula SHA-256 de um arquivo.
 */
function hashFile(filePath) {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex');
}


/**
 * Lê o alvo para análise.
 */
function inspect(target) {

  const absoluteTarget = path.resolve(target);

  if (!fs.existsSync(absoluteTarget)) {
    throw new Error(
      `Arquivo não encontrado: ${absoluteTarget}`
    );
  }

  const content =
    fs.readFileSync(absoluteTarget, 'utf8');

  const test =
    SelfTest.run(absoluteTarget);

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
 * Inspeção de higiene do diretório do alvo.
 *
 * Esta função NÃO remove arquivos.
 * Apenas identifica candidatos para tratamento.
 */
function inspectHygiene(target) {

  const inspection = inspect(target);
  const directory = inspection.directory;

  const files =
    fs.readdirSync(directory, { withFileTypes: true })
      .filter(entry => entry.isFile())
      .map(entry => {
        const filePath =
          path.join(directory, entry.name);

        let hash = null;

        try {
          hash = hashFile(filePath);
        } catch (_) {
          hash = null;
        }

        return {
          name: entry.name,
          path: filePath,
          size: fs.statSync(filePath).size,
          hash
        };
      });

  const hashGroups = {};

  for (const file of files) {
    if (!file.hash) continue;

    if (!hashGroups[file.hash]) {
      hashGroups[file.hash] = [];
    }

    hashGroups[file.hash].push(file);
  }

  const duplicates =
    Object.values(hashGroups)
      .filter(group => group.length > 1);

  const quarantineCandidates =
    files.filter(file =>
      /quarantine|quarentena|\.quarantine|\.quarantine-/i
        .test(file.name)
    );

  const residueCandidates =
    files.filter(file =>
      /backup|bak|old|tmp|temp|copy|copia|\.pre-|\.auto-repair-/i
        .test(file.name)
    );

  const noiseCandidates =
    files.filter(file =>
      /\.log$|\.tmp$|\.temp$|~$|\.cache$/i
        .test(file.name)
    );

  const targetReferences =
    files.filter(file =>
      file.name !== inspection.name &&
      file.name.includes(
        path.basename(
          inspection.name,
          path.extname(inspection.name)
        )
      )
    );

  return {
    target: inspection.target,
    directory,
    inventory: {
      totalFiles: files.length,
      totalBytes:
        files.reduce(
          (sum, file) => sum + file.size,
          0
        )
    },

    duplicates: {
      detected: duplicates.length > 0,
      groups: duplicates
    },

    quarantine: {
      detected: quarantineCandidates.length > 0,
      candidates: quarantineCandidates
    },

    residues: {
      detected: residueCandidates.length > 0,
      candidates: residueCandidates
    },

    noise: {
      detected: noiseCandidates.length > 0,
      candidates: noiseCandidates
    },

    possibleOrphans: {
      detected: false,
      candidates: [],
      reason:
        'Necessita análise de referências/dependências antes de qualquer classificação definitiva.'
    },

    possibleIncompatibilities: {
      detected: false,
      candidates: [],
      reason:
        'A incompatibilidade deve ser confirmada por validação técnica.'
    },

    relatedFiles: targetReferences,

    safety: {
      automaticDeletion: false,
      productionWrite: false,
      sandboxFirst: true,
      requiresValidation: true
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
        inspection.size
    },

    hygiene,

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
      'PROPOSE_REPAIR_OR_HYGIENE',
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
  hashFile,
  inspect,
  inspectHygiene,
  createMission,
  submitRepair
};
