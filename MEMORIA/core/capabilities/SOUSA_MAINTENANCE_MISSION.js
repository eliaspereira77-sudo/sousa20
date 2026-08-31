'use strict';

const MaintenanceAgent =
  require('./SOUSA_MAINTENANCE_AGENT.js');

const TEAM =
  require('./SOUSA_TEAM_REGISTRY.json');

const target =
  './MEMORIA/core/capabilities/SOUSA_AUTO_REPAIR_TESTE.js';

const objective =
  'Tratar as oportunidades detectadas de manutenção, duplicidade, resíduos, ruído, quarentena, órfãos e incompatibilidades, sempre em Sandbox e sem exclusão ou promoção automática.';

const mission =
  MaintenanceAgent.createMission({
    target,
    objective
  });

const mechanic =
  TEAM.members.find(
    member => member.id === 'mecanico'
  );

const detected = {
  duplicates:
    mission.hygiene.duplicates.groups,

  residues:
    mission.hygiene.residues.candidates,

  quarantine:
    mission.hygiene.quarantine.candidates,

  noise:
    mission.hygiene.noise.candidates,

  possibleOrphans:
    mission.hygiene.possibleOrphans.candidates,

  possibleIncompatibilities:
    mission.hygiene.possibleIncompatibilities.candidates
};

const pending =
  Object.values(detected)
    .reduce(
      (total, items) =>
        total + (Array.isArray(items) ? items.length : 0),
      0
    );

const status =
  pending > 0
    ? 'PENDING_TREATMENT'
    : 'NO_DETECTED_PENDING';

console.log(
  JSON.stringify(
    {
      missionId: mission.missionId,
      status,

      truth: {
        healthy:
          pending === 0,

        pendingTreatment:
          pending,

        duplicatesDetected:
          mission.hygiene.duplicates.detected,

        residuesDetected:
          mission.hygiene.residues.detected,

        quarantineDetected:
          mission.hygiene.quarantine.detected,

        noiseDetected:
          mission.hygiene.noise.detected,

        possibleOrphansDetected:
          mission.hygiene.possibleOrphans.detected,

        possibleIncompatibilitiesDetected:
          mission.hygiene.possibleIncompatibilities.detected
      },

      mechanic: {
        active:
          mechanic?.status === 'ACTIVE',

        id:
          mechanic?.id,

        responsibilities:
          mechanic?.responsibilities || []
      },

      treatment: {
        delegatedTo:
          'mecanico',

        sandboxFirst:
          true,

        automaticDeletion:
          false,

        productionWrite:
          false,

        automaticPromotion:
          false
      },

      detected
    },
    null,
    2
  )
);
