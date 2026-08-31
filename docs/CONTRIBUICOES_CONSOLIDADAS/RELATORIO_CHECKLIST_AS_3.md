# SOUSA 2.0 — Relatório Checklist: as 3 (STT · TTS Piper · Ponte)

**Data:** 2026-08-11  
**Escopo:** implementar encaixes Plug and Play dos 3 componentes prioritários  
**Produção:** NÃO alterada  

---

## O que são “as 3”

| # | Componente | Objetivo |
|---|------------|----------|
| 1 | **STT** | Áudio → texto (faster-whisper no desktop) |
| 2 | **TTS Piper** | Texto → áudio CPU 0800 |
| 3 | **Ponte local** | Engatar STT+TTS+SOUSA IA e fluxo conversar |

---

## Checklist do que foi feito

### 1. STT (Speech-to-Text)

| Item | Status |
|------|--------|
| Protocolo `STT_ECO` (Lab sem backend) | FEITO |
| Protocolo `STT_HTTP_JSON` (micro-serviço) | FEITO |
| `SOUSA_STT_conectar()` | FEITO |
| `SOUSA_STT_transcrever()` | FEITO |
| Arquivo Apps Script `SOUSA_USB_STT.js` | FEITO |
| Server Python stub `local_services/stt/server.py` | FEITO |
| Gancho faster-whisper (`SOUSA_STT_MODE=whisper`) | FEITO (código pronto; modelo no desktop) |
| Instalação do modelo Whisper neste ambiente | NÃO (proposital — desktop do Fundador) |

### 2. TTS Piper

| Item | Status |
|------|--------|
| Protocolo `TTS_PIPER_HTTP` | FEITO |
| Fallback `TTS_ECO` se sem endpoint | FEITO |
| `SOUSA_TTS_PIPER_conectar()` | FEITO |
| `SOUSA_TTS_PIPER_falar()` | FEITO |
| Arquivo Apps Script `SOUSA_USB_TTS_PIPER.js` | FEITO |
| Server Python stub `local_services/tts/server.py` | FEITO |
| Gancho binário Piper (`SOUSA_TTS_MODE=piper`) | FEITO (código pronto; binário no desktop) |
| Download de voz .onnx neste ambiente | NÃO (proposital) |

### 3. Ponte local

| Item | Status |
|------|--------|
| `SOUSA_PONTE_engatar()` — engata STT+TTS+(SOUSA IA) | FEITO |
| Modo eco Lab (`usar_eco: true`) | FEITO |
| Modo HTTP local/túnel | FEITO |
| `SOUSA_PONTE_conversar()` — texto/áudio → IA → voz | FEITO |
| `testarPonteTresEncaixes()` | FEITO |
| Arquivo `SOUSA_USB_PONTE_LOCAL.js` | FEITO |
| Aviso UrlFetchApp ≠ 127.0.0.1 documentado | FEITO |

### Integração / pacote

| Item | Status |
|------|--------|
| Boot registra adaptadores STT/TTS | FEITO |
| `local_services/README.md` | FEITO |
| Executor Universal intocado | SIM |
| Cascata / Core produção intocados | SIM |
| ZIP entregável atualizado | SIM |

---

## Arquivos novos

```
src/SOUSA_USB_STT.js
src/SOUSA_USB_TTS_PIPER.js
src/SOUSA_USB_PONTE_LOCAL.js
local_services/stt/server.py
local_services/tts/server.py
local_services/README.md
docs/RELATORIO_CHECKLIST_AS_3.md
```

---

## Como validar no Lab (eco, sem desktop)

Ordem de colagem adicional:
1. … (stack USB já existente)
2. `SOUSA_USB_STT.gs`
3. `SOUSA_USB_TTS_PIPER.gs`
4. `SOUSA_USB_PONTE_LOCAL.gs`

```javascript
SOUSA_PONTE_engatar({ usar_eco: true, conectar_sousa_ia: true, persistir: false });
testarPonteTresEncaixes();
```

---

## Como ativar no desktop (quando houver janela)

```bash
# Terminal 1
python local_services/stt/server.py

# Terminal 2
python local_services/tts/server.py
```

Depois (com túnel se for Apps Script na nuvem):

```javascript
SOUSA_PONTE_engatar({
  stt_url: "https://SEU-TUNEL-STT",
  tts_url: "https://SEU-TUNEL-TTS",
  conectar_sousa_ia: true
});
```

Whisper real: `export SOUSA_STT_MODE=whisper` + `pip install faster-whisper`  
Piper real: `export SOUSA_TTS_MODE=piper` + modelo `.onnx`

---

## Limitações honestas

1. **GAS na nuvem não acessa localhost** — precisa túnel ou teste só no desktop.  
2. **Stub ≠ modelo** — servers sobem e respondem; áudio/transcrição real exige Piper/Whisper no PC do Fundador.  
3. **Não foi instalado** faster-whisper nem Piper neste sandbox (regra 0800 + missão desktop).  

---

## Critério de sucesso desta entrega

- [x] Três encaixes USB existem e registram adaptadores  
- [x] Fluxo eco testável no Lab sem GPU  
- [x] Micro-serviços Python prontos para o desktop  
- [x] Relatório checklist + ZIP  
- [x] Core/Executor/Produção intactos  

**Próximo no desktop:** subir stubs → (opcional) Whisper/Piper reais → túnel → `SOUSA_PONTE_engatar` sem eco.


---

## Verificação automática neste ambiente (2026-08-11)

| Teste | Resultado |
|-------|-----------|
| STT `/health` :8765 | PASS — `mode=stub` |
| TTS `/health` :8766 | PASS — `mode=stub` |
| STT POST `/stt` com hint | PASS — texto stub PT |
| TTS POST `/tts` com texto | PASS — audio_base64 stub |
| Instalação Whisper/Piper | NÃO (desktop do Fundador) |
| Produção / Executor | INTOCADOS |

**Conclusão:** as 3 estão engatáveis. Lab usa modo eco; desktop usa stubs já validados; Whisper/Piper reais ficam para a máquina do Fundador.
