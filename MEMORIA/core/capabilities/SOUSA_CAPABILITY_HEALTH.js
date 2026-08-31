'use strict';

const registryModule = require('./SOUSA_CAPABILITY_REGISTRY.js');
const adapter = require('./SOUSA_CAPABILITY_ADAPTER.js');
const bridge = require('./SOUSA_RUNTIME_BRIDGE.js');

const SOUSA_CAPABILITY_HEALTH = {
  version: '1.0.0',

  inspect() {
    const registry =
      registryModule.SOUSA_CAPABILITY_REGISTRY.snapshot();

    const adapters = adapter.snapshot();
    const runtime = bridge.inspect();

    const runtimeMap = new Map(
      runtime.runtimes.map(item => [item.id, item])
    );

    const adapterMap = new Map(
      adapters.adapters.map(item => [item.capabilityId, item])
    );

    const capabilities = registry.capabilities.map(capability => {
      const runtimeInfo = runtimeMap.get(capability.id);
      const adapterInfo = adapterMap.get(capability.id);

      let operationalStatus = 'ADAPTED_ONLY';

      if (runtimeInfo) {
        if (runtimeInfo.status === 'AVAILABLE') {
          operationalStatus = 'READY';
        } else {
          operationalStatus = 'ADAPTED_RUNTIME_NOT_FOUND';
        }
      } else if (adapterInfo) {
        operationalStatus = 'ADAPTER_READY';
      }

      return {
        id: capability.id,
        name: capability.name,
        category: capability.category,
        registryStatus: capability.status,
        adapterStatus: adapterInfo ? 'REGISTERED' : 'MISSING',
        runtimeStatus: runtimeInfo
          ? runtimeInfo.status
          : 'NOT_APPLICABLE',
        operationalStatus
      };
    });

    return {
      healthVersion: this.version,
      checkedAt: new Date().toISOString(),
      registryTotal: registry.total,
      adapterTotal: adapters.total,
      runtimeChecked: runtime.runtimes.length,
      capabilities
    };
  }
};

module.exports = SOUSA_CAPABILITY_HEALTH;