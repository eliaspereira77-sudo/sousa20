'use strict';

const fs = require('fs');
const path = require('path');

const TEAM_FILE = path.resolve(
  __dirname,
  'SOUSA_TEAM_REGISTRY.json'
);

const SOUSA_TEAM_REGISTRY = {
  version: '1.0.0',

  members: [
    {
      id: 'cao-de-guarda',
      name: 'Cão de Guarda',
      role: 'integrity_monitor',
      status: 'ACTIVE',
      responsibilities: [
        'monitorar_integridade',
        'detectar_anomalias',
        'acionar_diagnostico',
        'proteger_arquitetura'
      ]
    },
    {
      id: 'sousaileon',
      name: 'SOUSAILEON',
      role: 'maintenance_coordinator',
      status: 'ACTIVE',
      responsibilities: [
        'coordenar_manutencao',
        'receber_diagnosticos',
        'acionar_mecanico',
        'acompanhar_reparo'
      ]
    },
    {
      id: 'mecanico',
      name: 'Mecânico',
      role: 'repair_engine',
      status: 'ACTIVE',
      responsibilities: [
        'propor_reparos',
        'trabalhar_em_sandbox',
        'corrigir_componentes',
        'preparar_promocao'
      ]
    },
    {
      id: 'monitor-sintaxe',
      name: 'Monitor de Sintaxe',
      role: 'syntax_validator',
      status: 'ACTIVE',
      module: 'SOUSA_SELF_TEST_REPAIR.js',
      responsibilities: [
        'testar_sintaxe',
        'diagnosticar_falhas',
        'retestar_componentes'
      ]
    },
    {
      id: 'orquestrador-manutencao',
      name: 'Orquestrador de Manutenção',
      role: 'maintenance_orchestrator',
      status: 'ACTIVE',
      module: 'SOUSA_MAINTENANCE_ORCHESTRATOR.js',
      responsibilities: [
        'coordenar_fluxo',
        'executar_missoes',
        'encaminhar_reparos'
      ]
    }
  ],

  workflow: [
    'CAO_DE_GUARDA',
    'MONITOR_SINTAXE',
    'SOUSAILEON',
    'MECANICO',
    'SANDBOX',
    'VALIDACAO',
    'PROMOCAO'
  ],

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

fs.writeFileSync(
  TEAM_FILE,
  JSON.stringify(SOUSA_TEAM_REGISTRY, null, 2),
  'utf8'
);

console.log(JSON.stringify({
  success: true,
  file: TEAM_FILE,
  version: SOUSA_TEAM_REGISTRY.version,
  totalMembers: SOUSA_TEAM_REGISTRY.members.length,
  members: SOUSA_TEAM_REGISTRY.members.map(m => ({
    id: m.id,
    name: m.name,
    status: m.status
  }))
}, null, 2));
