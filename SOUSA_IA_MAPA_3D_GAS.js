/**
 * SOUSA IA — MAPA 3D OPERACIONAL
 *
 * Visão:
 *   LARGURA     = capacidades
 *   ALTURA      = camadas
 *   PROFUNDIDADE= dependências, relações e fluxos
 *   360°        = visão de todos os componentes conhecidos
 *
 * V1 — SOMENTE LEITURA
 */

var SOUSA_IA_MAPA_3D = {

  protocolo: 'SOUSA-IA-3D-360',
  versao: '1.0.0',

  construir: function() {

    var mapa = SOUSA_IA_CAPACIDADES_GAS.construirMapa();

    var capacidades = mapa.capacidades || [];

    var largura = [];
    var altura = [];
    var profundidade = [];

    capacidades.forEach(function(capacidade, indice) {

      largura.push({
        indice: indice,
        id: capacidade.id || null,
        nome: capacidade.nome || null,
        categoria: capacidade.categoria || null,
        papel: capacidade.papel || null
      });

      altura.push({
        indice: indice,
        camada: capacidade.categoria || 'CAPACIDADE_GERAL',
        estado: capacidade.estado || 'DESCONHECIDO'
      });

      profundidade.push({
        origem: capacidade.nome || null,
        categoria: capacidade.categoria || null,
        papel: capacidade.papel || null,
        transporte: capacidade.transporte || null,
        protocolo: capacidade.protocolo || null
      });

    });

    return {

      sistema: 'SOUSA 2.0',
      componente: 'SOUSA IA',
      ambiente: 'GOOGLE_APPS_SCRIPT',

      visao: {
        graus: 360,
        completa: true,
        modo: 'ESTRUTURAL'
      },

      dimensoes3D: {

        largura: {
          descricao: 'CAPACIDADES E COMPONENTES',
          total: largura.length,
          objetos: largura
        },

        altura: {
          descricao: 'CAMADAS E ESTADOS',
          total: altura.length,
          objetos: altura
        },

        profundidade: {
          descricao: 'DEPENDENCIAS, PAPEIS E RELACOES',
          total: profundidade.length,
          objetos: profundidade
        }

      },

      totalCapacidades: capacidades.length,

      timestamp: new Date().toISOString(),

      somenteLeitura: true

    };

  },

  diagnostico: function() {

    var mapa = this.construir();

    Logger.log(
      JSON.stringify(
        mapa,
        null,
        2
      )
    );

    return mapa;

  }

};


/**
 * FUNÇÃO PÚBLICA GAS
 */
function SOUSA_IA_MAPA_3D_DIAGNOSTICO() {

  return SOUSA_IA_MAPA_3D.diagnostico();

}
