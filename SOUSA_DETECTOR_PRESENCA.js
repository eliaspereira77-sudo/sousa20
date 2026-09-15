/**
 * SOUSA 2.0 - DETECTOR DE PRESENCA DO FUNDADOR (JARVIS 15)
 * Detecta onde o Fundador está e adapta comportamento
 */
const os = require('os');
const CONFIG = {
  version: '1.0.0',
  capacidade: 'JARVIS_15',
  fundador: 'Dionisio Lima / Elias Pereira de Sousa'
};

function detectarPresenca() {
  const p = { 
    timestamp: new Date().toISOString(),
    local: 'DESCONHECIDO',
    modo: 'PADRAO',
    dispositivo: 'DESCONHECIDO',
    confianca: 0
  };
  
  const plataforma = os.platform();
  const hora = new Date().getHours();
  const dia = new Date().getDay();
  const pastaAtual = process.cwd();
  
  if (plataforma === 'win32') {
    p.dispositivo = 'DESKTOP_WINDOWS';
    if (pastaAtual.includes('OneDrive') || pastaAtual.includes('Dionisio Lima')) {
      p.local = 'DESKTOP_PRINCIPAL';
      p.modo = 'COMPLETO';
      p.confianca = 90;
      p.contexto = { usuario: 'Dionisio Lima', tempoDisponivel: 'Longo' };
    }
  } else if (process.env.TERMUX_VERSION) {
    p.dispositivo = 'SMARTPHONE_ANDROID';
    if (dia >= 1 && dia <= 5 && hora >= 7 && hora <= 18) {
      p.local = 'EMEF_DIONISIO_LIMA';
      p.modo = 'VIGILANTE';
      p.confianca = 85;
      p.contexto = { escola: 'EMEF Dionisio Lima', tempoFracionado: true };
    } else {
      p.local = 'MOVEL_OUTRO';
      p.modo = 'MOVEL';
      p.confianca = 70;
    }
  }
  
  return p;
}

function adaptarComportamento(p) {
  const comportamentos = {
    'VIGILANTE': { interface: 'curta', tempoMaximo: '5 min', prioridades: ['status', 'comandos rápidos'] },
    'MOVEL': { interface: 'mobile', tempoMaximo: '10 min', prioridades: ['consulta', 'sync'] },
    'COMPLETO': { interface: 'desktop', tempoMaximo: 'ilimitado', prioridades: ['desenvolvimento', 'deploy', 'validação'] }
  };
  return comportamentos[p.modo] || comportamentos['COMPLETO'];
}

module.exports = { detectarPresenca, adaptarComportamento, CONFIG };
