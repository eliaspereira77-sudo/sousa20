/**
 * SOUSA 2.0
 * SOUSA_MANUTENCAO_OPERACIONAL.js
 *
 * Motor único de manutenção assistida.
 *
 * OBJETIVO:
 * ampliar a capacidade da equipe de manutenção
 * e reduzir trabalho braçal do fundador.
 *
 * REGRA:
 * diagnosticar automaticamente;
 * evidenciar automaticamente;
 * organizar automaticamente;
 * NÃO alterar produção automaticamente.
 */

const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const RAIZ = process.cwd();

const ARQUIVOS_CRITICOS = [
  "SOUSA_IME_DIAGNOSTICO.js",
  "SOUSA_REGISTRY.js",
  "SOUSA_FIO_CONDUTOR.js",
  "SOUSA_FIO_CONDUTOR_REAL.js",
  "SOUSA_CAPABILITY_DISCOVERY.js"
];

const resultado = {
  sistema: "SOUSA 2.0",
  modulo: "SOUSA_MANUTENCAO_OPERACIONAL",
  versao: "1.1.0",
  inicio: new Date().toISOString(),
  modo: "DIAGNOSTICO_ASSISTIDO",
  regra: "DETECTAR_EVIDENCIAR_NAO_CORRIGIR_PRODUCAO",
  resumo: {
    PASS: 0,
    WARN: 0,
    FAIL: 0
  },
  verificacoes: [],
  filaManutencao: [],
  evidencias: []
};

function registrar(status, etapa, mensagem, evidencia = null) {

  resultado.resumo[status]++;

  resultado.verificacoes.push({
    status,
    etapa,
    mensagem,
    evidencia,
    data: new Date().toISOString()
  });

  if (evidencia) {
    resultado.evidencias.push({
      etapa,
      evidencia
    });
  }

  if (status === "FAIL" || status === "WARN") {

    resultado.filaManutencao.push({
      prioridade: status === "FAIL" ? "ALTA" : "MEDIA",
      etapa,
      tarefa: mensagem,
      status: "AGUARDANDO_EQUIPE"
    });
  }
}

function arquivoExiste(nome) {
  return fs.existsSync(path.join(RAIZ, nome));
}

function validarSintaxe(nome) {

  const arquivo = path.join(RAIZ, nome);

  if (!fs.existsSync(arquivo)) {

    registrar(
      "FAIL",
      "SINTAXE",
      `Arquivo ausente: ${nome}`
    );

    return;
  }

  try {

    childProcess.execFileSync(
      process.execPath,
      ["--check", arquivo],
      {
        encoding: "utf8",
        stdio: "pipe"
      }
    );

    registrar(
      "PASS",
      "SINTAXE",
      `${nome}: sintaxe válida`
    );

  } catch (erro) {

    registrar(
      "FAIL",
      "SINTAXE",
      `${nome}: sintaxe inválida`,
      String(erro.stderr || erro.message)
    );
  }
}

/*
 * Carregamento real CommonJS.
 *
 * Importante:
 * cada módulo é carregado isoladamente,
 * preservando o contrato existente.
 */
function carregarModulo(nome) {

  const arquivo = path.join(RAIZ, nome);

  if (!fs.existsSync(arquivo)) {
    throw new Error(`Arquivo ausente: ${nome}`);
  }

  const resolvido = require.resolve(arquivo);

  delete require.cache[resolvido];

  return require(resolvido);
}

function localizarExportacao(modulo, nomeEsperado) {

  if (!modulo) {
    return null;
  }

  if (modulo[nomeEsperado]) {
    return modulo[nomeEsperado];
  }

  if (modulo.default && modulo.default[nomeEsperado]) {
    return modulo.default[nomeEsperado];
  }

  if (
    typeof modulo === "object" &&
    typeof modulo.verificarContrato === "function"
  ) {
    return modulo;
  }

  return null;
}

