/**
 * SOUSA_CAPACIDADES_ADAPTADAS.js
 * ==========================================================
 * Mapeador e Coletor Dinâmico de Capacidades e Habilidades Adaptadas do SOUSA 2.0
 * 
 * Regra do Fundador:
 * "Se não tiver as capacidades, que busque no próprio SOUSA 2.0,
 *  pois tem várias capacidades adaptadas e habilidades adaptadas."
 * 
 * Fontes integradas automaticamente:
 * 1. SOUSA_CATALOGO_CAPACIDADES.json (23 capacidades mestras)
 * 2. SOUSA_GROK_ADAPTER.json (Comportamentos críticos e raciocínio direto)
 * 3. SOUSA_QWEN_ADAPTER.json (Motor cognitivo 3.8 adaptado)
 * 4. SOUSA_CAPACIDADE_LIVRO.json & SOUSA_CAPACIDADE_PUBLICACAO.json
 * 5. SOUSA_CAPACIDADE_ESTRATEGIA_PUBLICACAO.json
 * 6. SOUSA_RUFLO_ADAPTER.js & SOUSA_RUFLO_CARDAN.js (Workflows e enxame)
 * 7. SOUSA_OPENMANUS_ADAPTER.js (Agentes autônomos externos)
 * 8. SOUSA_RECONHECEDOR_AMBIENTE.js (Capacidade JARVIS 14)
 * 9. SOUSA_MANIFESTO_OPERACIONAL.json (Diretrizes de autonomia e governança)
 * 10. SOUSA_IME_CAPACIDADE.json (Ímã de diagnóstico e manutenção preventiva)
 * 11. SOUSA_USB_ADAPTERS.js (Transportes USB plugáveis e protocolos)
 * 12. As 13 Habilidades Operacionais JARVIS clássicas
 * ==========================================================
 */

const fs = require('fs');
const path = require('path');

