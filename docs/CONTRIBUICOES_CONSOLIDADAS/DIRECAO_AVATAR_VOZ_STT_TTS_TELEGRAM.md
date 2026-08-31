# SOUSA 2.0 — Direção: Avatar • Voz • STT • TTS • Lip Sync • Telegram

**Etapa:** refinar + apontar direção (0800 primeiro)  
**Data:** 2026-08-11  
**Escopo:** NÃO instalar · NÃO clonar voz · NÃO criar avatar · NÃO alterar Core/Executor  

Princípio: *Pela união das capacidades, SOUSA IA.*  
Camada de interação desacoplada do núcleo, via adaptadores USB.

---

## 1. Refinamento do que já existe no clone

| Já preparado | Estado | Refino de direção (sem código agora) |
|--------------|--------|--------------------------------------|
| USB Contrato + Registry + Adapters | Pronto | Manter. Novos protocolos = novos adapters, zero patch no Executor |
| SOUSA IA = união da cascata | Pronto | Manter como centro orquestrador |
| DNA + memória operacional | Pronto | Continua injetando identidade no system; não misturar com fine-tune de modelo |
| `TTS_ECO` / `TTS_HTTP_JSON` | Stub PnP | Suficiente até existir servidor local TTS; depois só trocar endpoint/protocolo |
| `SOUSA_IA_falar` / `SOUSA_IA_responder` | Stub | Quando houver STT/TTS locais, o fluxo vira: STT → SOUSA_IA_responder → TTS → (Avatar) |
| Cascata cloud (Gemini…Ollama) | Pronto | Não mexer; SOUSA IA já usa como união |

**O que NÃO fazer agora:** reescrever Executor, expandir cascata, instalar GPU stack, pedir upload de voz/foto.

**Pequenos refinamentos conceituais (quando for implementar):**
1. Declarar capacidades USB: `STT`, `TTS`, `VOZ_CLONE`, `AVATAR`, `LIPSYNC`, `CANAL_TELEGRAM`.
2. Um micro-serviço local (Python) por família de adaptador, exposto em `http://127.0.0.1:PORT` — o Apps Script só chama USB HTTP (já previsto em `TTS_HTTP_JSON`).
3. Telegram nunca no Core: só `CANAL_TELEGRAM` adapter.

---

## 2. Arquitetura recomendada (camada de interação)

```
                    FUNDADOR
                       │
              voz / texto / Telegram
                       │
                       ▼
              ┌──── STT Adapter ────┐
              │  (áudio → texto)    │
              └──────────┬──────────┘
                         ▼
                    SOUSA IA
              (união + DNA + memória)
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           TTS        EVENTO     (texto)
              │          │
              ▼          ▼
           ÁUDIO      AVATAR / LipSync
              │          │
              └────┬─────┘
                   ▼
            resposta ao Fundador
            (Telegram / desktop / mobile)
```

Cada caixa = **adaptador substituível**.  
SOUSA IA permanece o centro. Canais e mídia são periferia PnP.

---

## 3. Matriz de recursos 0800 (seleção prática)

