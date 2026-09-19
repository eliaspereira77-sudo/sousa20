/**
 * ============================================================================
 * SOUSA 2.0 — BACKUP EXTERNO & REDUNDÂNCIA EM NUVEM VIA GOOGLE DRIVE API
 * Módulo de Autenticação OAuth2 (Firebase Auth) e Sincronização em Nuvem
 * ============================================================================
 * 
 * Permite:
 *  - Autenticação OAuth2 oficial com Google (Scope: drive.file)
 *  - Token de acesso mantido estritamente em memória (sem localStorage/sessionStorage)
 *  - Envio de backups estruturados do SOUSA 2.0 (Config, Módulos, IndexedDB)
 *  - Agendamento de backups automáticos (1h, 6h, 12h, 24h)
 *  - Listagem e download de backups armazenados no Google Drive
 * 
 * Autoridade: Elias Pereira de Sousa
 * Sistema: SOUSA 2.0
 * ============================================================================
 */

(function(root) {
  'use strict';

  const SCOPE_DRIVE = 'https://www.googleapis.com/auth/drive.file';
  const CONFIG_STORAGE_KEY = 'SOUSA_20_DRIVE_BACKUP_CFG';

  let _firebaseApp = null;
  let _firebaseAuth = null;
  let _googleProvider = null;
  let _cachedAccessToken = null;
  let _currentUser = null;
  let _authInitialized = false;
  let _authListeners = [];
  let _backupIntervalTimer = null;
  let _emUpload = false;

  const SousaGoogleDriveBackup = {
    scopes: [SCOPE_DRIVE],

    /**
     * Inicializa a integração com Firebase Auth e Google Drive API.
     */
    async init() {
      if (_authInitialized) return true;

      try {
        // Carrega configurações dinamicamente de /firebase-applet-config.json
        const resp = await fetch('/firebase-applet-config.json');
        if (!resp.ok) {
          console.warn('[SOUSA-Drive] firebase-applet-config.json não disponível.');
          return false;
        }
        const firebaseConfig = await resp.json();

        // Carrega SDK modular do Firebase via import nativo ESM
        const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
        const { 
          getAuth, 
          GoogleAuthProvider, 
          signInWithPopup, 
          signOut, 
          onAuthStateChanged 
        } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');

        const apps = getApps();
        _firebaseApp = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
        _firebaseAuth = getAuth(_firebaseApp);

        _googleProvider = new GoogleAuthProvider();
        _googleProvider.addScope(SCOPE_DRIVE);
        _googleProvider.setCustomParameters({ prompt: 'select_account' });

        // Listener de estado de autenticação
        onAuthStateChanged(_firebaseAuth, async (user) => {
          _currentUser = user;
          if (!user) {
            _cachedAccessToken = null;
          }
          _authListeners.forEach((cb) => {
            try { cb(user, _cachedAccessToken); } catch (_) {}
          });
        });

        _authInitialized = true;
        this._iniciarAgendamentoSalvo();
        return true;
      } catch (err) {
        console.warn('[SOUSA-Drive] Erro na inicialização do Firebase Auth:', err);
        return false;
      }
    },

    /**
     * Adiciona ouvinte de mudança de estado de autenticação.
     */
    onAuthStateChanged(callback) {
      if (typeof callback === 'function') {
        _authListeners.push(callback);
        if (_authInitialized && _currentUser) {
          callback(_currentUser, _cachedAccessToken);
        }
      }
    },

    /**
     * Dispara o fluxo de login popup oficial com o Google.
     */
    async loginGoogle() {
      await this.init();
      if (!_firebaseAuth || !_googleProvider) {
        throw new Error('Firebase Auth não inicializado.');
      }

      const { signInWithPopup, GoogleAuthProvider } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
      
      const resultado = await signInWithPopup(_firebaseAuth, _googleProvider);
      const credencial = GoogleAuthProvider.credentialFromResult(resultado);

      if (!credencial?.accessToken) {
        throw new Error('Não foi possível obter o token de acesso da conta Google.');
      }

      // Mantido em memória estrita
      _cachedAccessToken = credencial.accessToken;
      _currentUser = resultado.user;

      _authListeners.forEach((cb) => {
        try { cb(_currentUser, _cachedAccessToken); } catch (_) {}
      });

      return {
        user: _currentUser,
        accessToken: _cachedAccessToken
      };
    },

    /**
     * Desconecta a conta Google e limpa o token em memória.
     */
    async logoutGoogle() {
      if (_firebaseAuth) {
        const { signOut } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        await signOut(_firebaseAuth);
      }
      _cachedAccessToken = null;
      _currentUser = null;

      _authListeners.forEach((cb) => {
        try { cb(null, null); } catch (_) {}
      });
      return true;
    },

    /**
     * Retorna o token de acesso em memória (se válido).
     */
    getAccessToken() {
      return _cachedAccessToken;
    },

    /**
     * Retorna os dados do usuário autenticado.
     */
    getCurrentUser() {
      return _currentUser;
    },

    /**
     * Testa a conexão real com a Google Drive API usando o token em memória.
     */
    async testarConexaoDrive() {
      const token = this.getAccessToken();
      if (!token) {
        return { ok: false, mensagem: 'Usuário não autenticado no Google Drive.' };
      }

      try {
        const resp = await fetch('https://www.googleapis.com/drive/v3/about?fields=user,storageQuota', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!resp.ok) {
          if (resp.status === 401) {
            _cachedAccessToken = null;
            return { ok: false, status: 401, mensagem: 'Sessão expirada. Faça login novamente no Google Drive.' };
          }
          const erroData = await resp.json().catch(() => ({}));
          return { ok: false, erro: erroData, mensagem: 'Falha ao comunicar com a Google Drive API.' };
        }

        const data = await resp.json();
        return {
          ok: true,
          usuario: data.user,
          armazenamento: data.storageQuota,
          mensagem: 'Conexão com Google Drive API verificada com sucesso.'
        };
      } catch (err) {
        return { ok: false, erro: err.message, mensagem: 'Erro de rede na verificação do Google Drive.' };
      }
    },

    /**
     * Envia um arquivo de backup estruturado para o Google Drive do usuário.
     * 
     * @param {Object} dados - Objeto JSON completo a ser persistido
     * @param {Object} opcoes - { nomePersonalizado, confirmarAntes }
     */
    async enviarBackupParaDrive(dados, opcoes = {}) {
      if (_emUpload) {
        return { ok: false, mensagem: 'Outro upload já está em andamento.' };
      }

      const token = this.getAccessToken();
      if (!token) {
        return { ok: false, precisaLogin: true, mensagem: 'Conecte sua conta Google Drive antes de realizar o backup.' };
      }

      const agora = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const timestampTag = `${agora.getFullYear()}-${pad(agora.getMonth()+1)}-${pad(agora.getDate())}_${pad(agora.getHours())}${pad(agora.getMinutes())}${pad(agora.getSeconds())}`;
      const nomeArquivo = opcoes.nomePersonalizado || `SOUSA_2.0_BACKUP_${timestampTag}.json`;

      // Confirmação explícita de operação se solicitado
      if (opcoes.confirmarAntes) {
        const confirmar = window.confirm(
          `Deseja criar e sincronizar o backup "${nomeArquivo}" no seu Google Drive pessoal?`
        );
        if (!confirmar) {
          return { ok: false, cancelado: true, mensagem: 'Envio cancelado pelo usuário.' };
        }
      }

      _emUpload = true;

      try {
        const conteudoJson = JSON.stringify(dados || {}, null, 2);
        const metadata = {
          name: nomeArquivo,
          mimeType: 'application/json',
          description: `Backup de redundância externa do SOUSA 2.0 • Gerado em ${agora.toLocaleString()} • Autoridade: Elias Pereira de Sousa`,
          properties: {
            sistema: 'SOUSA 2.0',
            tipo: 'BACKUP_REDUNDANCIA_NUVEM',
            versao: '2.0.0'
          }
        };

        const boundary = '-------SOUSA_DRIVE_BOUNDARY_' + Date.now();
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelimiter = `\r\n--${boundary}--`;

        const multipartRequestBody =
          delimiter +
          'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          conteudoJson +
          closeDelimiter;

        const resp = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,createdTime,webViewLink', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`
          },
          body: multipartRequestBody
        });

        if (!resp.ok) {
          const erroDetalhes = await resp.json().catch(() => ({}));
          throw new Error(erroDetalhes.error?.message || `HTTP ${resp.status}`);
        }

        const arquivoCriado = await resp.json();

        // Salva histórico de backups enviados no armazenamento local do usuário
        this._registrarHistoricoBackup({
          id: arquivoCriado.id,
          nome: arquivoCriado.name,
          tamanho: arquivoCriado.size || conteudoJson.length,
          criadoEm: arquivoCriado.createdTime || agora.toISOString(),
          link: arquivoCriado.webViewLink,
          status: 'ENVIADO_SUCESSO'
        });

        return {
          ok: true,
          arquivo: arquivoCriado,
          mensagem: `Backup "${arquivoCriado.name}" salvo no Google Drive com sucesso!`
        };
      } catch (err) {
        console.error('[SOUSA-Drive] Falha ao enviar backup:', err);
        return {
          ok: false,
          erro: err.message,
          mensagem: `Erro ao enviar backup para o Google Drive: ${err.message}`
        };
      } finally {
        _emUpload = false;
      }
    },

    /**
     * Lista backups criados pelo SOUSA 2.0 no Google Drive.
     */
    async listarBackupsNoDrive(limite = 20) {
      const token = this.getAccessToken();
      if (!token) return [];

      try {
        const query = encodeURIComponent("name contains 'SOUSA_2.0_BACKUP' and trashed = false");
        const url = `https://www.googleapis.com/drive/v3/files?q=${query}&pageSize=${limite}&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink)&orderBy=createdTime+desc`;

        const resp = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!resp.ok) return [];
        const data = await resp.json();
        return data.files || [];
      } catch (err) {
        console.warn('[SOUSA-Drive] Erro ao listar backups:', err);
        return [];
      }
    },

    /**
     * Configura e gerencia o agendamento de backups automáticos.
     */
    configurarAgendamento(config, obterDadosBackupFn) {
      const novaCfg = {
        ativo: Boolean(config.ativo),
        intervaloHoras: Number(config.intervaloHoras) || 6, // Padrão a cada 6 horas
        ultimoBackupNuvem: config.ultimoBackupNuvem || null
      };

      try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(novaCfg));
      } catch (_) {}

      if (this._obterDadosFn || obterDadosBackupFn) {
        this._obterDadosFn = obterDadosBackupFn || this._obterDadosFn;
      }

      this._aplicarAgendamento(novaCfg);
      return novaCfg;
    },

    obterConfiguracaoAgendamento() {
      try {
        const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (_) {}
      return {
        ativo: false,
        intervaloHoras: 6,
        ultimoBackupNuvem: null
      };
    },

    _iniciarAgendamentoSalvo() {
      const cfg = this.obterConfiguracaoAgendamento();
      if (cfg.ativo) {
        this._aplicarAgendamento(cfg);
      }
    },

    _aplicarAgendamento(cfg) {
      if (_backupIntervalTimer) {
        clearInterval(_backupIntervalTimer);
        _backupIntervalTimer = null;
      }

      if (!cfg.ativo) return;

      const msIntervalo = cfg.intervaloHoras * 60 * 60 * 1000;
      _backupIntervalTimer = setInterval(async () => {
        if (!this.getAccessToken()) return;
        if (typeof this._obterDadosFn !== 'function') return;

        try {
          console.log('[SOUSA-Drive] Executando rotina agendada de backup em nuvem...');
          const dados = await this._obterDadosFn();
          const resultado = await this.enviarBackupParaDrive(dados, { confirmarAntes: false });
          if (resultado.ok) {
            const cfgAtual = this.obterConfiguracaoAgendamento();
            cfgAtual.ultimoBackupNuvem = new Date().toISOString();
            localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(cfgAtual));
            
            // Registra nos logs do sistema
            if (root.SousaIndexedDB && root.SousaIndexedDB.salvarLog) {
              root.SousaIndexedDB.salvarLog({
                ts: new Date().toLocaleTimeString(),
                tipo: 'BACKUP',
                modulo: 'DRIVE',
                msg: `Backup automático agendado enviado para o Google Drive: ${resultado.arquivo?.name}`
              });
            }
          }
        } catch (e) {
          console.warn('[SOUSA-Drive] Falha no ciclo agendado:', e);
        }
      }, msIntervalo);

      console.log(`[SOUSA-Drive] Agendamento ativado: ciclo de backup a cada ${cfg.intervaloHoras}h.`);
    },

    _registrarHistoricoBackup(item) {
      try {
        const chave = 'SOUSA_20_DRIVE_HISTORICO';
        const lista = JSON.parse(localStorage.getItem(chave) || '[]');
        lista.unshift(item);
        if (lista.length > 30) lista.pop();
        localStorage.setItem(chave, JSON.stringify(lista));
      } catch (_) {}
    },

    obterHistoricoLocalBackups() {
      try {
        return JSON.parse(localStorage.getItem('SOUSA_20_DRIVE_HISTORICO') || '[]');
      } catch (_) {
        return [];
      }
    }
  };

  root.SousaGoogleDriveBackup = SousaGoogleDriveBackup;
})(typeof window !== 'undefined' ? window : globalThis);
