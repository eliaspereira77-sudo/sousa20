/**
 * SOUSA_IME_DIAGNOSTICO.js
 * Capacidade operacional: IMÃ DE DIAGNÓSTICO
 * 
 * Função:
 * - localizar vestígios técnicos;
 * - classificar achados;
 * - produzir evidência;
 * - integrar com o FIO CONDUTOR;
 * - disponibilizar a capacidade para a equipe de manutenção.
 * 
 * Regra:
 * DETECTAR != CORRIGIR
 * 
 * O ímã encontra e organiza.
 * A manutenção decide a ação.
 */

const SOUSA_IME_DIAGNOSTICO = {
  id: "CAP_IME_DIAGNOSTICO",
  nome: "ÍMÃ DE DIAGNÓSTICO",
  versao: "1.1.0",
  categoria: "MANUTENCAO",
  contrato: "USB_MODULAR",
  status: "ATIVO",
  capacidades: [
    "LOCALIZAR_VESTIGIOS",
    "CLASSIFICAR_VESTIGIOS",
    "MAPEAR_CONECTIVIDADE",
    "IDENTIFICAR_DUPLICIDADES",
    "IDENTIFICAR_RESIDUOS",
    "GERAR_EVIDENCIA"
  ],

  detectar: function(arquivos, padroes) {
    const achados = [];
    (arquivos || []).forEach(function(arquivo) {
      const conteudo = String(arquivo.conteudo || "");
      const linhas = conteudo.split(/\r?\n/);
      linhas.forEach(function(linha, indice) {
        const encontrada = (padroes || []).some(function(padrao) {
          try {
            return new RegExp(padrao, "i").test(linha);
          } catch (erro) {
            return false;
          }
        });
        if (encontrada) {
          achados.push({
            arquivo: arquivo.nome || "DESCONHECIDO",
            linha: indice + 1,
            evidencia: linha.trim(),
            classificacao: SOUSA_IME_DIAGNOSTICO.classificar(arquivo.nome, linha),
            data: new Date().toISOString()
          });
        }
      });
    });

    return {
      capacidade: this.id,
      total: achados.length,
      achados: achados,
      data: new Date().toISOString()
    };
  },

  classificar: function(nomeArquivo, linha) {
    const texto = ((nomeArquivo || "") + " " + (linha || "")).toLowerCase();
    if (texto.includes("backup") || texto.includes("quarentena") || texto.includes(".tmp")) {
      return "RESIDUO_OU_BACKUP";
    }
    if (texto.includes("src/") || texto.includes("\\src\\")) {
      return "POSSIVEL_DUPLICATA";
    }
    if (texto.includes("health") || texto.includes("connectiv") || texto.includes("endpoint") || texto.includes("localhost") || texto.includes("127.0.0.1") || texto.includes("porta")) {
      return "CONECTIVIDADE";
    }
    if (texto.includes("registry") || texto.includes("capability") || texto.includes("agent") || texto.includes("agente")) {
      return "ARQUITETURA_E_CAPACIDADE";
    }
    return "VESTIGIO_TECNICO";
  },

  verificarContrato: function() {
    return {
      id: this.id,
      nome: this.nome,
      versao: this.versao,
      contrato: this.contrato,
      status: this.status,
      saudavel: !!this.id && !!this.nome && !!this.versao && this.contrato === "USB_MODULAR" && this.status === "ATIVO",
      data: new Date().toISOString()
    };
  }
};

/**
 * Ponte pública.
 */
function SOUSA_IME_DIAGNOSTICO_verificar() {
  return SOUSA_IME_DIAGNOSTICO.verificarContrato();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { SOUSA_IME_DIAGNOSTICO, SOUSA_IME_DIAGNOSTICO_verificar };
  module.exports.SOUSA_IME_DIAGNOSTICO = SOUSA_IME_DIAGNOSTICO;
  module.exports.default = SOUSA_IME_DIAGNOSTICO;
}
if (typeof globalThis !== "undefined") {
  globalThis.SOUSA_IME_DIAGNOSTICO = SOUSA_IME_DIAGNOSTICO;
  globalThis.SOUSA_IME_DIAGNOSTICO_verificar = SOUSA_IME_DIAGNOSTICO_verificar;
}
