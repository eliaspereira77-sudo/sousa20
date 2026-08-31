const STATES = Object.freeze({
  CREATED: 'CREATED',
  GUARDIAN_APPROVED: 'GUARDIAN_APPROVED',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  BLOCKED: 'BLOCKED',
  FAILED: 'FAILED'
});

const TRANSITIONS = Object.freeze({
  CREATED: ['GUARDIAN_APPROVED', 'BLOCKED'],
  GUARDIAN_APPROVED: ['RUNNING', 'BLOCKED'],
  RUNNING: ['PAUSED', 'COMPLETED', 'FAILED'],
  PAUSED: ['RUNNING', 'BLOCKED'],
  COMPLETED: [],
  BLOCKED: [],
  FAILED: ['RUNNING', 'BLOCKED']
});

function transitionCampaignState(currentState, nextState) {
  if (!STATES[currentState]) {
    return { ok: false, reason: 'INVALID_CURRENT_STATE' };
  }

  if (!STATES[nextState]) {
    return { ok: false, reason: 'INVALID_NEXT_STATE' };
  }

  if (!TRANSITIONS[currentState].includes(nextState)) {
    return {
      ok: false,
      reason: 'TRANSITION_NOT_ALLOWED',
      currentState,
      nextState
    };
  }

  return {
    ok: true,
    from: currentState,
    to: nextState
  };
}

module.exports = {
  STATES,
  transitionCampaignState
};
