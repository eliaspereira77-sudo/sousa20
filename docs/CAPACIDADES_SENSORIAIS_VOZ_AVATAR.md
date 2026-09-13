# Capacidades Sensoriais do SOUSA 2.0

## Visao Geral
O SOUSA IA possui capacidades sensoriais que permitem:
- OUVIR (STT - Speech-to-Text)
- FALAR (TTS - Text-to-Speech com voz clonada)
- VER/REPRESENTAR (Avatar Digital + Mapa 3D)

## VOZ CLONADA DO FUNDADOR

### Arquitetura
SOUSA IA -> DNA_MEMORIA_VOZ -> TTS_PIPER/STT -> Voz Clonada

### Modulos
- SOUSA_IA_DNA_MEMORIA_VOZ.js (20.7 KB) - DNA + Identidade + Memoria + Voz
- SOUSA_USB_TTS_PIPER.js (5.4 KB) - Text-to-Speech local (Piper, CPU)
- SOUSA_USB_STT.js (5.8 KB) - Speech-to-Text
- voice/clone.py (1.3 KB) - Script de clonagem

### Principio
A voz e identidade; o motor TTS e encaixe.
O provedor de voz encaixa por contrato, sem alterar o Executor Universal.

## AVATAR DIGITAL

### Arquitetura
SOUSA IA -> AVATAR_CONTRATO -> MAPA_3D -> Interface Visual

### Modulos
- SOUSA_AVATAR_CONTRATO.js (1.8 KB) - Contrato de interface
- SOUSA_IA_AVATAR_TESTES.js (1 KB) - Testes
- SOUSA_CONTRATO_UNIVERSAL_3D.js (11.1 KB) - Contrato 3D
- SOUSA_IA_MAPA_3D_GAS.gs (2.3 KB) - Mapa 3D no GAS

### Principio
Avatar = presenca/interface. SOUSA IA = inteligencia.
O Avatar nunca decide politica nem executa diretamente.

## Integracao com JARVIS

Ambas as capacidades estao mapeadas no Comportamento JARVIS:
- VOZ_CLONADA_FUNDADOR (12a capacidade)
- AVATAR_DIGITAL_3D (13a capacidade)

## Soberania do Fundador
Todas as capacidades sensoriais operam sob soberania absoluta do Fundador.
Nenhuma acao de voz ou avatar e executada sem autorizacao explicita.

Data: 2026-09-13
