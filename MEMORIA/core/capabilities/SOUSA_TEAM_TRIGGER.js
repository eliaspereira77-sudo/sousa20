'use strict';

const Team = require('./SOUSA_TEAM_REGISTRY.json');
const Orchestrator = require('./SOUSA_MAINTENANCE_ORCHESTRATOR.js');

const SOUSA_TEAM_TRIGGER = {
  version: '1.0.0',

  trigger({
    event = 'SYSTEM_EVENT',
    target,
    objective = 'Diagnosticar e preparar manutenção'
  }) {
    if (!target) {
      throw new Error('Target obrigatório.');
    }

    const team = Team.members || [];

    const activeTeam = team.filter(
      member => member.status === 'ACTIVE'
    );

    const mission = Orchestrator.executeMission({
      target,
      repairedContent: null
    });

    return {
      success: true,
      trigger: event,
      activeTeam: activeTeam.map(member => ({
        id: member.id,
        name: member.name,
        role: member.role
      })),
      objective,
      mission
    };
  }
};

module.exports = SOUSA_TEAM_TRIGGER;