function testarContratoIma() {

  try {

    const modulo = carregarModulo(
      "SOUSA_IME_DIAGNOSTICO.js"
    );

    const ima =
      localizarExportacao(
        modulo,
        "SOUSA_IME_DIAGNOSTICO"
      );

    if (!ima) {

      throw new Error(
        "Módulo carregado, porém contrato SOUSA_IME_DIAGNOSTICO não foi localizado na exportação."
      );
    }

    if (
      typeof ima.verificarContrato !== "function"
    ) {

      throw new Error(
        "SOUSA_IME_DIAGNOSTICO foi localizado, mas verificarContrato() não está disponível."
      );
    }

    const contrato =
      ima.verificarContrato();

    if (!contrato || contrato.saudavel !== true) {

      throw new Error(
        "Contrato do ÍMÃ reprovado: " +
        JSON.stringify(contrato)
      );
    }

    registrar(
      "PASS",
      "CONTRATO_IME",
      "Contrato do ÍMÃ validado pelo motor operacional.",
      JSON.stringify(contrato)
    );

    return ima;

  } catch (erro) {

    registrar(
      "FAIL",
      "CONTRATO_IME",
      "Falha na validação do contrato do ÍMÃ.",
      erro.stack || erro.message
    );

    return null;
  }
}

function testarRegistry(ima) {

  try {

    const modulo =
      carregarModulo("SOUSA_REGISTRY.js");

    const registry =
      localizarExportacao(
        modulo,
        "SOUSA_REGISTRY"
      );

    if (!registry) {

      throw new Error(
        "Módulo carregado, porém SOUSA_REGISTRY não foi localizado na exportação."
      );
    }

    if (
      typeof registry.registrar !== "function"
    ) {

      throw new Error(
        "SOUSA_REGISTRY não possui registrar()."
      );
    }

    if (
      typeof registry.buscar !== "function"
    ) {

      throw new Error(
        "SOUSA_REGISTRY não possui buscar()."
      );
    }

    if (!ima) {

      throw new Error(
        "ÍMÃ não disponível para teste integrado."
      );
    }

    const componente = {

      id: ima.id,
      nome: ima.nome,
      categoria: ima.categoria,
      contrato: ima.contrato,
      versao: ima.versao,
      status: ima.status

    };

    const registro =
      registry.registrar(componente);

    if (
      !registro ||
      registro.sucesso !== true
    ) {

      throw new Error(
        "Registry não confirmou o registro."
      );
    }

    const recuperado =
      registry.buscar(
        "CAP_IME_DIAGNOSTICO"
      );

    if (!recuperado) {

      throw new Error(
        "Registry registrou, mas não conseguiu recuperar o componente."
      );
    }

    registrar(
      "PASS",
      "REGISTRY",
      "ÍMÃ → REGISTRY validado com sucesso.",
      JSON.stringify(recuperado)
    );

  } catch (erro) {

    registrar(
      "FAIL",
      "REGISTRY",
      "Falha na integração ÍMÃ → REGISTRY.",
      erro.stack || erro.message
    );
  }
}

function verificarArquitetura() {

  const grupos = [

    {
      nome: "FIO_CONDUTOR",
      arquivos: [
        "SOUSA_FIO_CONDUTOR.js",
        "SOUSA_FIO_CONDUTOR_REAL.js"
      ]
    },

    {
      nome: "CAPABILITY_DISCOVERY",
      arquivos: [
        "SOUSA_CAPABILITY_DISCOVERY.js"
      ]
    }

  ];

  for (const grupo of grupos) {

    const ausentes =
      grupo.arquivos.filter(
        nome => !arquivoExiste(nome)
      );

    if (ausentes.length === 0) {

      registrar(
        "PASS",
        grupo.nome,
        `Componentes presentes: ${grupo.arquivos.join(", ")}`
      );

    } else {

      registrar(
        "FAIL",
        grupo.nome,
        `Componentes ausentes: ${ausentes.join(", ")}`
      );
    }
  }
}

