'use strict';

/**
 * SOUSA 2.0 — AUTO REPAIR ENGINE
 * Versão 1.2.0
 *
 * Fluxo seguro:
 * DETECT -> PROPOSE -> SANDBOX -> VALIDATE -> BACKUP CONTROLADO
 *
 * Produção permanece protegida.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const CONFIG = {
  version: '1.2.0',
  maxAttempts: 3,
  automatic: true,
  productionWrite: false,
  sandboxFirst: true,
  backupAfterValidation: true
};

function syntaxTest(file) {
  const result = spawnSync(
    process.execPath,
    ['--check', file],
    {
      encoding: 'utf8',
      windowsHide: true
    }
  );

  return {
    success: result.status === 0,
    exitCode: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || ''
  };
}

function deterministicRepair(content) {
  const lines = content.split(/\r?\n/);

  let changed = false;
  const repairs = [];

  const repairedLines = lines.map((line, index) => {
    const trimmed = line.trim();

    const match = trimmed.match(
      /^(console\.log\s*\(\s*["'].*["']\s*);$/
    );

    if (!match) {
      return line;
    }

    const indentation =
      line.match(/^\s*/)?.[0] || '';

    const repaired =
      `${indentation}${trimmed.slice(0, -1)});`;

    changed = true;

    repairs.push({
      line: index + 1,
      type: 'MISSING_CLOSING_PARENTHESIS',
      before: line,
      after: repaired
    });

    return repaired;
  });

  return {
    changed,
    content: repairedLines.join('\n'),
    reason: changed
      ? 'FIXED_DETERMINISTIC_CONSOLE_LOG_PARENTHESES'
      : 'NO_DETERMINISTIC_REPAIR',
    repairs
  };
}

function createBackup(file) {
  const backup =
    `${file}.auto-repair-backup-${Date.now()}`;

  fs.copyFileSync(file, backup);

  return backup;
}

function createSandboxFile(file, content) {
  const sandboxFile =
    `${file}.auto-repair-sandbox-${Date.now()}.js`;

  fs.writeFileSync(
    sandboxFile,
    content,
    'utf8'
  );

  return sandboxFile;
}

function cleanupSandbox(file) {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  } catch (_) {}
}

function repair(target) {
  const absoluteTarget =
    path.resolve(target);

  if (!fs.existsSync(absoluteTarget)) {
    throw new Error(
      `Arquivo não encontrado: ${absoluteTarget}`
    );
  }

  const original =
    fs.readFileSync(
      absoluteTarget,
      'utf8'
    );

  const before =
    syntaxTest(absoluteTarget);

  if (before.success) {
    return {
      success: true,
      status: 'HEALTHY_NO_REPAIR_REQUIRED',
      target: absoluteTarget,
      before,
      repair: {
        executed: false,
        reason: 'Arquivo já possui sintaxe válida.'
      }
    };
  }

  /*
   * PRIMEIRO: descobrir se existe reparo seguro.
   * Nenhum backup é criado antes desta etapa.
   */
  const proposal =
    deterministicRepair(original);

  if (!proposal.changed) {
    return {
      success: false,
      status: 'REPAIR_PROPOSAL_REQUIRED',
      target: absoluteTarget,
      before,
      repair: {
        executed: false,
        reason:
          'Erro detectado, mas nenhum reparo determinístico seguro foi encontrado.'
      }
    };
  }

  /*
   * SEGUNDO: testar a proposta isoladamente.
   */
  const sandboxFile =
    createSandboxFile(
      absoluteTarget,
      proposal.content
    );

  const after =
    syntaxTest(sandboxFile);

  /*
   * Se falhar, o sandbox é removido.
   * Nenhum backup foi criado.
   */
  if (!after.success) {
    cleanupSandbox(sandboxFile);

    return {
      success: false,
      status: 'REPAIR_FAILED_VALIDATION',
      target: absoluteTarget,
      before,
      after,
      repair: {
        executed: false,
        reason:
          'A proposta não passou no teste de sintaxe.',
        repairs:
          proposal.repairs
      }
    };
  }

  /*
   * TERCEIRO: somente após a validação,
   * registrar o backup controlado.
   */
  const backup =
    createBackup(absoluteTarget);

  /*
   * O arquivo original NÃO é alterado.
   * A promoção continua bloqueada.
   */
  return {
    success: true,
    status: 'REPAIR_VALIDATED_PENDING_PROMOTION',

    target: absoluteTarget,

    backup,

    sandboxFile,

    before,

    after,

    repair: {
      executed: true,
      reason: proposal.reason,
      repairs: proposal.repairs
    },

    promotion: {
      allowed: false,
      reason:
        'Reparo validado no Sandbox. Promoção para produção permanece bloqueada.'
    }
  };
}

module.exports = {
  CONFIG,
  syntaxTest,
  deterministicRepair,
  repair
};
