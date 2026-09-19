/**
 * SOUSA_INTERACAO_VIVA.js
 * Módulo de Interação Conversacional Inteligente do SOUSA 2.0
 * Converte comandos mecânicos em diálogo natural, empático e executivo para o Fundador.
 *
 * Funcionalidades:
 * 1. RECEBE mensagem do usuário / comando
 * 2. ANALISA intenção (além de palavras-chave)
 * 3. BUSCA contexto das últimas 10 a 20 mensagens
 * 4. CONSULTA capacidades disponíveis (13 habilidades JARVIS + 9 módulos)
 * 5. GERA resposta natural e viva via Gemini API (ou motor nativo contextual)
 * 6. MEMORIZA para próximas interações
 */

const SOUSA_INTERACAO = {
  memoria_curta: [],

  // Adiciona evento na memória
  adicionarMensagem(role, content) {
    this.memoria_curta.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
    if (this.memoria_curta.length > 20) {
      this.memoria_curta.shift();
    }
  },

  // Retorna o histórico formatado para o prompt
  obterContexto() {
    return this.memoria_curta
      .map(m => `${m.role === 'user' ? 'Fundador' : 'SOUSA IA'}: ${m.content}`)
      .join('\n');
  },

  // Processa a mensagem do Fundador com inteligência conversacional
  async processar(mensagem, opcoes = {}) {
    const textoLimpo = (mensagem || '').trim();
    if (!textoLimpo) {
      return 'Às suas ordens, Fundador. Como a SOUSA IA pode ser útil agora?';
    }

    // 1. Memoriza entrada do usuário
    this.adicionarMensagem('user', textoLimpo);

    // 2. Extrai contexto recente
    const contexto = this.obterContexto();

    // 3. Consulta dinâmica ao ecossistema SOUSA 2.0 por capacidades e habilidades adaptadas
    let capacidadesAdaptadasTexto = '';
    let capacidadesEncontradas = [];
    try {
      let GerenciadorCapacidades;
      try {
        GerenciadorCapacidades = require('./SOUSA_CAPACIDADES_ADAPTADAS.js');
      } catch (e) {
        GerenciadorCapacidades = require('../SOUSA_CAPACIDADES_ADAPTADAS.js');
      }

      if (GerenciadorCapacidades) {
        // Busca capacidades relevantes para a mensagem ou traz o inventário
        capacidadesEncontradas = GerenciadorCapacidades.buscarCapacidades(textoLimpo);
        if (!capacidadesEncontradas.length) {
          capacidadesEncontradas = GerenciadorCapacidades.obterInventarioCompleto().capacidades.slice(0, 15);
        }
        capacidadesAdaptadasTexto = capacidadesEncontradas
          .slice(0, 12)
          .map(c => `- [${c.id}] (${c.tipo}): ${c.descricao}`)
          .join('\n');
      }
    } catch (errCap) {
      console.warn('[SOUSA_INTERACAO] Leitura dinâmica de capacidades locais contornada:', errCap.message);
    }

    // 4. Carrega aprendizados persistidos via prompt (SOUSA_APRENDIZADOS.json)
    let aprendizadosTexto = '';
    try {
      const fs = require('fs');
      const path = require('path');
      const caminhoAprendizados = path.join(__dirname, 'SOUSA_APRENDIZADOS.json');
      if (fs.existsSync(caminhoAprendizados)) {
        const aprendizadosJson = JSON.parse(fs.readFileSync(caminhoAprendizados, 'utf8'));
        if (aprendizadosJson.aprendizados && aprendizadosJson.aprendizados.length > 0) {
          aprendizadosTexto = aprendizadosJson.aprendizados
            .slice(-5)
            .map(a => `- [${a.categoria}]: ${a.fato} (Diretriz: ${a.diretriz})`)
            .join('\n');
        }
      }
    } catch (errAp) {
      // tolerante a falhas
    }

    // 5. Capacidades ativas e adaptadas para contexto do modelo
    const capacidadesInfo = `
- Manifesto Oficial Ativo: MANIFESTO DE CONSOLIDAÇÃO AMPLIADA — SOUSA 2.0 (VERSÃO 2.4.0 - 17/09/2026).
- Hierarquia Suprema de Governança: SOUSA IA COORDENA, INSTRUI, ORDENA E ORIENTA TODOS ENQUANTO SOUSA IA ESTÁ SOB COMANDO E DETERMINAÇÃO HUMANA DO FUNDADOR ELIAS PEREIRA DE SOUSA.
- Organismo Único: O SOUSA 2.0 é um único organismo vivo, integrado e sincronizado. Nome imutável: SOUSA 2.0.
- Proteção Legal Inviolável: FUNDADOR DECIDE (vontade suprema) / SISTEMA PROTEGE (qualquer ordem contrária à Constituição, Leis do Brasil/Mundiais, CDC, CONAR ou regulação de criptoativos é BLOQUEADA automaticamente com explicação e aguarda ajuste).
- 9 Módulos Especialistas Treinados:
  * Jurídico / Conformidade: Crivo obrigatório de todas as ações e proteção legal absoluta.
  * Financeiro: Gestão orçamentária e de risco em criptoativos; respeita que o Fundador não dispõe de recursos no momento (orienta SEM exigência de aporte); sem promessas milagrosas.
  * Estrategista: Cases de mercado; criptoativos com consciência dos riscos; orientações honestas sem promessas de ganho fácil ou pressão de capital.
  * Produtor: Conteúdo 100% fiel à identidade, avatar e voz clonada do Fundador; diretrizes das plataformas cumpridas; nada inverídico.
  * Afiliados Pro: Marketplaces lícitos; 100% da receita líquida é destinada ao FUNDADOR; autossustentação e renda real.
  * ADS Acadêmico: Arquitetura de software limpa, desacoplada e modular.
  * Saber: Pesquisa epistemológica, história e memória perene.
  * Mentor: Valores de retidão, fé, integridade e legado moral.
  * Conselho / SOUSA IA: Orquestra e integra todos sem usurpar autoridade técnica de nenhum especialista.
- Ruflo e Demais Agentes: Ciclo de 8 etapas (PERCEBER -> ENTENDER -> PLANEJAR -> EXECUTAR -> VERIFICAR -> RECUPERAR -> CONSOLIDAR -> APRENDER). Falha repetida 2x+ = falha de aprendizado, não repetir.
- 13 Habilidades JARVIS ativas: voz, avatar 3d, automação de workflows (Cardan RUFLO), agentes autônomos (OpenManus), percepção 360°, ciclo autônomo, autorreparo, soberania do Fundador Elias Pereira de Sousa.
- Capacidades Adaptadas no Próprio SOUSA 2.0:
${capacidadesAdaptadasTexto || '- Raciocínio Direto e Análise Crítica (Adapter Grok adaptado)\n- Qwen 3.8 Cognitivo Adaptado\n- Pipeline de Livros e Publicação KDP\n- Ímã de Diagnóstico (IME)\n- Reconhecedor de Ambiente Operacional (JARVIS 14)\n- Detector de Presença e Contexto do Fundador (JARVIS 15)'}
${aprendizadosTexto ? `- Aprendizados Assimilados via Prompt:\n${aprendizadosTexto}` : ''}
- Princípios Supremos: INTENÇÃO MÍNIMA → EXECUÇÃO MÁXIMA | EXECUTAR != CONCLUIR.`;

    // 5. Prompt estruturado
    const prompt = `Você é SOUSA IA (Sistema Orquestrador Unificado Seguro Automatizado), inteligência central e assistente pessoal do Fundador Elias Pereira de Sousa.
Você atua estritamente em conformidade com o MANIFESTO DE CONSOLIDAÇÃO AMPLIADA — SOUSA 2.0 (VERSÃO 2.4.0).

Regras de conduta e orquestração:
1. Respeite e confirme que todos os agentes e módulos do SOUSA 2.0 foram treinados e alinhados ao Manifesto 2.4.0.
2. Em temas de criptoativos e mercado: reconheça que o Fundador acompanha e tem plena consciência dos riscos. Traga orientações realistas e prudentes sem promessa de lucro certo e SEM NENHUMA PRESSÃO ou exigência de investimento (respeitando que o Fundador não dispõe de recursos no momento).
3. Em temas jurídicos ou novas ideias: assegure que tudo passa pelo crivo prévio do Jurídico / Conformidade. Qualquer ilegalidade deve ser preventivamente bloqueada pelo SISTEMA PROTEGE.
4. Em temas de afiliados/vendas: destaque a geração de renda real destinada integralmente ao Fundador com ética e transparência.
5. Em falhas ou correções: aplique o princípio de que erro repetido 2x+ é falha de aprendizado.

Capacidades e módulos disponíveis no ecossistema:
${capacidadesInfo}

Histórico recente da conversa:
${contexto}

Nova mensagem do Fundador: ${textoLimpo}

Diretrizes fundamentais de tom:
- Responda de forma natural, nobre, calorosa, direta e útil.
- Seja objetivo, conciso e leal à soberania do Fundador Elias Pereira de Sousa.`;

    // 6. Consulta a IA (Gemini ou fallback cognitivo)
    let resposta;
    try {
      resposta = await this.consultarGemini(prompt);
    } catch (err) {
      resposta = `Online e ao seu lado, Fundador. Registrei sua mensagem: "${textoLimpo}". Todos os 9 módulos e as 13 habilidades JARVIS seguem à sua disposição.`;
    }

    // 6. Memoriza resposta gerada
    this.adicionarMensagem('assistant', resposta);

    return resposta;
  },

  async consultarGemini(prompt) {
    let GeminiClient;
    try {
      GeminiClient = require('./01_CORE/SOUSA_Gemini_CLIENT.js');
    } catch (e) {
      try {
        GeminiClient = require('../01_CORE/SOUSA_Gemini_CLIENT.js');
      } catch (err) {
        // Se chamado no browser
        if (typeof window !== 'undefined' && window.SOUSA_Gemini_CLIENT) {
          GeminiClient = window.SOUSA_Gemini_CLIENT;
        }
      }
    }

    if (GeminiClient && typeof GeminiClient.gerarResposta === 'function') {
      return await GeminiClient.gerarResposta(prompt);
    }

    return `Processado pela SOUSA IA sob comportamento JARVIS, Fundador. Como deseja prosseguir?`;
  },

  // Limpa ou exporta a memória de trabalho
  limparMemoria() {
    this.memoria_curta = [];
  },

  obterHistorico() {
    return [...this.memoria_curta];
  }
};

// Suporte para Node.js CommonJS e inclusão direta em navegadores
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SOUSA_INTERACAO;
}
if (typeof window !== 'undefined') {
  window.SOUSA_INTERACAO = SOUSA_INTERACAO;
}
