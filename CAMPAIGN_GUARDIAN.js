/**
 * SOUSA 2.0 — CAMPAIGN GUARDIAN
 * Barreira preventiva e monitoramento operacional de campanhas.
 */

function campaignGuardianCheck(context) {
  const result = {
    status: 'BLOCK',
    campaignId: context?.campaignId || null,
    reason: null,
    timestamp: new Date().toISOString()
  };

  if (!context) {
    result.reason = 'CONTEXT_REQUIRED';
    return result;
  }

  const required = [
    'campaignId',
    'platform',
    'identity',
    'action'
  ];

  const missing = required.filter(key =>
    context[key] === undefined ||
    context[key] === null ||
    context[key] === ''
  );

  if (missing.length > 0) {
    result.reason = 'MISSING_CONTEXT';
    result.missing = missing;
    return result;
  }

  result.status = 'ALLOW';
  result.reason = 'PRECHECK_PASSED';

  return result;
}

if (typeof module !== 'undefined') {
  module.exports = {
    campaignGuardianCheck
  };
}
