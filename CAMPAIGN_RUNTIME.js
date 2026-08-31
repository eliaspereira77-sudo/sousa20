const { campaignGuardianCheck } = require('./CAMPAIGN_GUARDIAN.js');
const { saveCampaignState, loadCampaignState } = require('./CAMPAIGN_PERSISTENCE.js');
const { STATES, transitionCampaignState } = require('./CAMPAIGN_STATE_MACHINE.js');

function startCampaign(context) {
  const guardian = campaignGuardianCheck(context);

  if (guardian.status !== 'ALLOW') {
    return {
      status: 'BLOCKED',
      guardian
    };
  }

  const previous = loadCampaignState(context.campaignId);

  const currentState = previous?.status === 'RUNNING'
    ? STATES.RUNNING
    : STATES.CREATED;

  const transition = transitionCampaignState(
    currentState,
    STATES.GUARDIAN_APPROVED
  );

  if (!transition.ok) {
    return {
      status: 'BLOCKED',
      reason: 'STATE_TRANSITION_DENIED',
      transition
    };
  }

  const state = {
    ...context,
    status: STATES.GUARDIAN_APPROVED,
    checkpoint: 'GUARDIAN_APPROVED'
  };

  saveCampaignState(state);

  return {
    status: 'READY',
    guardian,
    previous,
    state
  };
}

module.exports = {
  startCampaign
};