function gerarRelatorios() {

  resultado.fim =
    new Date().toISOString();

  const jsonPath =
    path.join(
      RAIZ,
      "SOUSA_MANUTENCAO_RELATORIO.json"
    );

  const mdPath =
    path.join(
      RAIZ,
      "SOUSA_MANUTENCAO_RELATORIO.md"
    );

  const logPath =
    path.join(
      RAIZ,
      "SOUSA_MANUTENCAO_EVIDENCIAS.log"
    );

  fs.writeFileSync(
    jsonPath,
    JSON.stringify(resultado, null, 2),
    "utf8"
  );

  const linhas = [];

  linhas.push(
    "# SOUSA 2.0 — RELATÓRIO DE MANUTENÇÃO"
  );

  linhas.push("");
  linhas.push(`Versão do motor: ${resultado.versao}`);
  linhas.push(`Início: ${resultado.inicio}`);
  linhas.push(`Fim: ${resultado.fim}`);
  linhas.push("");

  linhas.push("## Resultado");
  linhas.push("");

  linhas.push(
    `- PASS: ${resultado.resumo.PASS}`
  );

  linhas.push(
    `- WARN: ${resultado.resumo.WARN}`
  );

  linhas.push(
    `- FAIL: ${resultado.resumo.FAIL}`
  );

  linhas.push("");

  linhas.push("## Verificações");
  linhas.push("");

  for (const item of resultado.verificacoes) {

    linhas.push(
      `- [${item.status}] ${item.etapa}: ${item.mensagem}`
    );

    if (item.evidencia) {

      linhas.push(
        `  - Evidência: ${item.evidencia}`
      );
    }
  }

  linhas.push("");
  linhas.push("## Fila da equipe");
  linhas.push("");

  if (
    resultado.filaManutencao.length === 0
  ) {

    linhas.push(
      "Nenhuma tarefa pendente."
    );

  } else {

    for (
      const tarefa
      of resultado.filaManutencao
    ) {

      linhas.push(
        `- ${tarefa.prioridade} | ${tarefa.etapa} | ${tarefa.tarefa} | ${tarefa.status}`
      );
    }
  }

  linhas.push("");
  linhas.push("## Regra de soberania");
  linhas.push("");

  linhas.push(
    "**O motor diagnostica e organiza a manutenção, mas não altera produção automaticamente.**"
  );

  fs.writeFileSync(
    mdPath,
    linhas.join("\n"),
    "utf8"
  );

  fs.writeFileSync(
    logPath,
    resultado.evidencias
      .map(
        e =>
          `[${e.etapa}] ${e.evidencia}`
      )
      .join("\n"),
    "utf8"
  );
}

console.log("");
console.log("==================================================");
console.log(" SOUSA 2.0 | MANUTENÇÃO OPERACIONAL");
console.log("==================================================");
console.log("");

console.log(
  "[1/5] Verificando arquivos críticos..."
);

for (
  const nome
  of ARQUIVOS_CRITICOS
) {

  if (arquivoExiste(nome)) {

    registrar(
      "PASS",
      "ARQUIVO",
      `${nome}: encontrado`
    );

  } else {

    registrar(
      "FAIL",
      "ARQUIVO",
      `${nome}: AUSENTE`
    );
  }
}

console.log(
  "[2/5] Validando sintaxe..."
);

for (
  const nome
  of ARQUIVOS_CRITICOS
) {

  validarSintaxe(nome);
}

console.log(
  "[3/5] Validando contrato do ÍMÃ..."
);

const ima =
  testarContratoIma();

console.log(
  "[4/5] Testando ÍMÃ → REGISTRY..."
);

testarRegistry(ima);

console.log(
  "[5/5] Verificando arquitetura..."
);

verificarArquitetura();

gerarRelatorios();

console.log("");
console.log("==================================================");
console.log(" RESULTADO OPERACIONAL");
console.log("==================================================");
console.log("");

console.log(
  `PASS : ${resultado.resumo.PASS}`
);

console.log(
  `WARN : ${resultado.resumo.WARN}`
);

console.log(
  `FAIL : ${resultado.resumo.FAIL}`
);

console.log("");

console.log(
  "Relatórios:"
);

console.log(
  " - SOUSA_MANUTENCAO_RELATORIO.json"
);

console.log(
  " - SOUSA_MANUTENCAO_RELATORIO.md"
);

console.log(
  " - SOUSA_MANUTENCAO_EVIDENCIAS.log"
);

console.log("");

if (resultado.resumo.FAIL > 0) {

  console.log(
    "STATUS: 🔴 ATENÇÃO — equipe deve investigar a fila."
  );

  process.exitCode = 1;

} else if (resultado.resumo.WARN > 0) {

  console.log(
    "STATUS: 🟡 OPERACIONAL COM AVISOS."
  );

} else {

  console.log(
    "STATUS: 🟢 MANUTENÇÃO OPERACIONAL PASSOU."
  );
}
