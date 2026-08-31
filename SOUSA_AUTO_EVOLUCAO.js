/**
 * SOUSA 2.0 — AUTO EVOLUÇÃO
 * Primeira camada: visão interna + preparação da visão externa.
 * Não altera produção automaticamente.
 */

var SOUSA_AUTO_EVOLUCAO_CORE = {

  versao: "1.0.0",

  analisar: function(opcoes) {

    var cfg = opcoes || {};

    var resultado = {
      ok: true,
      status: "ANALISE_CONCLUIDA",
      timestamp: new Date().toISOString(),

      visao_interna: {
        capacidades: [],
        recursos_usb: [],
        lacunas: []
      },

      visao_externa: {
        tecnologias: [],
        estrategias_negocio: []
      },

      oportunidades: [],
      proximas_acoes: [],
      producao: false,
      autorizacao_humana: true
    };

    if (typeof SOUSA_USB_listar === "function") {

      resultado.visao_interna.recursos_usb =
        SOUSA_USB_listar({
          apenas_operacional: true
        }).map(function(u) {

          return {
            id: u.id,
            provedor: u.provedor,
            protocolo: u.protocolo,
            modelo: u.modelo || null,
            capacidades: u.capacidades || []
          };

        });
    }

    resultado.visao_interna.capacidades =
      resultado.visao_interna.recursos_usb
        .reduce(function(lista, recurso) {

          (recurso.capacidades || []).forEach(function(cap) {

            var c = String(cap).toUpperCase();

            if (lista.indexOf(c) === -1) {
              lista.push(c);
            }

          });

          return lista;

        }, []);

    var capacidadesSolicitadas =
      Array.isArray(cfg.capacidades)
        ? cfg.capacidades
        : [
            "ORQUESTRACAO_MULTIAGENTE",
            "CODIGO",
            "CONHECIMENTO",
            "NOVAS_TECNOLOGIAS",
            "ESTRATEGIA_NEGOCIOS",
            "AFILIADOS",
            "PRODUCAO_CONTEUDO",
            "ADS"
          ];

    capacidadesSolicitadas.forEach(function(capacidade) {

      if (typeof SOUSA_CAPABILITY_DISCOVERY_analisar !== "function") {

        resultado.ok = false;
        resultado.status = "DISCOVERY_INDISPONIVEL";

        resultado.proximas_acoes.push(
          "CARREGAR_SOUSA_CAPABILITY_DISCOVERY"
        );

        return;
      }

      var analise =
        SOUSA_CAPABILITY_DISCOVERY_analisar(
          capacidade,
          {
            origem: "SOUSA_AUTO_EVOLUCAO"
          }
        );

      if (analise.lacuna === true) {

        resultado.visao_interna.lacunas.push({
          capacidade: analise.capacidade,
          status: "LACUNA",
          proxima_acao: analise.proxima_acao
        });

      }

    });

    resultado.visao_externa.tecnologias = [
      {
        nome: "RUFLO",
        tipo: "ORQUESTRACAO_MULTIAGENTE",
        status: "CANDIDATO_PARA_ANALISE"
      },
      {
        nome: "OPENMANUS",
        tipo: "AGENTES_AUTONOMOS",
        status: "CANDIDATO_PARA_ANALISE"
      },
      {
        nome: "OPENCODE",
        tipo: "ENGENHARIA_DE_CODIGO",
        status: "CANDIDATO_PARA_ANALISE"
      },
      {
        nome: "NVIDIA_SKILLS",
        tipo: "CAPACIDADES_ESPECIALIZADAS",
        status: "CANDIDATO_PARA_ANALISE"
      }
    ];

    resultado.visao_externa.estrategias_negocio = [
      {
        modulo: "AFILIADOS_PRO",
        status: "AREA_DE_OBSERVACAO"
      },
      {
        modulo: "ESTRATEGISTA",
        status: "AREA_DE_OBSERVACAO"
      },
      {
        modulo: "PRODUTOR",
        status: "AREA_DE_OBSERVACAO"
      },
      {
        modulo: "ADS",
        status: "AREA_DE_OBSERVACAO"
      }
    ];

    resultado.visao_interna.lacunas.forEach(function(lacuna) {

      resultado.oportunidades.push({

        capacidade: lacuna.capacidade,
        tipo: "EXPANSAO_DE_CAPACIDADE",
        status: "AGUARDANDO_ANALISE_EXTERNA",
        estrategia: "PESQUISAR_COMPARAR_ADAPTAR",
        laboratorio: "SOUSA_LAB",
        producao: false,
        autorizacao_humana: true

      });

    });

    if (resultado.oportunidades.length > 0) {

      resultado.proximas_acoes.push(
        "PESQUISAR_CANDIDATOS_EXTERNOS"
      );

      resultado.proximas_acoes.push(
        "COMPARAR_COMPATIBILIDADE_USB"
      );

      resultado.proximas_acoes.push(
        "PREPARAR_TESTE_SOUSA_LAB"
      );

    } else {

      resultado.proximas_acoes.push(
        "NENHUMA_LACUNA_PRIORITARIA_DETECTADA"
      );

    }

    return resultado;
  }
};

function SOUSA_AUTO_EVOLUCAO_analisar(opcoes) {
  return SOUSA_AUTO_EVOLUCAO_CORE.analisar(opcoes || {});
}