| Função | Recurso | Open Source | Local | Gratuito | PT-BR | GPU | API | Observação |
|--------|---------|-------------|-------|----------|-------|-----|-----|------------|
| **STT** | **faster-whisper** (Whisper large-v3 / turbo) | Sim (MIT) | Sim | Sim | Excelente | Opcional (CPU ok, lento) | Python lib | **Padrão recomendado** |
| STT leve | Vosk | Sim (Apache) | Sim | Sim | Bom | Não | Python/C | Edge / pouca RAM |
| **TTS rápido** | **Piper** | Sim (MIT) | Sim | Sim | Sim (vozes PT) | Não (CPU) | CLI/HTTP fácil | **1º TTS no desktop** |
| TTS qualidade | Kokoro-82M | Sim (Apache 2.0) | Sim | Sim | Parcial/EN+ | Baixa/CPU | Sim | Leve; PT menos maduro que Piper+XTTS |
| **Clonagem de voz** | **XTTS v2** (Coqui / fork idiap) | Sim | Sim | Sim* | Sim (`pt`) | ~4–6 GB | Python | *CPML: uso pessoal/pesquisa; comercial restrito |
| Clonagem MIT | OpenVoice v2 | Sim (MIT) | Sim | Sim | Fraco vs XTTS em PT | ~4–8 GB | Python | Bom se licença comercial for crítica |
| Clonagem qualidade | Chatterbox | Sim (MIT) | Sim | Sim | Foco EN | ~4–6 GB | Python | Preferir XTTS para PT-BR do fundador |
| **Avatar (foto→fala)** | **SadTalker** | Sim (Apache 2.0) | Sim | Sim | N/A | Médio (CPU possível, lento) | Scripts/WebUI | **Padrão foto única** |
| Lip sync vídeo | **MuseTalk** | Sim (MIT) | Sim | Sim | N/A | ~4 GB+ | Python | Rápido; bom para preview |
| Lip sync qualidade | LatentSync 1.5/1.6 | Sim (Apache 2.0) | Sim | Sim | N/A | 8–18 GB | Python | Melhor fidelidade; mais VRAM |
| Lip sync clássico | Wav2Lip | Sim | Sim | Sim | N/A | Baixa | Python | Sync bom; **licença OSS comercial problemática** — evitar produto |
| **Canal** | python-telegram-bot | Sim | Bot cloud free | Tier free TG | Sim | Não | Bot API | Adapter de canal, não núcleo |

### Links de referência (oficiais / repositórios)

| Recurso | Link |
|---------|------|
| faster-whisper | https://github.com/SYSTRAN/faster-whisper |
| Whisper (base) | https://github.com/openai/whisper |
| Vosk | https://github.com/alphacep/vosk-api |
| Piper | https://github.com/rhasspy/piper |
| XTTS / Coqui fork | https://github.com/idiap/coqui-ai-TTS · weights HF `coqui/XTTS-v2` |
| OpenVoice | https://github.com/myshell-ai/OpenVoice |
| SadTalker | https://github.com/OpenTalker/SadTalker |
| MuseTalk | https://github.com/TMElyralab/MuseTalk |
| LatentSync | ByteDance LatentSync (Apache 2.0) — ver releases oficiais |
| python-telegram-bot | https://github.com/python-telegram-bot/python-telegram-bot |

---

## 4. Detalhe por função (requisitos honestos)

### STT — Áudio → Texto
**Escolha: faster-whisper**  
- Licença: MIT  
- PT-BR: forte (Whisper large-v3 / turbo)  
- Local: sim  
- GPU: recomendada; CPU com quantização int8 viável  
- Dificuldade: baixa (`pip install faster-whisper`)  
- Adequação SOUSA: alta — vira protocolo `STT_WHISPER` + micro-serviço local  

**Fallback:** Vosk (CPU, streaming, menos acurácia).

### TTS — Texto → Áudio (sem clone ainda)
**Escolha 1º: Piper**  
- CPU-only, ONNX, vozes PT disponíveis na comunidade  
- Ideal para “0800 que fala” no primeiro dia no desktop  
- Dificuldade: baixa  

**Depois (voz do fundador):** XTTS v2 com ~6–30 s de amostra autorizada.  
- GPU ~4–6 GB VRAM  
- Português nativo no modelo  
- Atenção licença CPML (pessoal/Lab ok; produto comercial exige checagem)

### Clonagem de voz
Fluxo conceitual (só quando o Fundador autorizar material):

```
amostra autorizada → XTTS (ou OpenVoice) → modelo/voz de referência
        ↓
   TTS Adapter (USB)
        ↓
   áudio SOUSA IA
```

Nada disso no Apps Script puro — sempre micro-serviço local engatado por HTTP USB.

### Avatar + Lip Sync
**Caminho 0800 realista:**
1. Foto do SOUSA IA / fundador (quando autorizar) + áudio TTS  
2. **SadTalker** → talking head offline  
3. Se no futuro houver vídeo base: **MuseTalk** (velocidade) ou **LatentSync** (qualidade)

