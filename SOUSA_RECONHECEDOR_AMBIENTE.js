/**
 * SOUSA 2.0 - RECONHECEDOR DE AMBIENTE (JARVIS 14)
 * Versão Desktop - Detecta automaticamente o ambiente operacional
 */
const os = require('os');
const fs = require('fs');
const CONFIG = {
  version: '1.0.0-desktop',
  capacidade: 'JARVIS_14',
  principio: 'CONHECER_AMBIENTE_ANTES_DE_AGIR'
};

function detectarAmbiente() {
  const amb = { 
    timestamp: new Date().toISOString(),
    tipo: 'DESCONHECIDO', 
    confianca: 0,
    detalhes: {} 
  };
  
  const plataforma = os.platform();
  const pastaAtual = process.cwd();
  
  if (plataforma === 'win32') {
    if (pastaAtual.includes('OneDrive')) {
      amb.tipo = 'DRIVE_SINCRONIZADO';
      amb.confianca = 90;
      amb.detalhes = { drive: 'OneDrive', plataforma: 'Windows' };
    } else {
      amb.tipo = 'DESKTOP_WINDOWS';
      amb.confianca = 85;
      amb.detalhes = { plataforma: 'Windows' };
    }
  } else if (plataforma === 'linux') {
    if (process.env.TERMUX_VERSION || process.env.PREFIX === '/data/data/com.termux/files/usr') {
      amb.tipo = 'MOBILE_TERMUX';
      amb.confianca = 95;
      amb.detalhes = { android: true };
    } else {
      amb.tipo = 'DESKTOP_LINUX';
      amb.confianca = 85;
    }
  } else if (plataforma === 'darwin') {
    amb.tipo = 'DESKTOP_MAC';
    amb.confianca = 85;
  }
  
  return amb;
}

function classificarAmbiente(amb) {
  const classes = {
    'DESKTOP_WINDOWS': { nivel: 'LOCAL', capacidades: ['GUI', 'PowerShell', 'Node'], tempoMaximo: 'ilimitado' },
    'DRIVE_SINCRONIZADO': { nivel: 'HIBRIDO', capacidades: ['sync automática', 'backup'], tempoMaximo: 'ilimitado' },
    'MOBILE_TERMUX': { nivel: 'MOVEL', capacidades: ['terminal', 'ssh'], tempoMaximo: '5 min' },
    'DESKTOP_LINUX': { nivel: 'LOCAL', capacidades: ['terminal completo'], tempoMaximo: 'ilimitado' },
    'DESKTOP_MAC': { nivel: 'LOCAL', capacidades: ['terminal completo'], tempoMaximo: 'ilimitado' }
  };
  return classes[amb.tipo] || { nivel: 'DESCONHECIDO' };
}

function statusReconhecedor() {
  return { version: CONFIG.version, capacidade: CONFIG.capacidade, status: 'OPERACIONAL' };
}

module.exports = { detectarAmbiente, classificarAmbiente, statusReconhecedor, CONFIG };
