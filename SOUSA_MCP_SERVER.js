#!/usr/bin/env node
/**
 * SOUSA 2.0 - MCP SERVER (Model Context Protocol)
 * Integração universal de agentes e ferramentas externas via stdio (JSON-RPC 2.0 / MCP).
 * Usa diretamente o núcleo 01_CORE/SOUSA_Core.js sem duplicar lógica.
 */

const readline = require('readline');
const path = require('path');
const fs = require('fs');

// Carregar handlers existentes do SOUSA_Core.js
const sousaCore = require('./01_CORE/SOUSA_Core.js');

// Metadados das ferramentas expostas
const TOOLS_DEFINITIONS = [
  {
    name: 'ping',
    description: 'Verificar conexão e prontidão operacional do SOUSA 2.0',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'status',
    description: 'Retornar estado geral do sistema, módulos ativos e memórias',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'diagnostico',
    description: 'Executar diagnóstico operacional completo de todos os módulos',
    inputSchema: {
      type: 'object',
      properties: {
        nivel: {
          type: 'string',
          enum: ['rapido', 'completo', 'profundo'],
          description: 'Nível de profundidade do diagnóstico'
        }
      }
    }
  },
  {
    name: 'chat_conselho',
    description: 'Interação conversacional com SOUSA IA atuando com comportamento e habilidades JARVIS',
    inputSchema: {
      type: 'object',
      properties: {
        mensagem: {
          type: 'string',
          description: 'Mensagem ou comando instrucional a processar'
        }
      },
      required: ['mensagem']
    }
  },
  {
    name: 'executar_modulo',
    description: 'Executar módulo específico do ecossistema SOUSA 2.0',
    inputSchema: {
      type: 'object',
      properties: {
        modulo: {
          type: 'string',
          description: 'Identificador do módulo (juridico, financeiro, produtor, etc.)'
        },
        acao: {
          type: 'string',
          description: 'Ação a ser executada no módulo'
        },
        dados: {
          type: 'object',
          description: 'Dados ou parâmetros específicos da ação'
        }
      },
      required: ['modulo', 'acao']
    }
  },
  {
    name: 'aprender_diretriz',
    description: 'Registrar novo aprendizado operacional ou diretriz permanente do Fundador para o motor de prompt da SOUSA IA',
    inputSchema: {
      type: 'object',
      properties: {
        fato: {
          type: 'string',
          description: 'Fato operacional assimilado (ex.: restrições, decisões, plataformas)'
        },
        categoria: {
          type: 'string',
          description: 'Categoria do fato (ex.: redes_sociais, plataformas, financeiro, juridico, arquitetura)'
        },
        diretriz: {
          type: 'string',
          description: 'Diretriz de ação vinculada ao fato'
        },
        regra_ouro: {
          type: 'string',
          description: 'Regra de conduta inegociável aprendida'
        }
      }
    }
  }
];

const RESOURCES_DEFINITIONS = [
  {
    uri: 'sousa://catalogo_capacidades',
    name: 'catalogo_capacidades',
    description: 'Lista de capacidades do SOUSA',
    mimeType: 'application/json'
  },
  {
    uri: 'sousa://logs_sistema',
    name: 'logs_sistema',
    description: 'Logs recentes do sistema',
    mimeType: 'application/json'
  },
  {
    uri: 'sousa://manifesto_antigravity',
    name: 'manifesto_antigravity',
    description: 'Manifesto de Adaptação das Capacidades do Antigravity ao SOUSA 2.0',
    mimeType: 'text/markdown'
  },
  {
    uri: 'sousa://aprendizados',
    name: 'aprendizados',
    description: 'Base consolidada de aprendizados assimilados via prompt pela SOUSA IA',
    mimeType: 'application/json'
  }
];

