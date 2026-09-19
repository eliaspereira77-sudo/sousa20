/**
 * ============================================================================
 * SOUSA 2.0 — ORQUESTRADOR DE ENXAME DE AGENTES (AGENT SWARM MANAGER)
 * Gerenciador de Múltiplas Instâncias Autônomas Simultâneas
 * ============================================================================
 * 
 * Permite orquestrar, monitorar e direcionar instâncias autônomas do SOUSA 2.0
 * com hierarquia estrita, focos de atuação customizados e balanceamento de carga.
 * 
 * Autoridade: Elias Pereira de Sousa
 * Sistema: SOUSA 2.0
 * ============================================================================
 */

(function(root) {
  'use strict';

  const NIVEIS_HIERARQUIA = {
    1: {
      nivel: 1,
      titulo: "NÍVEL 1: COMANDO SOBERANO & ORQUESTRADOR MASTER",
      cor: "var(--dourado-nobre, #D4A028)",
      bg: "rgba(212, 160, 40, 0.15)",
      borda: "rgba(212, 160, 40, 0.6)",
      descricao: "Coordenação central, resolução de conflitos inter-agentes e reporte direto ao Fundador."
    },
    2: {
      nivel: 2,
      titulo: "NÍVEL 2: ESTRATEGISTAS, AUDITORES & GOVERNANÇA",
      cor: "#64B5F6",
      bg: "rgba(33, 150, 243, 0.12)",
      borda: "rgba(100, 181, 246, 0.5)",
      descricao: "Planejamento de escala, análise de oceanos azuis, gestão de risco de caixa e compliance legal."
    },
    3: {
      nivel: 3,
      titulo: "NÍVEL 3: EXECUTORES OPERACIONAIS ESPECIALIZADOS",
      cor: "var(--verde-status, #00C853)",
      bg: "rgba(0, 200, 83, 0.12)",
      borda: "rgba(0, 200, 83, 0.5)",
      descricao: "Mineração de produtos, produção de conteúdo de alta retenção, arbitragem e gestão de tráfego."
    },
    4: {
      nivel: 4,
      titulo: "NÍVEL 4: WORKERS DE EXECUÇÃO RÁPIDA & ATENDIMENTO",
      cor: "#BA68C8",
      bg: "rgba(186, 104, 200, 0.12)",
      borda: "rgba(186, 104, 200, 0.5)",
      descricao: "Recuperação 24/7 de pedidos, atendimento pós-venda, varredura de preços e automações velozes."
    }
  };

  const AGENTES_INICIAIS = [
    {
      id: "sousa-prime-master",
      nome: "SOUSA-Prime",
      codigo: "SOUSA-01-PRIME",
      nivel: 1,
      cargo: "Orquestrador Supremo Master",
      foco: "Orquestração holística do enxame, síntese de dados e cumprimento irrestrito das diretrizes do Fundador",
      autonomia: "Soberana (Supervisão Integral)",
      status: "ATIVO",
      instancia: "Node-Cloud-Alpha",
      tarefaAtual: "Supervisão da integridade do enxame e arbitragem de recursos",
      progressoTarefa: 94,
      tarefasConcluidas: 1420,
      cpu: 18,
      memoria: 84,
      tempoAtivo: "99.98%",
      ultimoSinal: "Agora mesmo"
    },
    {
      id: "sousa-tactics-strat",
      nome: "SOUSA-Tactics",
      codigo: "SOUSA-02-TACTICS",
      nivel: 2,
      cargo: "Estrategista de Escala & Tráfego",
      foco: "Mapeamento de oceanos azuis, funis de conversão de alta pressão e arbitragem multicanal",
      autonomia: "Autônoma com Reporte",
      status: "ATIVO",
      instancia: "Worker-Tactics-02",
      tarefaAtual: "Análise preditiva de tendências de busca em Shopee e Mercado Livre",
      progressoTarefa: 82,
      tarefasConcluidas: 890,
      cpu: 34,
      memoria: 112,
      tempoAtivo: "99.94%",
      ultimoSinal: "3s atrás"
    },
    {
      id: "sousa-vault-finance",
      nome: "SOUSA-Vault",
      codigo: "SOUSA-03-VAULT",
      nivel: 2,
      cargo: "Auditor Financeiro & Risco",
      foco: "Margem de contribuição real, ROAS líquido, proteção do patrimônio e conciliação de gateways",
      autonomia: "Autônoma com Reporte",
      status: "ATIVO",
      instancia: "Worker-Vault-03",
      tarefaAtual: "Cálculo em tempo real de break-even das campanhas e gateways",
      progressoTarefa: 78,
      tarefasConcluidas: 630,
      cpu: 22,
      memoria: 76,
      tempoAtivo: "99.99%",
      ultimoSinal: "1s atrás"
    },
    {
      id: "sousa-scout-drop",
      nome: "SOUSA-Scout",
      codigo: "SOUSA-04-SCOUT",
      nivel: 3,
      cargo: "Minerador Dropship & Fornecedores",
      foco: "Mineração de produtos virais 'painkiller', checagem de fornecedores VIP e estoque integrado",
      autonomia: "Autônoma Total",
      status: "ATIVO",
      instancia: "Worker-Scout-04",
      tarefaAtual: "Varredura contínua de produtos com alto fator visual em canais globais",
      progressoTarefa: 65,
      tarefasConcluidas: 2150,
      cpu: 48,
      memoria: 145,
      tempoAtivo: "99.85%",
      ultimoSinal: "Agora mesmo"
    },
    {
      id: "sousa-traffic-affiliate",
      nome: "SOUSA-Traffic",
      codigo: "SOUSA-05-TRAFFIC",
      nivel: 3,
      cargo: "Operador de Afiliados Pro",
      foco: "Arbitragem de tráfego pago, deep-linking sem fricção e testes A/B de páginas pré-sell",
      autonomia: "Autônoma Total",
      status: "ATIVO",
      instancia: "Worker-Traffic-05",
      tarefaAtual: "Disparo e rotação de criativos validados para a esteira Shopee/Amazon",
      progressoTarefa: 71,
      tarefasConcluidas: 1840,
      cpu: 42,
      memoria: 128,
      tempoAtivo: "99.91%",
      ultimoSinal: "2s atrás"
    },
    {
      id: "sousa-studio-producer",
      nome: "SOUSA-Studio",
      codigo: "SOUSA-06-STUDIO",
      nivel: 3,
      cargo: "Produtor & Roteirista Viral",
      foco: "Roteiros hipnóticos (gancho em 3s), matriz AIDA turbinada e distribuição omnicanal",
      autonomia: "Autônoma Total",
      status: "ATIVO",
      instancia: "Worker-Studio-06",
      tarefaAtual: "Desmembramento de 1 gravação master em 10 micro-formatos para Reels e TikTok",
      progressoTarefa: 90,
      tarefasConcluidas: 1120,
      cpu: 56,
      memoria: 160,
      tempoAtivo: "99.88%",
      ultimoSinal: "Agora mesmo"
    },
    {
      id: "sousa-messenger-support",
      nome: "SOUSA-Messenger",
      codigo: "SOUSA-07-MSG",
      nivel: 4,
      cargo: "Atendente WhatsApp & Conversão SAC",
      foco: "Recuperação 24/7 de carrinhos abandonados, suporte humanizado ao cliente e envio de rastreios",
      autonomia: "Autônoma Total",
      status: "ATIVO",
      instancia: "Worker-Bot-07",
      tarefaAtual: "Atendimento conversacional ativo e envio automático de códigos de rastreio",
      progressoTarefa: 55,
      tarefasConcluidas: 4210,
      cpu: 25,
      memoria: 88,
      tempoAtivo: "99.97%",
      ultimoSinal: "1s atrás"
    }
  ];

  class SousaSwarmManager {
    constructor() {
      this.agentes = [...AGENTES_INICIAIS];
      this.niveis = NIVEIS_HIERARQUIA;
      this.missoesHistorico = [];
      this.iniciado = false;
      this.listeners = [];
    }

    async init() {
      if (this.iniciado) return;

      // 1. Tenta carregar do IndexedDB primeiro (persistência durável)
      if (window.SousaIndexedDB && typeof window.SousaIndexedDB.obterEstado === 'function') {
        try {
          const salvos = await window.SousaIndexedDB.obterEstado('enxame_agentes');
          if (Array.isArray(salvos) && salvos.length > 0) {
            this.agentes = salvos;
          }
        } catch (e) {
          console.warn('[SOUSA-Swarm] Cache do IndexedDB indisponível, usando lista nativa.');
        }
      }

      // 2. Tenta sincronizar com o backend
      try {
        const resp = await fetch('/api/swarm/agents');
        if (resp.ok) {
          const dados = await resp.json();
          if (Array.isArray(dados.agentes) && dados.agentes.length > 0) {
            this.agentes = dados.agentes;
            this._salvarLocal();
          }
        }
      } catch (e) {
        // Operação offline / container autônomo
      }

      this.iniciado = true;
      this._iniciarSimulacaoViva();
      return this.agentes;
    }

    _salvarLocal() {
      if (window.SousaIndexedDB && typeof window.SousaIndexedDB.salvarEstado === 'function') {
        window.SousaIndexedDB.salvarEstado('enxame_agentes', this.agentes).catch(() => {});
      }
      try {
        localStorage.setItem('SOUSA_SWARM_CACHE', JSON.stringify(this.agentes));
      } catch (_) {}
    }

    _iniciarSimulacaoViva() {
      // Oscilação suave realista de telemetria do enxame a cada 4 segundos
      setInterval(() => {
        let mudou = false;
        this.agentes.forEach(ag => {
          if (ag.status === 'ATIVO') {
            // Avança o progresso da tarefa
            ag.progressoTarefa = Math.min(100, (ag.progressoTarefa || 50) + Math.floor(Math.random() * 4));
            if (ag.progressoTarefa >= 100) {
              ag.progressoTarefa = 15;
              ag.tarefasConcluidas = (ag.tarefasConcluidas || 0) + 1;
              mudou = true;
            }
            // Pequena oscilação de CPU
            ag.cpu = Math.max(10, Math.min(95, ag.cpu + Math.floor((Math.random() - 0.5) * 6)));
          }
        });
        this.notificar();
      }, 4000);
    }

    aoAtualizar(fn) {
      if (typeof fn === 'function') {
        this.listeners.push(fn);
      }
    }

    onUpdate(fn) {
      this.aoAtualizar(fn);
    }

    obterEstado() {
      return {
        agentes: this.agentes,
        metricas: this.obterMetricasColetivas(),
        missoesHistorico: this.missoesHistorico,
        iniciado: this.iniciado
      };
    }

    notificar() {
      this.listeners.forEach(fn => {
        try { fn(this.agentes); } catch (_) {}
      });
    }

    obterAgentes(filtroNivel = null) {
      if (!filtroNivel) return this.agentes;
      return this.agentes.filter(a => a.nivel === parseInt(filtroNivel, 10));
    }

    obterMetricasColetivas() {
      const total = this.agentes.length;
      const ativos = this.agentes.filter(a => a.status === 'ATIVO').length;
      const totalConcluidas = this.agentes.reduce((acc, a) => acc + (a.tarefasConcluidas || 0), 0);
      const mediaCpu = total > 0 ? Math.round(this.agentes.reduce((acc, a) => acc + (a.cpu || 0), 0) / total) : 0;
      const mediaMem = total > 0 ? Math.round(this.agentes.reduce((acc, a) => acc + (a.memoria || 0), 0)) : 0;

      return {
        total,
        ativos,
        totalConcluidas,
        mediaCpu,
        totalMemoriaMB: mediaMem,
        taxaSincronia: "99.98%",
        estadoGeral: ativos === total ? "SINCRONIA TOTAL" : "OPERAÇÃO PARCIAL"
      };
    }

    async atualizarAgente(id, novosDados) {
      const idx = this.agentes.findIndex(a => a.id === id);
      if (idx === -1) return null;

      this.agentes[idx] = { ...this.agentes[idx], ...novosDados };
      this._salvarLocal();
      this.notificar();

      // Envia ao backend de forma não bloqueante
      try {
        await fetch(`/api/swarm/agent/${encodeURIComponent(id)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.agentes[idx])
        });
      } catch (_) {}

      return this.agentes[idx];
    }

    async alternarStatusAgente(id) {
      const ag = this.agentes.find(a => a.id === id);
      if (!ag) return;
      const novoStatus = ag.status === 'ATIVO' ? 'PAUSADO' : 'ATIVO';
      return await this.atualizarAgente(id, { status: novoStatus });
    }

    async adicionarAgente(dados) {
      const count = this.agentes.length + 1;
      const novo = {
        id: `sousa-agent-${Date.now()}`,
        nome: dados.nome || `SOUSA-Node-${count}`,
        codigo: `SOUSA-0${count}-NODE`,
        nivel: parseInt(dados.nivel, 10) || 3,
        cargo: dados.cargo || 'Especialista Tático Autônomo',
        foco: dados.foco || 'Execução paralela de ordens do Comandante Supremo',
        autonomia: dados.autonomia || 'Autônoma Total',
        status: 'ATIVO',
        instancia: `Worker-Cloud-${count}`,
        tarefaAtual: dados.tarefaAtual || 'Aguardando distribuição de carga',
        progressoTarefa: 0,
        tarefasConcluidas: 0,
        cpu: Math.floor(15 + Math.random() * 20),
        memoria: Math.floor(60 + Math.random() * 50),
        tempoAtivo: "100%",
        ultimoSinal: "Agora mesmo"
      };

      this.agentes.push(novo);
      this._salvarLocal();
      this.notificar();

      try {
        await fetch('/api/swarm/agent/new', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novo)
        });
      } catch (_) {}

      return novo;
    }

    async removerAgente(id) {
      if (id === 'sousa-prime-master') {
        throw new Error('O Orquestrador Master SOUSA-Prime é inalienável e não pode ser descomissionado.');
      }
      this.agentes = this.agentes.filter(a => a.id !== id);
      this._salvarLocal();
      this.notificar();

      try {
        await fetch(`/api/swarm/agent/${encodeURIComponent(id)}`, {
          method: 'DELETE'
        });
      } catch (_) {}

      return true;
    }

    async despacharMissaoEmMassa(tituloMissao, diretriz, nivelAlvo = null) {
      const ts = new Date().toLocaleTimeString();
      const missaoObj = {
        id: `MISSAO-${Date.now()}`,
        titulo: tituloMissao,
        diretriz: diretriz,
        timestamp: ts,
        nivelAlvo: nivelAlvo || "TODOS OS NÍVEIS"
      };

      this.missoesHistorico.unshift(missaoObj);
      if (this.missoesHistorico.length > 20) this.missoesHistorico.pop();

      // Atualiza tarefas simultâneas nos agentes elegíveis
      this.agentes.forEach(ag => {
        if (!nivelAlvo || ag.nivel === parseInt(nivelAlvo, 10)) {
          if (ag.status === 'ATIVO') {
            ag.tarefaAtual = `[MISSÃO BROADCAST]: ${tituloMissao}`;
            ag.progressoTarefa = 10;
            ag.cpu = Math.min(92, ag.cpu + 15);
          }
        }
      });

      this._salvarLocal();
      this.notificar();

      try {
        await fetch('/api/swarm/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(missaoObj)
        });
      } catch (_) {}

      return missaoObj;
    }

    async otimizarCargaEnxame() {
      this.agentes.forEach(ag => {
        if (ag.status === 'ATIVO') {
          ag.cpu = Math.floor(18 + Math.random() * 25);
          ag.progressoTarefa = Math.min(100, (ag.progressoTarefa || 30) + 15);
        }
      });
      this._salvarLocal();
      this.notificar();

      try {
        await fetch('/api/swarm/optimize', { method: 'POST' });
      } catch (_) {}

      return true;
    }
  }

  const instancia = new SousaSwarmManager();
  root.SousaSwarm = instancia;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SousaSwarmManager, NIVEIS_HIERARQUIA, AGENTES_INICIAIS };
  }
})(typeof window !== 'undefined' ? window : globalThis);
