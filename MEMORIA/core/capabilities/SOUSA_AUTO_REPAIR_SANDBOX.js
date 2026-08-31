'use strict';

/**
 * SOUSA 2.0 — AUTO REPAIR SANDBOX
 * Versão 1.0.0
 *
 * Fluxo:
 * ORIGINAL → SANDBOX → REPARO → TESTE → PROPOSTA
 *
 * NÃO altera produção.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const CONFIG = {
  version: '1.0.0',
  sandboxRoot: path.resolve(
    __dirname,
    '../../sandbox/repairs'
  ),
  maxAttempts: 3
};


function hashFile(filePath) {

  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex');
}


function createSandbox(sourceFile) {

  if (!fs.existsSync(sourceFile)) {
    throw new Error(
      `Arquivo não encontrado: ${sourceFile}`
    );
  }

  const timestamp =
    new Date().toISOString()
      .replace(/[:.]/g, '-');

  const id = `${path.basename(sourceFile)}-${timestamp}`;

  const sandboxDir =
    path.join(CONFIG.sandboxRoot, id);

  fs.mkdirSync(sandboxDir, {
    recursive: true
  });

  const sandboxFile =
    path.join(
      sandboxDir,
      path.basename(sourceFile)
    );

  fs.copyFileSync(
    sourceFile,
    sandboxFile
  );

  return {
    sandboxDir,
    sandboxFile,
    originalHash: hashFile(sourceFile),
    sandboxHash: hashFile(sandboxFile)
  };
}


function applyRepair(sandboxFile, repairedContent) {

  if (
    typeof repairedContent !== 'string' ||
    repairedContent.length === 0
  ) {
    throw new Error(
      'Conteúdo de reparo inválido.'
    );
  }

  fs.writeFileSync(
    sandboxFile,
    repairedContent,
    'utf8'
  );

  return {
    success: true,
    repairedHash: hashFile(sandboxFile)
  };
}


function syntaxTest(filePath) {

  const result = spawnSync(
    process.execPath,
    ['--check', filePath],
    {
      encoding: 'utf8'
    }
  );

  return {
    success: result.status === 0,
    exitCode: result.status,
    stdout: result.stdout?.trim() || '',
    stderr: result.stderr?.trim() || ''
  };
}


function createRepairProposal({
  sourceFile,
  sandboxFile,
  originalHash,
  repairedHash,
  test
}) {

  return {
    engine: 'SOUSA_AUTO_REPAIR_SANDBOX',
    version: CONFIG.version,
    timestamp: new Date().toISOString(),

    source: {
      file: path.resolve(sourceFile),
      hash: originalHash
    },

    sandbox: {
      file: path.resolve(sandboxFile),
      hash: repairedHash
    },

    validation: {
      syntax: test.success,
      stdout: test.stdout,
      stderr: test.stderr
    },

    promotion: {
      allowed: false,
      requiresValidator: true,
      requiresProductionApproval: true
    }
  };
}


function repair({
  sourceFile,
  repairedContent
}) {

  const sandbox =
    createSandbox(sourceFile);

  const repairResult =
    applyRepair(
      sandbox.sandboxFile,
      repairedContent
    );

  const test =
    syntaxTest(sandbox.sandboxFile);

  const proposal =
    createRepairProposal({
      sourceFile,
      sandboxFile: sandbox.sandboxFile,
      originalHash: sandbox.originalHash,
      repairedHash: repairResult.repairedHash,
      test
    });

  return {
    success: test.success,
    status: test.success
      ? 'REPAIR_VALIDATED_IN_SANDBOX'
      : 'REPAIR_FAILED',

    proposal
  };
}


module.exports = {
  CONFIG,
  hashFile,
  createSandbox,
  applyRepair,
  syntaxTest,
  repair
};