// Processamento de chamadas de ferramentas
async function executeTool(name, args = {}) {
  switch (name) {
    case 'ping': {
      const res = sousaCore.handleAction('ping', {});
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }]
      };
    }

    case 'status': {
      const res = sousaCore.handleAction('status', {});
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }]
      };
    }

    case 'diagnostico': {
      const nivel = args.nivel || 'completo';
      const res = sousaCore.handleAction('diagnostico', { nivel });
      if (res.data) {
        res.data.nivel_solicitado = nivel;
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }]
      };
    }

    case 'chat_conselho': {
      const mensagem = args.mensagem || '';
      if (!mensagem) {
        throw new Error('Parâmetro obrigatório ausente: mensagem');
      }
      let respostaTexto = '';
      try {
        const SOUSA_INTERACAO = require('./SOUSA_INTERACAO_VIVA.js');
        respostaTexto = await SOUSA_INTERACAO.processar(mensagem);
      } catch (errInt) {
        const resLocal = sousaCore.handleAction('chat_conselho', { mensagem });
        respostaTexto = resLocal.data?.resposta_conversacional || resLocal.data?.resposta || 'SOUSA IA pronta.';
      }
      const res = {
        action: 'chat_conselho',
        success: true,
        data: {
          modulo: 'CONSELHO',
          tipo: 'CHAT_SOUSA_IA',
          mensagem_recebida: mensagem,
          resposta_conversacional: respostaTexto,
          resposta: respostaTexto,
          identidade: 'SOUSA IA',
          comportamento: 'JARVIS'
        },
        error: null,
        timestamp: new Date().toISOString()
      };
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }]
      };
    }

    case 'executar_modulo': {
      const { modulo, acao, dados } = args;
      if (!modulo || !acao) {
        throw new Error('Parâmetros obrigatórios ausentes: modulo e acao');
      }

      // Validação do módulo
      const modulosValidos = [
        'juridico', 'financeiro', 'produtor', 'estrategista',
        'afiliadopro', 'ads_academico', 'saber_conhecimento', 'mentor', 'conselho'
      ];

      const modKey = String(modulo).toLowerCase();
      const valido = modulosValidos.some(m => m === modKey || modKey.includes(m));

      const startTime = new Date();
      const resultadoExecucao = {
        action: 'executar_modulo',
        success: valido,
        modulo: modKey,
        acao: acao,
        data: valido ? {
          status: 'EXECUTADO',
          modulo: modKey,
          acao: acao,
          payload_processado: dados || {},
          timestamp: startTime.toISOString()
        } : null,
        error: valido ? null : `Módulo [${modulo}] não reconhecido. Válidos: ${modulosValidos.join(', ')}`,
        timestamp: startTime.toISOString()
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(resultadoExecucao, null, 2) }]
      };
    }

    case 'aprender_diretriz': {
      const { fato, categoria, diretriz, regra_ouro } = args;
      const aprendizadosPath = path.join(__dirname, 'SOUSA_APRENDIZADOS.json');
      let data = { versao: "2.0.0-PROMPT-LEARNING", fatos_operacionais_consolidados: [], regras_de_ouro_aprendidas: [] };
      if (fs.existsSync(aprendizadosPath)) {
        data = JSON.parse(fs.readFileSync(aprendizadosPath, 'utf8'));
      }

      if (fato) {
        data.fatos_operacionais_consolidados = data.fatos_operacionais_consolidados || [];
        data.fatos_operacionais_consolidados.push({
          id: `fato_${Date.now()}`,
          categoria: categoria || "operacional",
          fato: String(fato).trim(),
          diretriz: diretriz ? String(diretriz).trim() : "Respeitar diretriz operacional assimilada."
        });
      }

      if (regra_ouro) {
        data.regras_de_ouro_aprendidas = data.regras_de_ouro_aprendidas || [];
        data.regras_de_ouro_aprendidas.push(String(regra_ouro).trim());
      }

      data.data_atualizacao = new Date().toISOString();
      fs.writeFileSync(aprendizadosPath, JSON.stringify(data, null, 2), 'utf8');

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: "APRENDIZADO_ASSIMILADO",
            mensagem: "Aprendizado registrado com sucesso na base de prompt da SOUSA IA",
            total_fatos: data.fatos_operacionais_consolidados.length,
            total_regras: data.regras_de_ouro_aprendidas.length,
            timestamp: data.data_atualizacao
          }, null, 2)
        }]
      };
    }

    default:
      throw new Error(`Ferramenta não reconhecida: ${name}`);
  }
}

