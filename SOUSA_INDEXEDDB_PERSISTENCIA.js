/**
 * ============================================================================
 * SOUSA 2.0 — PERSISTÊNCIA RESILIENTE EM INDEXEDDB
 * Módulo de Armazenamento Local Durável para Telemetria, Logs e Estado do Sistema
 * ============================================================================
 * 
 * Garante que todo o histórico de execuções de comandos, métricas de latência,
 * registros operacionais e configurações de módulos sobrevivam intactos a:
 *  - Recarregamentos de página (F5 / Hard Refresh)
 *  - Limpezas de cache de localStorage (localStorage.clear())
 *  - Fechamento de abas ou sessões do navegador
 * 
 * Autoridade: Elias Pereira de Sousa
 * Sistema: SOUSA 2.0 (Sistema Orquestrador Unificado Seguro Automatizado)
 * ============================================================================
 */

(function(root) {
  'use strict';

  const DB_NAME = 'SOUSA_20_INDEXEDDB';
  const DB_VERSION = 1;

  const STORES = {
    TELEMETRIA: 'telemetria',
    LOGS: 'logs',
    ESTADO: 'estado'
  };

  class SousaIndexedDBService {
    constructor() {
      this.db = null;
      this.pronto = false;
      this._initPromise = null;
      this._autoSaveTimer = null;
      this._autoSaveIntervalo = 60; // 60 segundos padrão conforme diretriz SOUSA
      this._obterEstadoFn = null;
      this._ultimoSalvamento = null;
      this._contadorAutoSaves = 0;
      this._listenersAutoSave = [];
      this._emSalvamento = false;
    }

    /**
     * Inicializa a conexão com o banco IndexedDB e cria os ObjectStores necessários.
     */
    async init() {
      if (this._initPromise) return this._initPromise;

      this._initPromise = new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !('indexedDB' in window)) {
          console.warn('[SOUSA-IndexedDB] IndexedDB não suportado neste ambiente. Operando com fallback em memória.');
          this.pronto = false;
          return resolve(false);
        }

        try {
          const request = window.indexedDB.open(DB_NAME, DB_VERSION);

          request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // 1. Store de Telemetria (Latências e Execuções)
            if (!db.objectStoreNames.contains(STORES.TELEMETRIA)) {
              const storeTelemetria = db.createObjectStore(STORES.TELEMETRIA, { keyPath: 'id' });
              storeTelemetria.createIndex('timestamp', 'timestamp', { unique: false });
              storeTelemetria.createIndex('comando', 'comando', { unique: false });
              storeTelemetria.createIndex('latencia', 'latencia', { unique: false });
            }

            // 2. Store de Logs Operacionais
            if (!db.objectStoreNames.contains(STORES.LOGS)) {
              const storeLogs = db.createObjectStore(STORES.LOGS, { keyPath: 'id', autoIncrement: true });
              storeLogs.createIndex('ts', 'ts', { unique: false });
              storeLogs.createIndex('tipo', 'tipo', { unique: false });
              storeLogs.createIndex('modulo', 'modulo', { unique: false });
              storeLogs.createIndex('criadoEm', 'criadoEm', { unique: false });
            }

            // 3. Store de Estado Global (Configurações, Módulos, Metadados)
            if (!db.objectStoreNames.contains(STORES.ESTADO)) {
              const storeEstado = db.createObjectStore(STORES.ESTADO, { keyPath: 'chave' });
              storeEstado.createIndex('atualizadoEm', 'atualizadoEm', { unique: false });
            }
          };

          request.onsuccess = (event) => {
            this.db = event.target.result;
            this.pronto = true;
            resolve(true);
          };

          request.onerror = (event) => {
            console.error('[SOUSA-IndexedDB] Falha ao abrir banco:', event.target.error);
            this.pronto = false;
            resolve(false);
          };
        } catch (err) {
          console.error('[SOUSA-IndexedDB] Exceção na abertura do IndexedDB:', err);
          this.pronto = false;
          resolve(false);
        }
      });

      return this._initPromise;
    }

    /**
     * Executa uma transação segura com Promise.
     */
    async _executarTransacao(storeName, mode, callback) {
      await this.init();
      if (!this.db) return null;

      return new Promise((resolve, reject) => {
        try {
          const tx = this.db.transaction(storeName, mode);
          const store = tx.objectStore(storeName);

          const resultado = callback(store);

          tx.oncomplete = () => resolve(resultado);
          tx.onerror = (e) => {
            console.warn(`[SOUSA-IndexedDB] Erro na transação ${storeName}:`, e.target.error);
            resolve(null);
          };
          tx.onabort = () => resolve(null);
        } catch (err) {
          console.warn(`[SOUSA-IndexedDB] Exceção de transação ${storeName}:`, err);
          resolve(null);
        }
      });
    }

    // ========================================================================
    // PERSISTÊNCIA DE LOGS
    // ========================================================================

    async salvarLog(entrada) {
      if (!entrada) return;
      const registro = {
        ts: entrada.ts || new Date().toLocaleTimeString(),
        tipo: entrada.tipo || 'INFO',
        modulo: entrada.modulo || 'CORE',
        msg: entrada.msg || '',
        criadoEm: entrada.criadoEm || Date.now()
      };

      await this._executarTransacao(STORES.LOGS, 'readwrite', (store) => {
        store.add(registro);
      });
    }

    async obterLogs(limite = 50) {
      await this.init();
      if (!this.db) return [];

      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(STORES.LOGS, 'readonly');
          const store = tx.objectStore(STORES.LOGS);
          const logs = [];

          // Abre cursor no sentido reverso para pegar os mais recentes primeiro
          const req = store.openCursor(null, 'prev');
          req.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor && logs.length < limite) {
              logs.push(cursor.value);
              cursor.continue();
            } else {
              resolve(logs);
            }
          };
          req.onerror = () => resolve([]);
        } catch (err) {
          resolve([]);
        }
      });
    }

    async limparLogs() {
      return this._executarTransacao(STORES.LOGS, 'readwrite', (store) => {
        store.clear();
      });
    }

    // ========================================================================
    // PERSISTÊNCIA DE TELEMETRIA
    // ========================================================================

    async salvarTelemetria(item) {
      if (!item) return;
      const registro = {
        id: item.id || Date.now(),
        comando: item.comando || 'comando',
        latencia: Number(item.latencia) || 1,
        horario: item.horario || new Date().toLocaleTimeString(),
        timestamp: item.timestamp || new Date().toISOString()
      };

      await this._executarTransacao(STORES.TELEMETRIA, 'readwrite', (store) => {
        store.put(registro);
      });
    }

    async salvarLoteTelemetria(itens) {
      if (!Array.isArray(itens) || itens.length === 0) return;
      await this._executarTransacao(STORES.TELEMETRIA, 'readwrite', (store) => {
        itens.forEach((item) => {
          store.put({
            id: item.id || Date.now() + Math.random(),
            comando: item.comando || 'comando',
            latencia: Number(item.latencia) || 1,
            horario: item.horario || new Date().toLocaleTimeString(),
            timestamp: item.timestamp || new Date().toISOString()
          });
        });
      });
    }

    async obterTelemetria(limite = 50) {
      await this.init();
      if (!this.db) return [];

      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(STORES.TELEMETRIA, 'readonly');
          const store = tx.objectStore(STORES.TELEMETRIA);
          const itens = [];

          const req = store.openCursor(null, 'next');
          req.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
              itens.push(cursor.value);
              cursor.continue();
            } else {
              // Se tiver limite, pega os últimos N
              const resultado = limite ? itens.slice(-limite) : itens;
              resolve(resultado);
            }
          };
          req.onerror = () => resolve([]);
        } catch (err) {
          resolve([]);
        }
      });
    }

    async limparTelemetria() {
      return this._executarTransacao(STORES.TELEMETRIA, 'readwrite', (store) => {
        store.clear();
      });
    }

    // ========================================================================
    // PERSISTÊNCIA DE ESTADO GLOBAL (CONFIG, MÓDULOS, SESSÃO)
    // ========================================================================

    async salvarEstado(chave, valor) {
      if (!chave) return;
      const registro = {
        chave: String(chave),
        valor: valor,
        atualizadoEm: Date.now(),
        horario: new Date().toISOString()
      };

      await this._executarTransacao(STORES.ESTADO, 'readwrite', (store) => {
        store.put(registro);
      });
    }

    async obterEstado(chave, valorPadrao = null) {
      await this.init();
      if (!this.db) return valorPadrao;

      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(STORES.ESTADO, 'readonly');
          const store = tx.objectStore(STORES.ESTADO);
          const req = store.get(String(chave));

          req.onsuccess = (e) => {
            if (e.target.result && e.target.result.valor !== undefined) {
              resolve(e.target.result.valor);
            } else {
              resolve(valorPadrao);
            }
          };
          req.onerror = () => resolve(valorPadrao);
        } catch (err) {
          resolve(valorPadrao);
        }
      });
    }

    async obterTodosEstados() {
      await this.init();
      if (!this.db) return {};

      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(STORES.ESTADO, 'readonly');
          const store = tx.objectStore(STORES.ESTADO);
          const mapa = {};

          const req = store.openCursor();
          req.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
              mapa[cursor.value.chave] = cursor.value.valor;
              cursor.continue;
              cursor.continue();
            } else {
              resolve(mapa);
            }
          };
          req.onerror = () => resolve({});
        } catch (err) {
          resolve({});
        }
      });
    }

    // ========================================================================
    // DIAGNÓSTICO E ESTATÍSTICAS
    // ========================================================================

    async obterEstatisticas() {
      await this.init();
      if (!this.db) {
        return { pronto: false, totalTelemetria: 0, totalLogs: 0, totalEstados: 0 };
      }

      const contar = (storeName) => new Promise((res) => {
        try {
          const tx = this.db.transaction(storeName, 'readonly');
          const req = tx.objectStore(storeName).count();
          req.onsuccess = () => res(req.result || 0);
          req.onerror = () => res(0);
        } catch (_) {
          res(0);
        }
      });

      const [totalTelemetria, totalLogs, totalEstados] = await Promise.all([
        contar(STORES.TELEMETRIA),
        contar(STORES.LOGS),
        contar(STORES.ESTADO)
      ]);

      return {
        pronto: true,
        banco: DB_NAME,
        versao: DB_VERSION,
        totalTelemetria,
        totalLogs,
        totalEstados
      };
    }

    async exportarTudo() {
      const [logs, telemetria, estados] = await Promise.all([
        this.obterLogs(500),
        this.obterTelemetria(500),
        this.obterTodosEstados()
      ]);

      return {
        sistema: 'SOUSA 2.0',
        banco: DB_NAME,
        versao: DB_VERSION,
        exportadoEm: new Date().toISOString(),
        logs,
        telemetria,
        estados
      };
    }

    // ========================================================================
    // AUTO-SAVE RESILIENTE & ROTATIVIDADE DE LOGS (LOG ROTATION)
    // ========================================================================

    /**
     * Registra ouvinte para notificações de salvamento automático.
     */
    onAutoSave(callback) {
      if (typeof callback === 'function') {
        this._listenersAutoSave.push(callback);
      }
    }

    /**
     * Salva um snapshot completo do estado do sistema SOUSA 2.0.
     */
    async salvarSnapshotCompleto(estado, motivo = 'timer_60s') {
      if (!estado || this._emSalvamento) return null;
      this._emSalvamento = true;

      try {
        await this.init();
        if (!this.db) return null;

        const agora = Date.now();
        const infoAutoSave = {
          timestamp: agora,
          horario: new Date().toISOString(),
          motivo: motivo,
          contador: ++this._contadorAutoSaves,
          comandosExecutados: estado.comandosExecutados || 0
        };

        // 1. Salvar registros chave no store ESTADO
        await this._executarTransacao(STORES.ESTADO, 'readwrite', (store) => {
          if (estado.config) {
            store.put({ chave: 'config', valor: estado.config, atualizadoEm: agora });
          }
          if (estado.modulos) {
            store.put({ chave: 'modulos', valor: estado.modulos, atualizadoEm: agora });
          }
          if (estado.comandosExecutados !== undefined) {
            store.put({ chave: 'comandosExecutados', valor: estado.comandosExecutados, atualizadoEm: agora });
          }
          if (estado.historicoLatencia) {
            store.put({ chave: 'historicoLatencia', valor: estado.historicoLatencia, atualizadoEm: agora });
          }
          if (estado.enxame) {
            store.put({ chave: 'enxame', valor: estado.enxame, atualizadoEm: agora });
          }
          store.put({ chave: 'ultimoAutoSave', valor: infoAutoSave, atualizadoEm: agora });
        });

        // 2. Se houver histórico de latência, persiste em lote na store TELEMETRIA
        if (Array.isArray(estado.historicoLatencia) && estado.historicoLatencia.length > 0) {
          await this.salvarLoteTelemetria(estado.historicoLatencia.slice(-50));
        }

        this._ultimoSalvamento = infoAutoSave;

        // Notifica listeners
        this._listenersAutoSave.forEach((cb) => {
          try { cb(infoAutoSave); } catch (_) {}
        });

        return infoAutoSave;
      } catch (err) {
        console.warn('[SOUSA-IndexedDB] Falha no salvamento do snapshot:', err);
        return null;
      } finally {
        this._emSalvamento = false;
      }
    }

    /**
     * Inicia o ciclo de auto-save a cada X segundos (padrão 60s conforme diretriz SOUSA).
     */
    iniciarAutoSave(obterEstadoFn, intervaloSegundos = 60) {
      this.pararAutoSave();

      if (typeof obterEstadoFn === 'function') {
        this._obterEstadoFn = obterEstadoFn;
      }
      this._autoSaveIntervalo = Number(intervaloSegundos) || 60;

      this._autoSaveTimer = setInterval(() => {
        this.executarAutoSaveImediato('timer_60s');
      }, this._autoSaveIntervalo * 1000);

      console.log(`[SOUSA-IndexedDB] Auto-Save ativado: intervalo de ${this._autoSaveIntervalo}s e disparo por comando.`);
      return true;
    }

    /**
     * Para o ciclo de auto-save periódico.
     */
    pararAutoSave() {
      if (this._autoSaveTimer) {
        clearInterval(this._autoSaveTimer);
        this._autoSaveTimer = null;
      }
    }

    /**
     * Executa um salvamento imediato sob demanda (ex.: após execução de comando).
     */
    async executarAutoSaveImediato(motivo = 'comando') {
      if (typeof this._obterEstadoFn !== 'function') return null;
      try {
        const estadoAtual = this._obterEstadoFn();
        return await this.salvarSnapshotCompleto(estadoAtual, motivo);
      } catch (err) {
        console.warn('[SOUSA-IndexedDB] Erro ao obter estado para auto-save:', err);
        return null;
      }
    }

    /**
     * Obtém o status operacional do motor de Auto-Save.
     */
    obterStatusAutoSave() {
      return {
        ativo: !!this._autoSaveTimer,
        intervaloSegundos: this._autoSaveIntervalo,
        ultimoSalvamento: this._ultimoSalvamento,
        contadorTotal: this._contadorAutoSaves
      };
    }

    /**
     * ROTATIVIDADE DE LOGS (LOG ROTATION):
     * Arquiva ou remove registros com mais de N dias (padrão 7 dias),
     * garantindo que o IndexedDB permaneça veloz, leve e eficiente.
     * 
     * @param {number} diasLimite Quantidade de dias de retenção (padrão 7)
     * @param {string} acao 'expurgar' (remove) ou 'arquivar' (coleta antes de remover)
     */
    async executarRotatividadeLogs(diasLimite = 7, acao = 'expurgar') {
      await this.init();
      if (!this.db) {
        return { ok: false, mensagem: 'IndexedDB não inicializado', excluidos: 0 };
      }

      const msLimite = (Number(diasLimite) || 7) * 24 * 60 * 60 * 1000;
      const dataCorte = Date.now() - msLimite;
      const dataCorteIso = new Date(dataCorte).toISOString();

      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(STORES.LOGS, 'readwrite');
          const store = tx.objectStore(STORES.LOGS);
          let totalAnalisados = 0;
          let totalExcluidos = 0;
          const registrosArquivados = [];

          const req = store.openCursor();
          req.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
              totalAnalisados++;
              const valor = cursor.value;
              const timestampLog = valor.criadoEm || (valor.ts ? new Date(valor.ts).getTime() : 0);

              // Se for mais antigo que o limite de 7 dias
              if (timestampLog && timestampLog < dataCorte) {
                if (acao === 'arquivar') {
                  registrosArquivados.push(valor);
                }
                cursor.delete();
                totalExcluidos++;
              }
              cursor.continue();
            } else {
              const resultado = {
                ok: true,
                diasLimite,
                dataCorte: dataCorteIso,
                totalAnalisados,
                totalExcluidos,
                totalMantidos: totalAnalisados - totalExcluidos,
                acao,
                arquivados: registrosArquivados,
                executadoEm: new Date().toISOString()
              };

              // Registra auditoria da rotação de logs no próprio banco
              this.salvarLog({
                ts: new Date().toLocaleTimeString(),
                tipo: 'MANUT',
                modulo: 'STORAGE',
                msg: `Rotatividade de logs: ${totalExcluidos} registros com > ${diasLimite} dias removidos. ${totalAnalisados - totalExcluidos} mantidos.`
              });

              resolve(resultado);
            }
          };

          req.onerror = (err) => {
            resolve({ ok: false, erro: err.target.error, totalExcluidos: 0 });
          };
        } catch (err) {
          resolve({ ok: false, erro: err.message, totalExcluidos: 0 });
        }
      });
    }

    /**
     * Conta quantos logs estão expirados (> 7 dias) sem excluí-los.
     */
    async obterLogsExpirados(diasLimite = 7) {
      await this.init();
      if (!this.db) return { total: 0, expirados: 0 };

      const msLimite = (Number(diasLimite) || 7) * 24 * 60 * 60 * 1000;
      const dataCorte = Date.now() - msLimite;

      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(STORES.LOGS, 'readonly');
          const store = tx.objectStore(STORES.LOGS);
          let total = 0;
          let expirados = 0;

          const req = store.openCursor();
          req.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
              total++;
              const timestampLog = cursor.value.criadoEm || 0;
              if (timestampLog && timestampLog < dataCorte) {
                expirados++;
              }
              cursor.continue();
            } else {
              resolve({ total, expirados, dataCorte: new Date(dataCorte).toISOString() });
            }
          };
          req.onerror = () => resolve({ total: 0, expirados: 0 });
        } catch (_) {
          resolve({ total: 0, expirados: 0 });
        }
      });
    }

    async limparTudo() {
      await Promise.all([
        this.limparLogs(),
        this.limparTelemetria(),
        this._executarTransacao(STORES.ESTADO, 'readwrite', (s) => s.clear())
      ]);
      return true;
    }
  }

  // Instância singleton global
  const instancia = new SousaIndexedDBService();
  root.SousaIndexedDB = instancia;

  // Se estiver em ambiente Node.js / CommonJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = instancia;
  }
})(typeof window !== 'undefined' ? window : globalThis);
