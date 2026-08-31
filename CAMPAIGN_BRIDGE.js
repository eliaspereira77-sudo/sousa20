function campaignBridge(context) {
  if (!context || !context.campaignId) {
    return {
      status: 'BLOCKED',
      reason: 'CAMPAIGN_CONTEXT_REQUIRED'
    };
  }

  return runCampaignStep(context);
}