function lerJsonSemBom(caminhoRelativo) {
  try {
    const caminho = path.isAbsolute(caminhoRelativo) 
      ? caminhoRelativo 
      : path.join(__dirname, caminhoRelativo);
    
    if (!fs.existsSync(caminho)) return null;
    let str = fs.readFileSync(caminho, 'utf8');
    if (str.charCodeAt(0) === 0xFEFF) {
      str = str.slice(1);
    }
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

const SOUSA_CAPACIDADES_ADAPTADAS = {
  versao: '2.0.0',
  data_coleta: new Date().toISOString(),

  // Coleta unificada de todas as capacidades mapeadas no ecossistema
  obterInventarioCompleto() {
    const catalogo = lerJsonSemBom('SOUSA_CATALOGO_CAPACIDADES.json') || {};
    const grokAdapter = lerJsonSemBom('SOUSA_GROK_ADAPTER.json') || {};
    const qwenAdapter = lerJsonSemBom('SOUSA_QWEN_ADAPTER.json') || {};
    const livroCap = lerJsonSemBom('SOUSA_CAPACIDADE_LIVRO.json') || {};
    const pubCap = lerJsonSemBom('SOUSA_CAPACIDADE_PUBLICACAO.json') || {};
    const estrategiaCap = lerJsonSemBom('SOUSA_CAPACIDADE_ESTRATEGIA_PUBLICACAO.json') || {};
    const imeCap = lerJsonSemBom('SOUSA_IME_CAPACIDADE.json') || {};
    const manifesto = lerJsonSemBom('SOUSA_MANIFESTO_OPERACIONAL.json') || {};

    const capacidadesCatalogo = (catalogo.capacidades || []).map(c => ({
      id: c.id,
      tipo: c.tipo || 'FUNCIONAL',
      descricao: c.descricao || c.id,
      origem: 'SOUSA_CATALOGO_CAPACIDADES.json'
    }));

    const capacidadesGrok = (grokAdapter.capacidades_adaptadas || []).map(g => ({
      id: g.id,
      tipo: 'COMPORTAMENTAL_ADAPTADA',
      descricao: g.descricao,
      origem: 'SOUSA_GROK_ADAPTER.json'
    }));

    const capacidadesQwen = Object.entries(qwenAdapter.mapeamento_capacidades || {}).map(([chave, modulo]) => ({
      id: chave.toUpperCase(),
      tipo: 'COGNITIVA_ADAPTADA',
      descricao: `Mapeado para ${modulo}`,
      origem: 'SOUSA_QWEN_ADAPTER.json'
    }));

    const dolaRegistro = lerJsonSemBom('EXTENSOES/DOLA_CAPACIDADES/REGISTRO_CAPACIDADES.json') || {};
    const capacidadesDola = (dolaRegistro.lista_capacidades || []).map((desc, idx) => ({
      id: `DOLA_CAP_${idx + 1}`,
      tipo: 'EXTENSAO_DOLA_ADAPTADA',
      descricao: `DOLA: ${desc}`,
      origem: 'EXTENSOES/DOLA_CAPACIDADES/REGISTRO_CAPACIDADES.json'
    }));

    const adaptadoresEspecialistas = [
      {
        id: 'DOLA_MOTOR_REFERENCIAL',
        tipo: 'EXTENSAO_COGNITIVA_DOLA',
        descricao: 'Integração DOLA com Fio Condutor: estruturação técnica, planejamento de tarefas e refino de comandos',
        origem: 'EXTENSOES/DOLA_CAPACIDADES/MANIFESTO_EXTENSAO.json'
      },
      {
        id: 'RUFLO_TREINAMENTO_E_ORQUESTRACAO',
        tipo: 'TREINAMENTO_E_CARDAN',
        descricao: 'Capacidade de aprender, treinar agentes e orquestrar enxame sem dependência rígida no núcleo (Cardan RUFLO)',
        origem: 'SOUSA_RUFLO_ADAPTER.js'
      },
      {
        id: 'APRENDIZADO_CONTINUO_E_EVOLUCAO',
        tipo: 'EVOLUCAO_AUTONOMA',
        descricao: 'Motor de aprendizado contínuo, consolidação na memória técnica e evolução adaptativa (SOUSA_USB_EVOLUTION_ENGINE)',
        origem: 'SOUSA_USB_EVOLUTION_ENGINE.js'
      },
      {
        id: 'PRODUCAO_LIVRO_PIPELINE',
        tipo: 'AUTORIA_E_ESTRUTURACAO',
        descricao: livroCap.descricao || 'Produção, continuidade e formatação de livros',
        origem: 'SOUSA_CAPACIDADE_LIVRO.json'
      },
      {
        id: 'PUBLICACAO_LIVRO_PIPELINE',
        tipo: 'CONVERSAO_E_MARKETPLACE',
        descricao: pubCap.descricao || 'Conversão para ebook KDP, capa e formatos de impressão',
        origem: 'SOUSA_CAPACIDADE_PUBLICACAO.json'
      },
      {
        id: 'ESTRATEGIA_PUBLICACAO',
        tipo: 'POSICIONAMENTO_MERCADO',
        descricao: estrategiaCap.descricao || 'Análise de público-alvo, precificação e lançamento',
        origem: 'SOUSA_CAPACIDADE_ESTRATEGIA_PUBLICACAO.json'
      },
      {
        id: 'CAP_IME_DIAGNOSTICO',
        tipo: 'MANUTENCAO_PREVENTIVA',
        descricao: 'Ímã de Diagnóstico: detectar não conformidades sem mascarar status',
        origem: 'SOUSA_IME_CAPACIDADE.json'
      },
      {
        id: 'RUFLO_ORQUESTRACAO_MULTIAGENTE',
        tipo: 'CARDAN_WORKFLOW',
        descricao: 'Acoplamento de enxame de agentes sem dependência rígida no núcleo',
        origem: 'SOUSA_RUFLO_ADAPTER.js'
      },
      {
        id: 'OPENMANUS_AGENTE_AUTONOMO',
        tipo: 'CARDAN_AUTONOMO',
        descricao: 'Delegação e execução de tarefas autônomas com navegadores e ferramentas',
        origem: 'SOUSA_OPENMANUS_ADAPTER.js'
      },
      {
        id: 'CLONAGEM_VOZ_FUNDADOR',
        tipo: 'SENSORIAL_VOZ_IDENTIDADE',
        descricao: 'Clonagem e síntese da voz do Fundador via DNA_MEMORIA_VOZ, Piper TTS local (CPU 0800), XTTS v2 e STT faster-whisper. A voz é identidade, requer autorização soberana.',
        origem: 'SOUSA_IA_DNA_MEMORIA_VOZ.js • SOUSA_USB_TTS_PIPER.js • voice/clone.py'
      },
      {
        id: 'AVATAR_DIGITAL_DO_FUNDADOR',
        tipo: 'SENSORIAL_VISUAL_3D',
        descricao: 'Avatar digital e presença visual 3D do Fundador e da SOUSA IA via AVATAR_CONTRATO, SadTalker, MuseTalk e Three.js. Princípio: interface desacoplada da inteligência.',
        origem: 'SOUSA_AVATAR_CONTRATO.js • SOUSA_CONTRATO_UNIVERSAL_3D.js • docs/CAPACIDADES_SENSORIAIS_VOZ_AVATAR.md'
      },
      {
        id: 'CRIACAO_VIDEOS_MULTIMIDIA',
        tipo: 'PRODUCAO_MULTIMIDIA',
        descricao: 'Produção e roteirização de vídeos, geração de cenas, lip-sync e animação multimidia sob coordenação do módulo SOUSA_PRODUTOR.',
        origem: 'SOUSA_CATALOGO_CAPACIDADES.json • SOUSA_MEDIA_INFERENCE_WORKER'
      },
      {
        id: 'CRIACAO_IMAGENS_CRIATIVOS',
        tipo: 'CRIACAO_VISUAL',
        descricao: 'Geração e tratamento de imagens de alta definição, capas editoriais, criativos visuais e mockups publicitários.',
        origem: 'SOUSA_CATALOGO_CAPACIDADES.json • SOUSA_PRODUTOR'
      },
      {
        id: 'CRIACAO_ANUNCIOS_E_CAMPANHAS',
        tipo: 'TRAFEGO_ADS_AFILIADOS',
        descricao: 'Estruturação de anúncios, campanhas de tráfego, gestão de afiliados e blindagem preventiva com CAMPAIGN_GUARDIAN e Marketplace Cascata.',
        origem: 'CAMPAIGN_GUARDIAN.js • SOUSA_MARKETPLACE_CASCATA.js • SOUSA_FERRAMENTAS_COMPLETAS.js'
      },
      {
        id: 'RECONHECEDOR_AMBIENTE_JARVIS_14',
        tipo: 'PERCEPCAO_AMBIENTAL',
        descricao: 'Detecção automática do contexto operacional (Desktop, Drive, Mobile, Nuvem)',
        origem: 'SOUSA_RECONHECEDOR_AMBIENTE.js'
      },
      {
        id: 'DETECTOR_PRESENCA_JARVIS_15',
        tipo: 'CONTEXTO_OPERACIONAL',
        descricao: 'Adaptação do comportamento conforme o modo do Fundador (Vigilante, Móvel, Pleno)',
        origem: 'SOUSA_CATALOGO_CAPACIDADES.json'
      }
    ];

    // Consolidação de lista única
    const todas = [
      ...capacidadesCatalogo,
      ...capacidadesGrok,
      ...capacidadesQwen,
      ...capacidadesDola,
      ...adaptadoresEspecialistas
    ];

    // Desduplicação por ID
    const mapaUnico = new Map();
    todas.forEach(item => {
      const idChave = String(item.id).trim().toUpperCase();
      if (!mapaUnico.has(idChave)) {
        mapaUnico.set(idChave, item);
      }
    });

    return {
      total: mapaUnico.size,
      principio_usb_nato: "O princípio USB é nato a todo o ecossistema SOUSA 2.0 (Zero Patch no Executor, 100% interoperabilidade por contrato).",
      capacidades: Array.from(mapaUnico.values()),
      modulos_mapeados: catalogo.modulos || {},
      autoridade: manifesto?.SOUSA_2_0_MANIFESTO_OPERACIONAL?.authority || 'FUNDADOR'
    };
  },

  // Busca capacidades específicas por palavra-chave ou intenção
  buscarCapacidades(termo) {
    if (!termo) return this.obterInventarioCompleto().capacidades;
    const t = termo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const inventario = this.obterInventarioCompleto();

    // Divide em palavras-chave relevantes (> 2 caracteres)
    const tokens = t.split(/\s+/).filter(tok => tok.length > 2);

    return inventario.capacidades.filter(c => {
      const idNorm = c.id.toLowerCase();
      const descNorm = (c.descricao || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const tipoNorm = (c.tipo || '').toLowerCase();
      const textoCompleto = `${idNorm} ${descNorm} ${tipoNorm}`;

      // Correspondência direta
      if (textoCompleto.includes(t)) return true;

      // Correspondência por tokens (ex.: 'voz', 'avatar', 'video', 'imagem', 'anuncio')
      return tokens.some(tok => {
        const raiz = tok.endsWith('s') ? tok.slice(0, -1) : tok;
        return textoCompleto.includes(tok) || textoCompleto.includes(raiz);
      });
    });
  },

  // Retorna resumo executivo em formato textual amigável para contextualização do prompt
  gerarResumoContextual() {
    const inv = this.obterInventarioCompleto();
    const linhas = inv.capacidades.map(c => `• [${c.id}] (${c.tipo}): ${c.descricao}`);
    return `Total de capacidades e habilidades adaptadas mapeadas no SOUSA 2.0: ${inv.total}\n` + linhas.join('\n');
  }
};

module.exports = SOUSA_CAPACIDADES_ADAPTADAS;
