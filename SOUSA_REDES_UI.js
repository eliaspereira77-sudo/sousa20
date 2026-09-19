/**
 * ============================================================================
 * SOUSA 2.0 • INTERFACE DE SINCRONIZAÇÃO DE REDES SOCIAIS
 * Plataformas: TikTok, Kwai, X (Twitter), Gettr, YouTube
 * Design Soberano: Azul Profundo & Dourado Nobre
 * ============================================================================
 */

(function () {
  const METADADOS_REDES = {
    youtube: {
      nome: "YouTube",
      icone: "▶️",
      cor: "#FF0000",
      desc: "YouTube Data API v3 • Canal Oficial, Vídeos e Métricas",
      campos: [
        { key: "channel_id", label: "ID do Canal (Channel ID):", placeholder: "UC... ou @usuario" },
        { key: "api_key", label: "Google / YouTube API Key:", placeholder: "AIzaSy...", secret: true },
        { key: "access_token", label: "OAuth Access Token (Opcional):", placeholder: "ya29...", secret: true }
      ]
    },
    x: {
      nome: "X (Twitter)",
      icone: "𝕏",
      cor: "#1D9BF0",
      desc: "X Developer API v2 • Perfil, Seguidores e Posts",
      campos: [
        { key: "username", label: "Nome de Usuário (@handle):", placeholder: "eliaspereira77" },
        { key: "bearer_token", label: "Bearer Token (API v2):", placeholder: "AAAA...", secret: true },
        { key: "api_key", label: "API Key (Consumer Key):", placeholder: "Chave da API", secret: true },
        { key: "api_secret", label: "API Secret Key:", placeholder: "Secret da API", secret: true }
      ]
    },
    tiktok: {
      nome: "TikTok",
      icone: "🎵",
      cor: "#FE2C55",
      desc: "TikTok for Developers • Métricas de Criador e Vídeos",
      campos: [
        { key: "username", label: "Usuário / Conta TikTok:", placeholder: "@eliaspereiradesousa" },
        { key: "client_key", label: "Client Key:", placeholder: "aw...", secret: true },
        { key: "client_secret", label: "Client Secret:", placeholder: "Secret da App", secret: true },
        { key: "access_token", label: "Access Token (Opcional):", placeholder: "act....", secret: true }
      ]
    },
    kwai: {
      nome: "Kwai",
      icone: "⚡",
      cor: "#FF5000",
      desc: "Kwai Open Platform • Perfil Criador e Alcance",
      campos: [
        { key: "user_id", label: "ID de Usuário / Perfil Kwai:", placeholder: "kwai_user_id" },
        { key: "app_id", label: "Kwai App ID:", placeholder: "App ID", secret: true },
        { key: "app_secret", label: "Kwai App Secret:", placeholder: "App Secret", secret: true },
        { key: "access_token", label: "Access Token:", placeholder: "Token de Acesso", secret: true }
      ]
    },
    gettr: {
      nome: "Gettr",
      icone: "🔴",
      cor: "#EE1B24",
      desc: "Gettr Public & Partner API • Posts e Seguidores Soberanos",
      campos: [
        { key: "username", label: "Handle / Usuário Gettr:", placeholder: "eliaspereiradesousa" },
        { key: "user_token", label: "User Token / Session Key:", placeholder: "Token Gettr", secret: true },
        { key: "api_key", label: "API Key (Opcional):", placeholder: "Gettr API Key", secret: true }
      ]
    },
    rumble: {
      nome: "Rumble",
      icone: "🟢",
      cor: "#85C742",
      desc: "Rumble Video & Live Stream • Canais e Transmissões Livres",
      campos: [
        { key: "channel_name", label: "Nome do Canal ou Usuário:", placeholder: "ex: eliaspereira ou sousa20" },
        { key: "api_key", label: "Chave de API / Stream Key:", placeholder: "Chave Rumble", secret: true },
        { key: "user_id", label: "User ID / Channel ID (Opcional):", placeholder: "ID de usuário" }
      ]
    },
    bitchute: {
      nome: "BitChute",
      icone: "🔺",
      cor: "#E53935",
      desc: "BitChute P2P Media Platform • Conteúdo Descentralizado",
      campos: [
        { key: "channel_name", label: "Canal BitChute (Slug/Código):", placeholder: "ex: eliaspereira ou canal_id" },
        { key: "api_token", label: "API Token / Auth Token (Opcional):", placeholder: "Token BitChute", secret: true },
        { key: "user_id", label: "User ID (Opcional):", placeholder: "ID de usuário" }
      ]
    },
    instagram: {
      nome: "Instagram",
      icone: "📸",
      cor: "#E1306C",
      desc: "Instagram Graph & Perfil • Feed, Reels e Audiência Soberana",
      campos: [
        { key: "username", label: "Nome de Usuário (@handle):", placeholder: "pereiradesousaelias" },
        { key: "access_token", label: "Instagram Graph API Token (Opcional):", placeholder: "IGQ...", secret: true },
        { key: "app_id", label: "Meta / Instagram App ID (Opcional):", placeholder: "Meta App ID" }
      ]
    }
  };

  class SousaRedesUI {
    constructor() {
      this.statusRedes = {};
      this.carregando = false;
      this.modalAberto = null;
      this.configurarOauthListener();
    }

    configurarOauthListener() {
      window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'OAUTH_AUTH_SUCCESS') {
          console.log("[SOUSA_REDES] Autenticação OAuth concluída pelo popup.");
          this.sincronizarTodas();
        }
      });
    }

    async inicializar() {
      await this.carregarStatus();
      this.renderizarPainel();
    }

    async carregarStatus() {
      try {
        const resp = await fetch('/api/redes/status');
        if (resp.ok) {
          this.statusRedes = await resp.json();
        }
      } catch (err) {
        console.warn("[SOUSA_REDES] Não foi possível carregar status das redes:", err);
      }
    }

    renderizarPainel() {
      const container = document.getElementById('painel-redes-sociais-sync');
      if (!container) return;

      const redes = Object.keys(METADADOS_REDES);

      let html = `
        <div class="painel-nobre" style="border: 2px solid var(--dourado-medio); background: linear-gradient(180deg, rgba(8, 28, 68, 0.95), rgba(4, 16, 40, 0.98)); box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.2rem; border-bottom: 1px solid rgba(212, 160, 40, 0.3); padding-bottom: 0.9rem;">
            <div>
              <div class="titulo-secao" style="margin-bottom: 0.2rem; display: flex; align-items: center; gap: 0.6rem;">
                <span>🌐</span> SINCRONIZAÇÃO SOBERANA DE REDES SOCIAIS
              </div>
              <div style="font-size: 0.83rem; color: #D4DCE8;">
                Gestão unificada e multi-plataforma: <b>Instagram</b>, <b>YouTube</b>, <b>TikTok</b>, <b>Kwai</b>, <b>X (Twitter)</b>, <b>Gettr</b>, <b>Rumble</b> e <b>BitChute</b>.
              </div>
            </div>

            <div style="display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap;">
              <button class="botao-dourado" id="btn-sync-todas-redes" type="button" onclick="window.SousaRedes.sincronizarTodas()" style="font-size: 0.85rem; padding: 0.5rem 1.2rem; display: flex; align-items: center; gap: 0.4rem; font-weight: bold;">
                <span>⚡</span> SINCRONIZAR TODAS (8/8)
              </button>
            </div>
          </div>

          <!-- CARDS GRID DAS REDES -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;" id="grid-cards-redes">
      `;

      for (const id of redes) {
        const meta = METADADOS_REDES[id];
        const status = this.statusRedes[id] || {};
        const conectado = status.conectado;
        const usuario = status.usuario || "Não configurado";
        const ultimaSync = status.ultimaSincronizacao ? new Date(status.ultimaSincronizacao).toLocaleTimeString() : "--:--:--";
        const statusMsg = status.statusDetalhado || "Aguardando sincronização";

        // Métricas formatadas
        const metricas = status.metricas || {};
        let metricasHtml = "";
        if (id === 'youtube') {
          metricasHtml = `
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: #BBB; background: rgba(0,0,0,0.25); padding: 0.4rem 0.6rem; border-radius: 6px;">
              <span>Inscritos: <b style="color:#FFF;">${(metricas.inscritos || 0).toLocaleString()}</b></span>
              <span>Vídeos: <b style="color:#FFF;">${(metricas.videos || 0).toLocaleString()}</b></span>
              <span>Views: <b style="color:#FFF;">${(metricas.visualizacoes || 0).toLocaleString()}</b></span>
            </div>
          `;
        } else if (id === 'rumble') {
          metricasHtml = `
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: #BBB; background: rgba(0,0,0,0.25); padding: 0.4rem 0.6rem; border-radius: 6px;">
              <span>Inscritos: <b style="color:#FFF;">${(metricas.inscritos || 0).toLocaleString()}</b></span>
              <span>Vídeos: <b style="color:#FFF;">${(metricas.videos || 0).toLocaleString()}</b></span>
              <span>Curtidas: <b style="color:#FFF;">${(metricas.curtidas || 0).toLocaleString()}</b></span>
            </div>
          `;
        } else if (id === 'bitchute') {
          metricasHtml = `
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: #BBB; background: rgba(0,0,0,0.25); padding: 0.4rem 0.6rem; border-radius: 6px;">
              <span>Inscritos: <b style="color:#FFF;">${(metricas.inscritos || 0).toLocaleString()}</b></span>
              <span>Vídeos: <b style="color:#FFF;">${(metricas.videos || 0).toLocaleString()}</b></span>
              <span>Views: <b style="color:#FFF;">${(metricas.visualizacoes || 0).toLocaleString()}</b></span>
            </div>
          `;
        } else if (id === 'x' || id === 'gettr' || id === 'instagram') {
          metricasHtml = `
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: #BBB; background: rgba(0,0,0,0.25); padding: 0.4rem 0.6rem; border-radius: 6px;">
              <span>Seguidores: <b style="color:#FFF;">${(metricas.seguidores || 0).toLocaleString()}</b></span>
              <span>Seguindo: <b style="color:#FFF;">${(metricas.seguindo || 0).toLocaleString()}</b></span>
              <span>Posts: <b style="color:#FFF;">${(metricas.posts || 0).toLocaleString()}</b></span>
            </div>
          `;
        } else {
          metricasHtml = `
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: #BBB; background: rgba(0,0,0,0.25); padding: 0.4rem 0.6rem; border-radius: 6px;">
              <span>Seguidores: <b style="color:#FFF;">${(metricas.seguidores || 0).toLocaleString()}</b></span>
              <span>Curtidas: <b style="color:#FFF;">${(metricas.curtidas || 0).toLocaleString()}</b></span>
              <span>Vídeos: <b style="color:#FFF;">${(metricas.videos || 0).toLocaleString()}</b></span>
            </div>
          `;
        }

        html += `
          <div style="background: rgba(4, 18, 48, 0.85); border: 1.5px solid ${conectado ? 'var(--verde-status)' : 'rgba(212, 160, 40, 0.4)'}; border-radius: 10px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between; gap: 0.8rem; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 1.05rem; font-weight: bold; color: var(--dourado-claro);">
                  <span style="font-size: 1.3rem;">${meta.icone}</span>
                  <span>${meta.nome}</span>
                </div>
                <span style="font-size: 0.7rem; font-family: var(--font-mono); font-weight: bold; padding: 0.2rem 0.55rem; border-radius: 12px; background: ${conectado ? 'rgba(72, 224, 72, 0.15)' : 'rgba(255, 138, 128, 0.15)'}; border: 1px solid ${conectado ? 'var(--verde-status)' : '#FF8A80'}; color: ${conectado ? 'var(--verde-status)' : '#FF8A80'};">
                  ${conectado ? '● CONECTADO' : '○ PENDENTE'}
                </span>
              </div>

              <div style="font-size: 0.78rem; color: #AAA; line-height: 1.4; margin-bottom: 0.6rem;">
                ${meta.desc}
              </div>

              <div style="font-size: 0.82rem; margin-bottom: 0.6rem; color: #FFF;">
                Perfil: <span style="color: var(--dourado-claro); font-family: var(--font-mono); font-weight: bold;">${usuario}</span>
              </div>

              ${metricasHtml}
            </div>

            <div>
              <div style="font-size: 0.72rem; color: #888; font-family: var(--font-mono); margin-bottom: 0.6rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${statusMsg}">
                Status: ${statusMsg}
              </div>

              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <button class="botao-dourado" type="button" onclick="window.SousaRedes.sincronizarRede('${id}')" id="btn-sync-${id}" style="flex: 1; font-size: 0.78rem; padding: 0.4rem 0.6rem; font-weight: bold;">
                  ⚡ Sincronizar
                </button>
                <button class="botao-azul" type="button" onclick="window.SousaRedes.abrirModalCredenciais('${id}')" style="font-size: 0.78rem; padding: 0.4rem 0.6rem; border-color: rgba(212,160,40,0.6); color: var(--dourado-claro);" title="Configurar chaves, tokens e credenciais">
                  🔑 Credenciais
                </button>
              </div>
            </div>
          </div>
        `;
      }

      html += `
          </div>
          
          <!-- ORIENTAÇÃO DE CONFIGURAÇÃO SOBERANA -->
          <div style="margin-top: 1.2rem; padding: 0.8rem 1rem; background: rgba(0,0,0,0.3); border-radius: 8px; border-left: 3px solid var(--dourado-claro); font-size: 0.8rem; color: #CCC; line-height: 1.6;">
            🛡️ <b>Segurança e Custódia de Credenciais</b>: Suas credenciais e chaves de API podem ser sincronizadas via o formulário direto de cada plataforma ou declaradas no arquivo de ambiente <code>.env</code>. As chamadas são processadas diretamente no núcleo seguro Node.js local.
          </div>
        </div>
      `;

      container.innerHTML = html;
    }

    async sincronizarRede(id) {
      const btn = document.getElementById(`btn-sync-${id}`);
      const textoOriginal = btn ? btn.innerHTML : "";
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span>⏳</span> Sincronizando...`;
      }

      try {
        const resp = await fetch('/api/redes/sincronizar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rede: id })
        });
        const res = await resp.json();

        await this.carregarStatus();
        this.renderizarPainel();

        if (res.ok) {
          this.notificar(`✓ ${res.rede} sincronizado com sucesso!`, 'sucesso');
          if (window.adicionarLog) {
            window.adicionarLog(`Rede ${res.rede} sincronizada via credenciais: ${res.usuario || ''}`);
          }
        } else {
          this.notificar(`Atenção em ${res.rede}: ${res.erro || res.status}`, 'aviso');
        }
      } catch (err) {
        this.notificar(`Erro ao sincronizar: ${err.message}`, 'erro');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = textoOriginal;
        }
      }
    }

    async sincronizarTodas() {
      const btn = document.getElementById('btn-sync-todas-redes');
      const textoOriginal = btn ? btn.innerHTML : "";
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span>⏳</span> Sincronizando 5 Redes...`;
      }

      try {
        const resp = await fetch('/api/redes/sincronizar-todas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await resp.json();

        await this.carregarStatus();
        this.renderizarPainel();

        this.notificar("⚡ Sincronização das 5 plataformas concluída.", 'sucesso');
        if (window.adicionarLog) {
          window.adicionarLog("Sincronização global executada: TikTok, Kwai, X, Gettr e YouTube.");
        }
      } catch (err) {
        this.notificar(`Erro na sincronização global: ${err.message}`, 'erro');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = textoOriginal;
        }
      }
    }

    abrirModalCredenciais(id) {
      const meta = METADADOS_REDES[id];
      if (!meta) return;

      const status = this.statusRedes[id] || {};
      const credsExistentes = status.credenciaisConfiguradas || {};

      let camposHtml = "";
      for (const c of meta.campos) {
        const valorAtual = credsExistentes[c.key] || "";
        camposHtml += `
          <div style="margin-bottom: 0.9rem;">
            <label style="display: block; font-size: 0.82rem; color: #E0E0E0; font-weight: bold; margin-bottom: 0.35rem;">
              ${c.label}
            </label>
            <input type="${c.secret ? 'password' : 'text'}" id="cred-${id}-${c.key}" value="${valorAtual}" placeholder="${c.placeholder}" 
              style="width: 100%; box-sizing: border-box; background: rgba(3, 12, 30, 0.9); border: 1.5px solid rgba(212, 160, 40, 0.5); color: #FFF; padding: 0.6rem 0.8rem; border-radius: 6px; font-family: var(--font-mono); font-size: 0.85rem;">
          </div>
        `;
      }

      let modal = document.getElementById('modal-credenciais-rede');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-credenciais-rede';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.backgroundColor = 'rgba(0, 5, 20, 0.85)';
        modal.style.backdropFilter = 'blur(6px)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '99999';
        document.body.appendChild(modal);
      }

      modal.innerHTML = `
        <div style="background: linear-gradient(180deg, #0A2452, #041432); border: 2px solid var(--dourado-claro); border-radius: 12px; width: 92%; max-width: 540px; padding: 1.5rem; box-shadow: 0 15px 50px rgba(0,0,0,0.8); color: #FFF; animation: fadeIn 0.2s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(212, 160, 40, 0.3); padding-bottom: 0.8rem; margin-bottom: 1.2rem;">
            <div style="font-size: 1.15rem; font-weight: bold; color: var(--dourado-claro); display: flex; align-items: center; gap: 0.5rem;">
              <span>${meta.icone}</span> Credenciais: ${meta.nome}
            </div>
            <button type="button" onclick="window.SousaRedes.fecharModal()" style="background: none; border: none; color: #FFF; font-size: 1.4rem; cursor: pointer;">✕</button>
          </div>

          <div style="font-size: 0.82rem; color: #CCC; margin-bottom: 1.2rem; line-height: 1.5;">
            Insira suas credenciais ou tokens de desenvolvedor para sincronizar dados e métricas em tempo real.
          </div>

          <form id="form-credenciais-${id}" onsubmit="event.preventDefault(); window.SousaRedes.salvarCredenciais('${id}');">
            ${camposHtml}

            <div style="display: flex; gap: 0.8rem; justify-content: flex-end; margin-top: 1.4rem; border-top: 1px solid rgba(212, 160, 40, 0.2); padding-top: 1rem;">
              <button class="botao-azul" type="button" onclick="window.SousaRedes.fecharModal()" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
                Cancelar
              </button>
              <button class="botao-dourado" type="submit" style="font-size: 0.85rem; padding: 0.5rem 1.4rem; font-weight: bold;">
                💾 Salvar & Sincronizar
              </button>
            </div>
          </form>
        </div>
      `;

      modal.style.display = 'flex';
      this.modalAberto = id;
    }

    fecharModal() {
      const modal = document.getElementById('modal-credenciais-rede');
      if (modal) modal.style.display = 'none';
      this.modalAberto = null;
    }

    async salvarCredenciais(id) {
      const meta = METADADOS_REDES[id];
      if (!meta) return;

      const novasCreds = {};
      for (const c of meta.campos) {
        const el = document.getElementById(`cred-${id}-${c.key}`);
        if (el) {
          novasCreds[c.key] = el.value.trim();
        }
      }

      try {
        const resp = await fetch('/api/redes/salvar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rede: id, credenciais: novasCreds })
        });
        const res = await resp.json();

        if (res.ok) {
          this.fecharModal();
          this.notificar(`Credenciais de ${meta.nome} salvas. Disparando teste...`, 'sucesso');
          await this.sincronizarRede(id);
        } else {
          this.notificar(`Erro ao salvar: ${res.erro}`, 'erro');
        }
      } catch (err) {
        this.notificar(`Falha: ${err.message}`, 'erro');
      }
    }

    notificar(mensagem, tipo = 'info') {
      console.log(`[SOUSA_REDES][${tipo}] ${mensagem}`);
      let toast = document.getElementById('toast-redes-sync');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-redes-sync';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.zIndex = '999999';
        toast.style.padding = '0.75rem 1.2rem';
        toast.style.borderRadius = '8px';
        toast.style.fontSize = '0.85rem';
        toast.style.fontFamily = 'sans-serif';
        toast.style.fontWeight = 'bold';
        toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6)';
        toast.style.transition = 'opacity 0.3s ease';
        document.body.appendChild(toast);
      }

      if (tipo === 'sucesso') {
        toast.style.backgroundColor = '#0A4A28';
        toast.style.color = '#72F672';
        toast.style.border = '1px solid #72F672';
      } else if (tipo === 'erro') {
        toast.style.backgroundColor = '#5A0E12';
        toast.style.color = '#FF8A80';
        toast.style.border = '1px solid #FF8A80';
      } else {
        toast.style.backgroundColor = '#0A2A66';
        toast.style.color = '#F8D478';
        toast.style.border = '1px solid #F8D478';
      }

      toast.textContent = mensagem;
      toast.style.opacity = '1';
      toast.style.display = 'block';

      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { toast.style.display = 'none'; }, 300);
      }, 4000);
    }
  }

  window.SousaRedes = new SousaRedesUI();

  // Inicialização automática ao carregar o DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.SousaRedes.inicializar());
  } else {
    window.SousaRedes.inicializar();
  }
})();
