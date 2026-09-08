/**
 * SOUSA IA — NÚCLEO GAS
 * Consciência 360° / Plug & Play / Capability Registry
 *
 * V1 — SOMENTE LEITURA
 *
 * Responsabilidades:
 * - Construir contexto operacional
 * - Conhecer capacidades registradas
 * - Detectar estado do ecossistema
 * - Preparar contexto para o motor de IA
 *
 * NÃO:
 * - executa reparos
 * - altera arquivos
 * - executa comandos do sistema
 * - acessa chaves diretamente
 */

var SOUSA_IA_GAS_NUCLEO = {

  protocolo: 'SOUSA-IA-GAS',
  versao: '1.0.0',

  identidade: {
    sistema: 'SOUSA 2.0',
    componente: 'SOUSA IA',
    ambiente: 'GOOGLE_APPS_SCRIPT'
  },

  modo: 'SOMENTE_LEITURA',

  criarContexto: function() {

    var contexto = {
      timestamp: new Date().toISOString(),

      sistema: this.identidade,

      consciencia: {
        espacial: true,
        visao360: true,
        dimensoes: {
          largura: 'capacidades e modulos',
          altura: 'camadas do sistema',
          profundidade: 'dependencias e fluxos'
        }
      },

      plugins: [],

      capacidades: [],

      memoria: {
        disponivel: false,
        fonte: null
      },

      politica: {
        disponivel: false
      },

      execucao: {
        disponivel: false
      },

      descoberta: {
        ativa: true,
        aprendizadoAutomatico: true
      }
    };

    contexto.capacidades =
      this.lerCapacidades();

    contexto.plugins =
      this.identificarPlugins(contexto.capacidades);

    contexto.memoria =
      this.verificarMemoria();

    contexto.politica =
      this.verificarFuncao(
        'SOUSA_POLITICA_cooldown'
      );

    contexto.execucao =
      this.verificarFuncao(
        'SOUSA_API_EXECUTOR_UNIVERSAL'
      );

    return contexto;
  },


  lerCapacidades: function() {

    var capacidades = [];

    try {

      if (typeof SOUSA_CAPABILITY_REGISTRY !== 'undefined') {

        // Registry real: objeto contendo Map de capacidades
        if (
          SOUSA_CAPABILITY_REGISTRY.capabilities &&
          typeof SOUSA_CAPABILITY_REGISTRY.capabilities.values === 'function'
        ) {

          var registros = Array.from(
            SOUSA_CAPABILITY_REGISTRY.capabilities.values()
          );

          capacidades = registros.map(function(capacidade) {
            return {
              id: capacidade.id || null,
              nome: capacidade.name || capacidade.nome || capacidade.id || 'SEM_NOME',
              provider: capacidade.provider || null,
              adapter: capacidade.adapter || null,
              status: capacidade.status || null,
              category: capacidade.category || null,
              capabilities: Array.isArray(capacidade.capabilities)
                ? capacidade.capabilities
                : [],
              origem: 'REGISTRY'
            };
          });

        } else if (typeof SOUSA_CAPABILITY_REGISTRY === 'function') {

          // Compatibilidade com Registry legado
          var resultado = SOUSA_CAPABILITY_REGISTRY();

          if (Array.isArray(resultado)) {
            capacidades = resultado;
          }

        }

      }

    } catch (erro) {

      capacidades.push({
        estado: 'ERRO_LEITURA_REGISTRY',
        mensagem: String(erro.message || erro)
      });

    }

    return capacidades;
  },


  identificarPlugins: function(capacidades) {

    if (!Array.isArray(capacidades)) {
      return [];
    }

    return capacidades.map(function(capacidade) {

      return {
        identificador:
          capacidade.id ||
          capacidade.nome ||
          'CAPACIDADE_SEM_ID',

        estado:
          capacidade.estado ||
          'CONECTADA',

        origem:
          capacidade.origem ||
          'DESCONHECIDA',

        descobertaAutomatica: true
      };

    });

  },


  verificarMemoria: function() {

    var funcoes = [
      'SOUSA_IA_MEMORIA',
      'SOUSA_IA_DNA',
      'SOUSA_IA_MEMORIA_VOZ'
    ];

    for (var i = 0; i < funcoes.length; i++) {

      if (
        typeof this.obterFuncaoGlobal(
          funcoes[i]
        ) === 'function'
      ) {

        return {
          disponivel: true,
          fonte: funcoes[i]
        };

      }

    }

    return {
      disponivel: false,
      fonte: null
    };

  },


  verificarFuncao: function(nome) {

    return {
      disponivel:
        typeof this.obterFuncaoGlobal(nome) ===
        'function',

      funcao: nome
    };

  },


  obterFuncaoGlobal: function(nome) {

    try {

      if (
        typeof globalThis !== 'undefined' &&
        typeof globalThis[nome] === 'function'
      ) {

        return globalThis[nome];

      }

    } catch (erro) {}

    return null;
  },


  diagnostico: function() {

    var contexto =
      this.criarContexto();

    Logger.log(
      JSON.stringify(
        contexto,
        null,
        2
      )
    );

    return contexto;
  }

};


/**
 * Função pública para diagnóstico
 * do núcleo SOUSA IA dentro do GAS.
 */
function SOUSA_IA_GAS_diagnostico() {

  return SOUSA_IA_GAS_NUCLEO.diagnostico();

}
