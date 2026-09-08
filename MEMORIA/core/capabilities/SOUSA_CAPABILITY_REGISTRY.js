/**
 * SOUSA 2.0 â€” CAPABILITY REGISTRY
 * Registro central de capacidades
 * VersÃ£o: 1.0.0
 *
 * PrincÃ­pio:
 * Tecnologia externa != capacidade.
 * O Registry registra a CAPACIDADE e sua implementaÃ§Ã£o/adaptador.
 */

'use strict';

const SOUSA_CONTRATO_UNIVERSAL_3D = require('../../SOUSA_CONTRATO_UNIVERSAL_3D.js');

const SOUSA_CAPABILITY_REGISTRY = {

  contrato_universal_3d: SOUSA_CONTRATO_UNIVERSAL_3D,

  version: '1.0.0',

  capabilities: new Map(),

  register(capability) {
    this._validate(capability);

    const existing = this.capabilities.get(capability.id);

    const record = {
      ...existing,
      ...capability,
      updatedAt: new Date().toISOString()
    };

    if (!record.createdAt) {
      record.createdAt = record.updatedAt;
    }

    this.capabilities.set(record.id, record);

    return {
      success: true,
      action: existing ? 'UPDATED' : 'REGISTERED',
      capability: record
    };
  },

  get(id) {
    return this.capabilities.get(id) || null;
  },

  list(filters = {}) {
    return [...this.capabilities.values()].filter(item => {

      if (filters.status && item.status !== filters.status) {
        return false;
      }

      if (filters.category && item.category !== filters.category) {
        return false;
      }

      if (filters.provider && item.provider !== filters.provider) {
        return false;
      }

      return true;
    });
  },

  findByCapability(name) {
    return [...this.capabilities.values()]
      .filter(item =>
        item.capabilities?.includes(name)
      );
  },

  updateStatus(id, status) {
    const item = this.get(id);

    if (!item) {
      throw new Error(`Capacidade nÃ£o encontrada: ${id}`);
    }

    item.status = status;
    item.updatedAt = new Date().toISOString();

    this.capabilities.set(id, item);

    return item;
  },

  remove(id) {
    if (!this.capabilities.has(id)) {
      return {
        success: false,
        message: 'Capacidade nÃ£o encontrada.'
      };
    }

    this.capabilities.delete(id);

    return {
      success: true,
      action: 'REMOVED',
      id
    };
  },

  snapshot() {
    return {
      registryVersion: this.version,
      generatedAt: new Date().toISOString(),
      total: this.capabilities.size,
      capabilities: [...this.capabilities.values()]
    };
  },

  _validate(capability) {

    const required = [
      'id',
      'name',
      'category',
      'status',
      'capabilities'
    ];

    for (const field of required) {
      if (
        capability[field] === undefined ||
        capability[field] === null
      ) {
        throw new Error(
          `Campo obrigatÃ³rio ausente no Registry: ${field}`
        );
      }
    }

    if (!Array.isArray(capability.capabilities)) {
      throw new Error(
        'capabilities deve ser um array.'
      );
    }
  }
};


/* =========================================================
   CAPACIDADES INICIAIS
   ========================================================= */

const SOUSA_INITIAL_CAPABILITIES = [

  {
    id: 'ruflo',
    name: 'Ruflo',
    category: 'orchestration',
    provider: 'Ruflo',
    version: 'external',
    status: 'ADAPTED',
    capabilities: [
      'orchestration',
      'task-coordination'
    ],
    adapter: 'SOUSA_ADAPTER_RUFLO',
    dependencies: [],
    permissions: ['orchestrate'],
    metrics: {}
  },

  {
    id: 'openmanus',
    name: 'OpenManus',
    category: 'execution',
    provider: 'OpenManus',
    version: 'external',
    status: 'ADAPTED',
    capabilities: [
      'agent-execution',
      'task-execution'
    ],
    adapter: 'SOUSA_ADAPTER_OPENMANUS',
    dependencies: [],
    permissions: ['execute'],
    metrics: {}
  },

  {
    id: 'opencode',
    name: 'OpenCode',
    category: 'engineering',
    provider: 'OpenCode',
    version: 'external',
    status: 'ADAPTED',
    capabilities: [
      'code-generation',
      'code-modification',
      'testing',
      'maintenance'
    ],
    adapter: 'SOUSA_ADAPTER_OPENCODE',
    dependencies: [],
    permissions: ['engineering'],
    metrics: {}
  },

  {
    id: 'minimax-h3',
    name: 'MiniMax H3',
    category: 'multimodal',
    provider: 'MiniMax',
    version: 'external',
    status: 'ADAPTED',
    capabilities: [
      'multimodal-generation',
      'video-generation',
      'audio-generation',
      'context-interpretation'
    ],
    adapter: 'SOUSA_ADAPTER_MINIMAX_H3',
    dependencies: [],
    permissions: ['multimodal'],
    metrics: {}
  },

  {
    id: 'deepgram',
    name: 'Deepgram',
    category: 'audio',
    provider: 'Deepgram',
    version: 'external',
    status: 'ADAPTED',
    capabilities: [
      'speech-processing',
      'audio-processing'
    ],
    adapter: 'SOUSA_ADAPTER_DEEPGRAM',
    dependencies: [],
    permissions: ['audio'],
    metrics: {}
  },

  {
    id: 'arxivisual',
    name: 'ArXivisual',
    category: 'research',
    provider: 'ArXivisual',
    version: 'external',
    status: 'ADAPTED',
    capabilities: [
      'research',
      'scientific-triage',
      'paper-analysis'
    ],
    adapter: 'SOUSA_ADAPTER_ARXIVISUAL',
    dependencies: [],
    permissions: ['research'],
    metrics: {}
  }

];


/* =========================================================
   REGISTRO INICIAL
   ========================================================= */

for (const capability of SOUSA_INITIAL_CAPABILITIES) {
  SOUSA_CAPABILITY_REGISTRY.register(capability);
}


/* =========================================================
   EXPORTAÃ‡ÃƒO
   ========================================================= */

if (typeof module !== 'undefined') {
  module.exports = {
    SOUSA_CAPABILITY_REGISTRY,
    SOUSA_INITIAL_CAPABILITIES,
    SOUSA_CONTRATO_UNIVERSAL_3D
  };
}
