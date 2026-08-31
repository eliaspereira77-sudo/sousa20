function runCampaignStep(context) {
  var previous = loadCampaignState(context.campaignId);

  var guardian = campaignGuardianCheck(context);

  if (guardian.status !== 'ALLOW') {
    return {
      status: 'BLOCKED',
      guardian: guardian,
      previous: previous
    };
  }

  var state = {
    campaignId: context.campaignId,
    platform: context.platform,
    identity: context.identity,
    action: context.action,
    status: 'READY_FOR_EXECUTION',
    checkpoint: 'GUARDIAN_APPROVED'
  };

  saveCampaignState(state);

  return {
    status: 'READY',
    guardian: guardian,
    state: state
  };
}