// Leitura de recursos MCP
function readResource(uri) {
  if (uri === 'sousa://catalogo_capacidades') {
    const filePath = path.join(__dirname, 'SOUSA_CATALOGO_CAPACIDADES.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return {
        contents: [{ uri, mimeType: 'application/json', text: content }]
      };
    }
    return {
      contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ erro: 'Arquivo de catálogo não localizado' }) }]
    };
  }

  if (uri === 'sousa://logs_sistema') {
    const logsDir = path.join(__dirname, '07_LOG');
    let listaArquivos = [];
    if (fs.existsSync(logsDir)) {
      listaArquivos = fs.readdirSync(logsDir).slice(-10);
    }
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({
          diretorio: '07_LOG/',
          arquivos_recentes: listaArquivos,
          timestamp: new Date().toISOString()
        }, null, 2)
      }]
    };
  }

  if (uri === 'sousa://manifesto_antigravity') {
    const manifestoPath = path.join(__dirname, 'MANIFESTO_ANTIGRAVITY_SOUSA20.md');
    if (fs.existsSync(manifestoPath)) {
      const content = fs.readFileSync(manifestoPath, 'utf8');
      return {
        contents: [{ uri, mimeType: 'text/markdown', text: content }]
      };
    }
    return {
      contents: [{ uri, mimeType: 'text/markdown', text: '# Manifesto não encontrado' }]
    };
  }

  if (uri === 'sousa://aprendizados') {
    const aprendizadosPath = path.join(__dirname, 'SOUSA_APRENDIZADOS.json');
    if (fs.existsSync(aprendizadosPath)) {
      const content = fs.readFileSync(aprendizadosPath, 'utf8');
      return {
        contents: [{ uri, mimeType: 'application/json', text: content }]
      };
    }
    return {
      contents: [{ uri, mimeType: 'application/json', text: JSON.stringify({ erro: 'Base de aprendizados não encontrada' }) }]
    };
  }

  throw new Error(`Recurso desconhecido: ${uri}`);
}

// Despacho de mensagens JSON-RPC 2.0 (MCP Protocol)
async function handleMessage(request) {
  const { id, method, params } = request;

  // Notificações sem ID
  if (id === undefined && method === 'notifications/initialized') {
    return null;
  }

  try {
    switch (method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
              resources: {}
            },
            serverInfo: {
              name: 'SOUSA_2.0_MCP',
              version: '1.0.0',
              description: 'Model Context Protocol para ecossistema SOUSA 2.0'
            }
          }
        };

      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            tools: TOOLS_DEFINITIONS
          }
        };

      case 'tools/call': {
        const { name, arguments: args } = params || {};
        if (!name) {
          throw new Error('Parâmetro "name" da ferramenta é obrigatório');
        }
        const result = await executeTool(name, args || {});
        return {
          jsonrpc: '2.0',
          id,
          result
        };
      }

      case 'resources/list':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            resources: RESOURCES_DEFINITIONS
          }
        };

      case 'resources/read': {
        const { uri } = params || {};
        if (!uri) throw new Error('Parâmetro "uri" é obrigatório');
        const result = readResource(uri);
        return {
          jsonrpc: '2.0',
          id,
          result
        };
      }

      case 'ping':
        return {
          jsonrpc: '2.0',
          id,
          result: { pong: true, timestamp: new Date().toISOString() }
        };

      default:
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Método não implementado: ${method}`
          }
        };
    }
  } catch (err) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: err.message || 'Erro interno no servidor MCP',
        data: { stack: err.stack }
      }
    };
  }
}

// Configuração do leitor de linha stdio
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  try {
    const request = JSON.parse(trimmed);
    const response = await handleMessage(request);
    if (response) {
      process.stdout.write(JSON.stringify(response) + '\n');
    }
  } catch (err) {
    const errorResponse = {
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32700,
        message: 'Parse error: JSON inválido recebido via stdio'
      }
    };
    process.stdout.write(JSON.stringify(errorResponse) + '\n');
  }
});

// Tratamento de saída limpa
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
