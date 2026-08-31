'use strict';

/**
 * SOUSA 2.0 — CAPABILITY ADAPTER
 * v1.1.0
 *
 * Ponte:
 * CAPABILITY REGISTRY → ADAPTER → USB
 *
 * Regra:
 * Nenhuma capacidade externa altera o núcleo.
 */

const ADAPTERS = new Map();

function registerAdapter(adapter) {

  if (!adapter || !adapter.id) {
    throw new Error('Adapter inválido: id obrigatório.');
  }

  if (!adapter.capabilityId) {
    throw new Error('Adapter inválido: capabilityId obrigatório.');
  }

  if (typeof adapter.execute !== 'function') {
    throw new Error(
      `Adapter ${adapter.id} precisa implementar execute().`
    );
  }

  ADAPTERS.set(adapter.id, adapter);

  return {
    success: true,
    action: 'REGISTERED',
    adapterId: adapter.id
  };
}

function getAdapter(id) {
  return ADAPTERS.get(id) || null;
}

function findByCapability(capabilityId) {
  return [...ADAPTERS.values()]
    .filter(adapter => adapter.capabilityId === capabilityId);
}

async function execute(adapterId, input = {}, context = {}) {

  const adapter = getAdapter(adapterId);

  if (!adapter) {
    throw new Error(`Adapter não encontrado: ${adapterId}`);
  }

  const result = await adapter.execute({
    input,
    context
  });

  return {
    ...result,
    adapterId,
    capabilityId: adapter.capabilityId,
    executedAt: new Date().toISOString()
  };
}

/**
 * Cria adaptador universal para uma capacidade registrada.
 *
 * O adaptador não inventa execução externa.
 * Ele entrega ao barramento um contrato operacional.
 */
function criarAdapter(capability) {

  return {

    id: capability.adapter,

    capabilityId: capability.id,

    name: `${capability.name} Adapter`,

    version: '1.1.0',

    execute: async ({ input, context }) => {

      return {

        success: true,

        mode: 'CAPABILITY_PNP_READY',

        status: 'OPERATIONAL_BRIDGE',

        capability: capability.id,

        provider: capability.provider,

        permissions: capability.permissions || [],

        input,

        context
      };
    }
  };
}

/**
 * Bootstrap automático:
 * Registry → Adapters
 */
function bootstrapFromRegistry() {

  let registry;

  try {

    registry = require('./SOUSA_CAPABILITY_REGISTRY.js');

  } catch (e) {

    return {
      success: false,
      status: 'REGISTRY_UNAVAILABLE',
      error: e.message
    };
  }

  const snapshot =
    registry.SOUSA_CAPABILITY_REGISTRY.snapshot();

  const registrados = [];

  for (const capability of snapshot.capabilities) {

    if (!capability.adapter) continue;

    const adapter = criarAdapter(capability);

    registerAdapter(adapter);

    registrados.push({
      capabilityId: capability.id,
      adapterId: adapter.id,
      status: 'ADAPTER_OPERATIONAL'
    });
  }

  return {

    success: true,

    status: 'PNP_BOOTSTRAP_OK',

    total: registrados.length,

    adapters: registrados
  };
}

function snapshot() {

  return {

    adapterVersion: '1.1.0',

    generatedAt: new Date().toISOString(),

    total: ADAPTERS.size,

    adapters: [...ADAPTERS.values()].map(adapter => ({

      id: adapter.id,

      capabilityId: adapter.capabilityId,

      name: adapter.name,

      version: adapter.version,

      executable:
        typeof adapter.execute === 'function'

    }))
  };
}

/**
 * Bootstrap automático ao carregar o módulo.
 */
const BOOTSTRAP =
  bootstrapFromRegistry();

module.exports = {

  ADAPTERS,

  BOOTSTRAP,

  registerAdapter,

  getAdapter,

  findByCapability,

  execute,

  snapshot,

  bootstrapFromRegistry

};
