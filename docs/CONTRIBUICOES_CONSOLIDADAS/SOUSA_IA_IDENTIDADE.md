# SOUSA IA — Identidade, DNA, Aprendizado e Voz

## Visão (confirmada)
100% USB Plug and Play + voz do fundador + aprender em contextos + DNA digital próprio.

## Pilares

### 1. USB Plug and Play
Executor agnóstico. SOUSA IA = união da cascata.

### 2. DNA digital
`SOUSA_IA_DNA_salvar` / `obter` — identidade, tom, princípios, limites.
Vira `systemInstruction` em toda resposta.

### 3. Aprender / treinar em contextos
**Operacional** (não fine-tune de pesos no Apps Script):
- `SOUSA_IA_aprenderExemplo({ entrada, saida_esperada })`
- `SOUSA_IA_aprenderCorrecao({ saida_errada, saida_correta })`
- `SOUSA_IA_aprenderContexto({ nome, descricao })`

Injetado nas próximas chamadas via DNA→system.

### 4. Voz do fundador
Capacidade `VOZ` como USB:
- Lab: `SOUSA_IA_VOZ_conectar()` → protocolo `TTS_ECO`
- Real: `SOUSA_IA_VOZ_conectar({ endpoint, autenticacao, voice_id_cofre: "SOUSA_IA_VOICE_ID" })`
- Cofre: `SOUSA_IA_VOICE_ID` = id da voz no provedor TTS
- `SOUSA_IA_falar(texto)` ou `SOUSA_IA_responder(texto, { falar: true })`

## Uso rápido
```javascript
SOUSA_USB_bootSeguro();
SOUSA_USB_SOUZA_IA_conectar();
SOUSA_IA_DNA_salvar({ identidade: { fundador: "Elias" } });
SOUSA_IA_aprenderCorrecao({ saida_correta: "..." });
SOUSA_IA_VOZ_conectar(); // eco no Lab
testarSousaIAIdentidadeCompleta();
SOUSA_IA_responder("Olá");
```

## Honestidade técnica
- Aprendizado = memória de preferências/correções/contextos, não treino de rede neural no GAS.
- Voz real depende de provedor TTS externo engatado por USB + voice_id no Cofre.
- Produção só após Lab.
