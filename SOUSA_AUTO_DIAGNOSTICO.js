const fs = require("fs");
const vm = require("vm");

const ARQUIVOS = [
  "SOUSA_USB_CONTRATO.js",
  "SOUSA_USB_ADAPTERS.js",
  "SOUSA_USB_REGISTRY.js",
  "SOUSA_POLITICA.js",
  "SOUSA_INTENCAO.js",
  "SOUSA_CICLO_AUTONOMO.js",
  "SOUSA_API_EXECUTOR_UNIVERSAL.js",
  "SOUSA_ORQUESTRADOR.js"
];

function SOUSA_AUTO_DIAGNOSTICO() {
  const resultado = {
    ok: true,
    status: "INICIANDO",
    arquivos: [],
    funcoes: {},
    erros: []
  };

  const ctx = { console, Date };
  vm.createContext(ctx);

  for (const arquivo of ARQUIVOS) {
    try {
      if (!fs.existsSync(arquivo)) {
        resultado.ok = false;
        resultado.erros.push("ARQUIVO_AUSENTE: " + arquivo);
        continue;
      }

      vm.runInContext(
        fs.readFileSync(arquivo, "utf8"),
        ctx,
        { filename: arquivo }
      );

      resultado.arquivos.push({
        arquivo,
        status: "OK"
      });

    } catch (erro) {
      resultado.ok = false;
      resultado.erros.push({
        arquivo,
        erro: erro.message || String(erro)
      });
    }
  }

  const FUNCOES = {
    CONTRATO: "SOUSA_USB_normalizar",
    ADAPTERS: "SOUSA_USB_ADAPTER_bootstrap",
    REGISTRY: "SOUSA_USB_conectar",
    POLITICA: "SOUSA_POLITICA_selecionar",
    INTENCAO: "SOUSA_INTENCAO_receber",
    CICLO: "SOUSA_CICLO_criar",
    EXECUTOR: "SOUSA_API_EXECUTOR_UNIVERSAL",
    ORQUESTRADOR: "SOUSA_ORQUESTRADOR_porTexto"
  };

  for (const [nome, funcao] of Object.entries(FUNCOES)) {
    resultado.funcoes[nome] = typeof ctx[funcao] === "function";

    if (!resultado.funcoes[nome]) {
      resultado.ok = false;
      resultado.erros.push("FUNCAO_AUSENTE: " + funcao);
    }
  }

  resultado.status = resultado.ok
    ? "NUCLEO_OPERACIONAL"
    : "NUCLEO_COM_PENDENCIAS";

  return resultado;
}

const resultado = SOUSA_AUTO_DIAGNOSTICO();

console.log(
  JSON.stringify(resultado, null, 2)
);

if (!resultado.ok) {
  process.exitCode = 1;
}