Requisitos SadTalker: Python, checkpoints ~2 GB, GPU ajuda muito; CPU possível e lento.  
**Não** usar Wav2Lip como base de produto (restrição comercial da release OSS).

### Telegram
```
Telegram Bot API
      ↓
Adapter CANAL_TELEGRAM  (Python ou Apps Script UrlFetch)
      ↓
SOUSA_IA_responder / cascata
      ↓
Adapter de volta (texto e, depois, áudio/arquivo)
```

BotFather tier free. Sem cartão. Canal substituível (WhatsApp, web, etc.) pelo mesmo padrão.

---

## 5. Stack 0800 preferencial (caminho único)

| Ordem | Componente | Ferramenta | Onde roda |
|-------|------------|------------|-----------|
| 1 | STT | faster-whisper | Desktop local |
| 2 | Cérebro | SOUSA IA (já no Lab/GAS) | Apps Script + cascata |
| 3 | TTS base | Piper | Desktop local |
| 4 | Ponte | HTTP USB (`127.0.0.1`) | Une GAS ↔ Python |
| 5 | Voz fundador | XTTS v2 | Desktop (quando houver amostra) |
| 6 | Avatar | SadTalker | Desktop (quando houver foto) |
| 7 | Canal | Telegram bot + adapter | Cloud free + desktop opcional |

Tudo atrás de adaptadores. Trocar Piper→XTTS ou SadTalker→MuseTalk **não** mexe no Core.

---

## 6. Encaixes Plug and Play a deixar abertos

```
SOUSA IA
  ├── STT Adapter      (STT_WHISPER | STT_VOSK | …)
  ├── TTS Adapter      (TTS_PIPER | TTS_XTTS | TTS_HTTP_JSON | …)
  ├── Voice Clone Ref  (metadado + path local — nunca no Cofre GAS como blob)
  ├── Avatar Adapter   (AVATAR_SADTALKER | …)
  ├── LipSync Adapter  (LIPSYNC_MUSETALK | LIPSYNC_LATENTSYNC | …)
  └── Canal Adapter    (CANAL_TELEGRAM | CANAL_WEB | …)
```

O clone **já** tem o padrão (`ADAPTER_registrar` + contrato + `TTS_HTTP_JSON`).  
Falta só, no desktop, os micro-serviços e o registro dos protocolos novos — sem reabrir o Executor.

---

## 7. Próximo passo mínimo (quando voltar ao desktop)

**Uma sequência só — não vinte tarefas:**

1. **Validar no Lab** o que já está no ZIP (`testarUSBUniversalCompleto`, `testarEncaixeSouzaIA`, `testarSousaIAIdentidadeCompleta`) — 30–60 min.  
2. **Primeiro componente novo: STT local** — instalar faster-whisper no desktop, transcrever um áudio PT-BR de teste, expor `POST /stt` mínimo.  
3. **Segundo: TTS Piper** — `POST /tts` devolvendo WAV.  
4. **Terceiro: ligar a ponte** — USB HTTP no Lab apontando para `127.0.0.1` (só em máquina do fundador / túnel controlado).  
5. Só então: amostra de voz → XTTS; foto → SadTalker; bot Telegram.

**Por que STT primeiro?**  
Desbloqueia “falar com o SOUSA IA” com o cérebro que já existe, sem GPU pesada e sem material sensível de clonagem.

---

## 8. O que fica explicitamente para depois

- Upload de foto/voz do fundador  
- Clonagem real e avatar final  
- Tempo real streaming  
- Mobile nativo  
- Qualquer gasto / conta paga  

---

## 9. Critério de sucesso desta etapa

Ao olhar o SOUSA 2.0, o Fundador deve poder dizer:

> “Sei o caminho: Lab já PnP → desktop STT (Whisper) → TTS (Piper) → ponte HTTP → depois voz/avatar/Telegram — tudo por adaptador.”

Não: “Tenho cinquenta ferramentas para avaliar.”

---

*Documento de direção. Implementação definitiva = janela futura no desktop do Fundador.*
