'use strict';

/**
 * SOUSA 2.0 — CAPABILITY ADAPTER
 * Versão: 1.0.0
 *
 * Função:
 * Adaptar implementações externas ao contrato
 * de capacidades do SOUSA 2.0.
 *
 * IMPORTANTE:
 * Este módulo NÃO executa ferramentas externas.
 * Ele cria o contrato/ponte para que a execução
 * seja feita posteriormente pelo Executor.
 */

const ADAPTERS = new Map();

function registerAdapter(adapter) {

  if (!adapter?.id) {
    throw new Error('Adapter inválido: id obrigatório.');
  }

  if (!adapter?.capabilityId) {
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
    .filter(adapter =>
      adapter.capabilityId === capabilityId
    );
}


async function execute(adapterId, input = {}, context = {}) {

  const adapter = getAdapter(adapterId);

  if (!adapter) {
    throw new Error(
      `Adapter não encontrado: ${adapterId}`
    );
  }

  return adapter.execute({
    input,
    context
  });
}


/*
 * =========================================================
 * ADAPTERS — PONTES INICIAIS
 * =========================================================
 *
 * Estes adapters NÃO conectam APIs ainda.
 * São contratos preparados para a integração real.
 */

registerAdapter({

  id: 'SOUSA_ADAPTER_RUFLO',

  capabilityId: 'ruflo',

  name: 'Ruflo Adapter',

  version: '1.0.0',

  execute: async ({ input, context }) => {

    return {
      success: true,
      mode: 'ADAPTER_READY',
      capability: 'ruflo',
      input,
      context
    };
  }
});


registerAdapter({

  id: 'SOUSA_ADAPTER_OPENMANUS',

  capabilityId: 'openmanus',

  name: 'OpenManus Adapter',

  version: '1.0.0',

  execute: async ({ input, context }) => {

    return {
      success: true,
      mode: 'ADAPTER_READY',
      capability: 'openmanus',
      input,
      context
    };
  }
});


registerAdapter({

  id: 'SOUSA_ADAPTER_OPENCODE',

  capabilityId: 'opencode',

  name: 'OpenCode Adapter',

  version: '1.0.0',

  execute: async ({ input, context }) => {

    return {
      success: true,
      mode: 'ADAPTER_READY',
      capability: 'opencode',
      input,
      context
    };
  }
});


registerAdapter({

  id: 'SOUSA_ADAPTER_MINIMAX_H3',

  capabilityId: 'minimax-h3',

  name: 'MiniMax H3 Adapter',

  version: '1.0.0',

  execute: async ({ input, context }) => {

    return {
      success: true,
      mode: 'ADAPTER_READY',
      capability: 'minimax-h3',
      input,
      context
    };
  }
});


registerAdapter({

  id: 'SOUSA_ADAPTER_DEEPGRAM',

  capabilityId: 'deepgram',

  name: 'Deepgram Adapter',

  version: '1.0.0',

  execute: async ({ input, context }) => {

    return {
      success: true,
      mode: 'ADAPTER_READY',
      capability: 'deepgram',
      input,
      context
    };
  }
});


registerAdapter({

  id: 'SOUSA_ADAPTER_ARXIVISUAL',

  capabilityId: 'arxivisual',

  name: 'ArXivisual Adapter',

  version: '1.0.0',

  execute: async ({ input, context }) => {

    return {
      success: true,
      mode: 'ADAPTER_READY',
      capability: 'arxivisual',
      input,
      context
    };
  }
});


/*
 * =========================================================
 * SNAPSHOT
 * =========================================================
 */

function snapshot() {

  return {
    adapterVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    total: ADAPTERS.size,
    adapters: [...ADAPTERS.values()].map(adapter => ({
      id: adapter.id,
      capabilityId: adapter.capabilityId,
      name: adapter.name,
      version: adapter.version
    }))
  };
}


module.exports = {
  ADAPTERS,
  registerAdapter,
  getAdapter,
  findByCapability,
  execute,
  snapshot
};