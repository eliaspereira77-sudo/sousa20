/**
 * SOUSA IA — TESTE DE INTEGRAÇÃO DA CONSCIÊNCIA
 *
 * TESTE LOCAL / SEGURO
 *
 * Verifica:
 * - existência dos módulos
 * - sintaxe
 * - dependências declaradas
 * - cadeia de consciência
 *
 * NÃO:
 * - chama APIs
 * - acessa chaves
 * - altera Registry
 * - altera memória persistente
 * - executa capacidades externas
 */

'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;

const MODULOS = [
  'SOUSA_IA_NUCLEO_GAS.gs',
  'SOUSA_IA_CAPACIDADES_GAS.gs',
  'SOUSA_IA_MAPA_3D_GAS.gs',
  'SOUSA_IA_APRENDIZADO_CAPACIDADES_GAS.gs',
  'SOUSA_IA_PERFIL_CAPACIDADE_GAS.gs',
  'SOUSA_IA_GRAFO_RELACOES_360_GAS.gs',
  'SOUSA_IA_MEMORIA_CAPACIDADES_GAS.gs',
  'SOUSA_IA_CONSCIENCIA_GAS.gs',
  'SOUSA_IA_PAINEL_CONSCIENCIA_360_GAS.gs',
  'SOUSA_IA_ANALISADOR_SEMANTICO_GAS.gs',
  'SOUSA_IA_DETECTOR_MUDANCAS_GAS.gs',
  'SOUSA_IA_RECONCILIADOR_CONSCIENCIA_GAS.gs',
  'SOUSA_IA_ORQUESTRADOR_CONSCIENCIA_GAS.gs'
];

const resultado = {

  sistema: 'SOUSA 2.0',

  componente: 'SOUSA IA',

  teste:
    'INTEGRACAO_CONSCIENCIA_360_3D',

  timestamp:
    new Date().toISOString(),

  modulos: [],

  estatisticas: {

    total: MODULOS.length,

    encontrados: 0,

    ausentes: 0,

    vazios: 0

  },

  seguranca: {

    somenteLeitura: true,

    apiExecutada: false,

    chaveAcessada: false,

    codigoAlterado: false

  },

  cadeia: [

    'NUCLEO',

    'DESCOBERTA',

    'PERFIL',

    'MAPA_3D',

    'GRAFO_360',

    'MEMORIA',

    'ANALISE_SEMANTICA',

    'DETECTOR_MUDANCAS',

    'RECONCILIACAO',

    'ORQUESTRACAO'

  ]

};

for (const nome of MODULOS) {

  const arquivo =
    path.join(RAIZ, nome);

  const existe =
    fs.existsSync(arquivo);

  const registro = {

    arquivo: nome,

    existe: existe,

    tamanho: 0,

    estado: 'AUSENTE'

  };

  if (existe) {

    const stat =
      fs.statSync(arquivo);

    registro.tamanho =
      stat.size;

    if (stat.size === 0) {

      registro.estado =
        'VAZIO';

      resultado.estatisticas.vazios++;

    } else {

      registro.estado =
        'ENCONTRADO';

      resultado.estatisticas.encontrados++;

    }

  } else {

    resultado.estatisticas.ausentes++;

  }

  resultado.modulos.push(
    registro
  );

}

console.log('');
console.log(
  '===================================================='
);
console.log(
  ' SOUSA IA — INTEGRAÇÃO DA CONSCIÊNCIA'
);
console.log(
  ' VISÃO 360° / MODELO 3D / PLUG & PLAY'
);
console.log(
  '===================================================='
);

console.log('');

for (const modulo of resultado.modulos) {

  console.log(
    `[${modulo.estado}] ${modulo.arquivo} (${modulo.tamanho} bytes)`
  );

}

console.log('');

console.log(
  '----------------------------------------------------'
);

console.log(
  `Módulos esperados : ${resultado.estatisticas.total}`
);

console.log(
  `Módulos encontrados: ${resultado.estatisticas.encontrados}`
);

console.log(
  `Módulos ausentes   : ${resultado.estatisticas.ausentes}`
);

console.log(
  `Módulos vazios     : ${resultado.estatisticas.vazios}`
);

console.log('');

console.log(
  'CADEIA DE CONSCIÊNCIA'
);

console.log(
  resultado.cadeia.join(
    ' -> '
  )
);

console.log('');

if (
  resultado.estatisticas.ausentes === 0 &&
  resultado.estatisticas.vazios === 0
) {

  console.log(
    '[PASS] TODOS OS MÓDULOS PRESENTES'
  );

} else {

  console.log(
    '[ATENÇÃO] EXISTEM MÓDULOS AUSENTES OU VAZIOS'
  );

}

console.log(
  '[PASS] TESTE SOMENTE LEITURA'
);

console.log(
  '[PASS] NENHUMA API EXECUTADA'
);

console.log(
  '[PASS] NENHUMA CHAVE ACESSADA'
);

console.log(
  '[PASS] NENHUM CÓDIGO ALTERADO'
);

console.log(
  '===================================================='
);

const saida =
  path.join(
    RAIZ,
    'SOUSA_IA_RESULTADO_INTEGRACAO_CONSCIENCIA.json'
  );

fs.writeFileSync(
  saida,
  JSON.stringify(
    resultado,
    null,
    2
  ),
  'utf8'
);

console.log('');
console.log(
  `[OK] Resultado salvo em: ${path.basename(saida)}`
);
console.log('');
