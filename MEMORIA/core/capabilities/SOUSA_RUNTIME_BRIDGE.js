'use strict';

const { execFileSync } = require('child_process');

const SOUSA_RUNTIME_BRIDGE = {
  version: '1.0.0',

  commands: {
    opencode: 'opencode',
    ruflo: 'ruflo',
    openmanus: 'openmanus'
  },

  check(command) {
    try {
      const output = execFileSync(
        'where.exe',
        [command],
        {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe']
        }
      );

      return {
        command,
        status: 'AVAILABLE',
        path: output.trim()
      };
    } catch (error) {
      return {
        command,
        status: 'NOT_FOUND',
        path: null
      };
    }
  },

  inspect() {
    return {
      bridgeVersion: this.version,
      checkedAt: new Date().toISOString(),
      runtimes: Object.entries(this.commands).map(
        ([id, command]) => ({
          id,
          command,
          ...this.check(command)
        })
      )
    };
  }
};

module.exports = SOUSA_RUNTIME_BRIDGE;