/**
 * ==========================================================
 * SOUSA 2.0 — CASCATA DE APIS E INICIALIZAÇÃO PLUG AND PLAY
 * ==========================================================
 * Prove a semente do USB Registry e a funcao de obtencao de chaves do Cofre.
 * Credenciais = apenas NOMES de propriedades no Cofre (PropertiesService).
 * ==========================================================
 */

var SOUSA_APIS_CASCATA = [
  {
    prioridade: 1,
    nome: "GEMINI",
    api_key: "GEMINI_API_KEY",
    modelo: "gemini-2.5-flash",
    endereco: "https://generativelanguage.googleapis.com/v1beta/models",
    protocolo: "GEMINI_GENERATE_CONTENT",
    tipo: "API_CLOUD",
    status: "ATIVO"
  },
  {
    prioridade: 2,
    nome: "GROQ",
    api_key: "GROQ_API_KEY",
    modelo: "llama-3.3-70b-versatile",
    endereco: "https://api.groq.com/openai/v1",
    protocolo: "OPENAI_CHAT_COMPLETIONS",
    tipo: "API_CLOUD",
    status: "ATIVO"
  },
  {
    prioridade: 3,
    nome: "CEREBRAS",
    api_key: "CEREBRAS_API_KEY",
    modelo: "llama3.3-70b",
    endereco: "https://api.cerebras.ai/v1",
    protocolo: "OPENAI_CHAT_COMPLETIONS",
    tipo: "API_CLOUD",
    status: "ATIVO"
  },
  {
    prioridade: 4,
    nome: "DEEPSEEK",
    api_key: "DEEPSEEK_API_KEY",
    modelo: "deepseek-chat",
    endereco: "https://api.deepseek.com",
    protocolo: "OPENAI_CHAT_COMPLETIONS",
    tipo: "API_CLOUD",
    status: "ATIVO"
  },
  {
    prioridade: 5,
    nome: "MISTRAL",
    api_key: "MISTRAL_API_KEY",
    modelo: "mistral-small-latest",
    endereco: "https://api.mistral.ai/v1",
    protocolo: "OPENAI_CHAT_COMPLETIONS",
    tipo: "API_CLOUD",
    status: "ATIVO"
  },
  {
    prioridade: 6,
    nome: "OPENROUTER",
    api_key: "OPENROUTER_API_KEY",
    modelo: "meta-llama/llama-3.3-70b-instruct",
    endereco: "https://openrouter.ai/api/v1",
    protocolo: "OPENAI_CHAT_COMPLETIONS",
    tipo: "GATEWAY_MODELOS",
    status: "ATIVO"
  },
  {
    prioridade: 9,
    nome: "OLLAMA_LOCAL",
    api_key: null,
    modelo: "llama3.2:3b",
    endereco: "http://127.0.0.1:11434",
    protocolo: "OLLAMA_CHAT",
    tipo: "IA_LOCAL",
    status: "ATIVO"
  }
];

/**
 * Obtem a chave de API cadastrada no ScriptProperties do GAS (Cofre de Chaves).
 * @param {string} nomeChave - Nome da propriedade contendo a chave.
 * @returns {string|null} - Valor da chave ou null se nao encontrada.
 */
function obterChaveAPI(nomeChave) {
  if (!nomeChave) return null;
  try {
    return PropertiesService.getScriptProperties().getProperty(String(nomeChave));
  } catch (e) {
    return null;
  }
}

/**
 * Inicialização Plug and Play: adaptadores + seed.
 * Preferir SOUSA_USB_boot() no Lab (carrega persistencia + seed se vazio).
 * @param {Object} [opcoes] — { reset: true } limpa registry antes de semear (util em testes)
 */
function SOUSA_USB_inicializar(opcoes) {
  var opts = opcoes || {};
  if (opts.reset === true) {
    SOUSA_USB_REGISTRY_STORE = {};
  }
  if (typeof SOUSA_USB_boot === "function" && opts.reset !== true) {
    return SOUSA_USB_boot(opts);
  }
  var boot = SOUSA_USB_ADAPTER_bootstrap();
  var seed = SOUSA_USB_semearCascataLegada();
  return {
    ok: true,
    status: "USB_SISTEMA_PRONTO",
    versao: typeof SOUSA_USB_VERSAO !== "undefined" ? SOUSA_USB_VERSAO : "1.0.1",
    adaptadores: boot.adaptadores,
    usbs: SOUSA_USB_listar().map(function (u) {
      return { id: u.id, protocolo: u.protocolo, estado: u.estado, prioridade: u.prioridade };
    }),
    seed: seed
  };
}
