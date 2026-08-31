'use strict';

/**
 * SOUSA 2.0 — SELF TEST / REPAIR
 * Versão 1.1.0
 *
 * Camada de diagnóstico integrada ao
 * SOUSA AUTO REPAIR ENGINE 1.1.0.
 *
 * Fluxo:
 * DETECT -> DIAGNOSE -> AUTO REPAIR
 * -> BACKUP -> SANDBOX -> VALIDATE
 *
 * Produção permanece protegida.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const AutoRepair = require('./SOUSA_AUTO_REPAIR_ENGINE.js');

const CONFIG = {
  version: '1.1.0',
  maxAttempts: 3,
  nodeCommand: process.execPath,
  automaticRepair: true,
  sandboxFirst: true,
  productionWrite: false,
  automaticPromotion: false
};

function syntaxTest(filePath) {

  if (!fs.existsSync(filePath)) {
    return {
      success: false,
      type: 'FILE_NOT_FOUND',
      file: filePath
    };
  }

  const result = spawnSync(
    CONFIG.nodeCommand,
    ['--check', filePath],
    {
      encoding: 'utf8',
      windowsHide: true
    }
  );

  return {
    success: result.status === 0,
    type: 'SYNTAX_TEST',
    file: filePath,
    exitCode: result.status,
    stdout: result.stdout?.trim() || '',
    stderr: result.stderr?.trim() || ''
  };
}

function diagnose(testResult) {

  if (testResult.success) {
    return {
      status: 'HEALTHY',
      diagnosis: 'Nenhum erro encontrado no teste realizado.'
    };
  }

  return {
    status: 'ERROR',
    diagnosis: 'Falha detectada durante o teste.',
    details: testResult.stderr || testResult.stdout
  };
}

function run(filePath) {

  const absoluteTarget = path.resolve(filePath);
  const reports = [];

  for (
    let attempt = 1;
    attempt <= CONFIG.maxAttempts;
    attempt++
  ) {

    const test = syntaxTest(absoluteTarget);
    const diagnosis = diagnose(test);

    reports.push({
      engine: 'SOUSA_SELF_TEST_REPAIR',
      version: CONFIG.version,
      timestamp: new Date().toISOString(),
      target: absoluteTarget,
      attempt,
      test,
      diagnosis
    });

    if (test.success) {

      return {
        success: true,
        status: 'PASS',
        attempts: attempt,
        reports,
        repair: {
          executed: false,
          reason: 'Arquivo já possui sintaxe válida.'
        },
        safety: {
          productionWrite: CONFIG.productionWrite,
          sandboxFirst: CONFIG.sandboxFirst,
          automaticPromotion: CONFIG.automaticPromotion
        }
      };
    }

    const repair = AutoRepair.repair(absoluteTarget);

    return {
      success: repair.success,
      status: repair.success
        ? 'REPAIR_VALIDATED_PENDING_PROMOTION'
        : repair.status,
      attempts: attempt,
      reports,
      repair,
      safety: {
        productionWrite: CONFIG.productionWrite,
        sandboxFirst: CONFIG.sandboxFirst,
        automaticPromotion: CONFIG.automaticPromotion
      }
    };
  }

  return {
    success: false,
    status: 'REPAIR_REQUIRED',
    attempts: reports.length,
    reports
  };
}

module.exports = {
  CONFIG,
  syntaxTest,
  diagnose,
  run
};
