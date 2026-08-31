const fs = require('fs');
const path = require('path');

const STATE_DIR = path.join(__dirname, 'OPERACAO', 'CAMPAIGNS');

function saveCampaignState(state) {
  if (!state || !state.campaignId) {
    throw new Error('CAMPAIGN_ID_REQUIRED');
  }

  fs.mkdirSync(STATE_DIR, { recursive: true });

  const file = path.join(
    STATE_DIR,
    `${state.campaignId}.json`
  );

  const payload = {
    ...state,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    file,
    JSON.stringify(payload, null, 2),
    'utf8'
  );

  return payload;
}

function loadCampaignState(campaignId) {
  if (!campaignId) {
    throw new Error('CAMPAIGN_ID_REQUIRED');
  }

  const file = path.join(
    STATE_DIR,
    `${campaignId}.json`
  );

  if (!fs.existsSync(file)) {
    return null;
  }

  return JSON.parse(
    fs.readFileSync(file, 'utf8')
  );
}

module.exports = {
  saveCampaignState,
  loadCampaignState
};
