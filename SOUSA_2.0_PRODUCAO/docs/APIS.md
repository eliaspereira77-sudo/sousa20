# SOUSA 2.0 — Catálogo de APIs Externas

Atualizado: 2026-09-22

## Princípios

1. **Maximizar recursos $0** antes de consumir quota paga.
2. Toda integração externa entra como **USB** (`pode_alterar_nucleo=False`).
3. Sem defaults silenciosos para URL/chave obrigatória.
4. Interface comum: `.generate(prompt) -> str` quando for LLM.

---

## Integrações ativas

### 1. Gemini API
| Campo | Valor |
|-------|-------|
| Tipo | LLM (pago / free tier) |
| Pacote | `google-genai` |
| Arquivo | `core/gemini_client.py` |
| Modelo padrão | `gemini-3.8-flash` |
| Env | `GEMINI_API_KEY` |
| Papel | Fallback principal de geração de texto |
| Endpoint de teste | `POST /chat/gemini` |

### 2. OmniRoute
| Campo | Valor |
|-------|-------|
| Tipo | Gateway LLM local (HTTP) |
| Arquivo | `core/omniroute_client.py` |
| Protocolo | OpenAI-compatible `/v1/chat/completions` |
| Env | `OMNIROUTE_BASE_URL`, `OMNIROUTE_API_KEY`, `OMNIROUTE_MODEL` |
| Papel | **Prioridade $0** — tenta antes do Gemini |
| Endpoint | Usado em `POST /chat` |

### 3. Google Drive (Apps Script)
| Campo | Valor |
|-------|-------|
| Tipo | Persistência / arquivos |
| Arquivo | `SOUSA_DRIVE_API.js` (legado Apps Script) |
| Custo | Zero (DriveApp nativo) |
| Capacidades | salvar, ler, pastas, logs, backup |

### 4. TTS / Voz (Piper)
| Campo | Valor |
|-------|-------|
| Tipo | USB de voz |
| Arquivo | `voice/tts_client.py` |
| Engine prioritário | Piper local |
| Env | `PIPER_BIN`, `PIPER_MODEL`, `TTS_VOICE` |
| Status | Estrutura pronta; requer Piper instalado |

### 5. Módulo ADS
| Campo | Valor |
|-------|-------|
| Tipo | Análise de código via LLM |
| Arquivo | `core/modulo_ads.py` |
| Depende de | GeminiClient ou OmniRouteClient |
| Segurança | Nunca escreve em disco; propostas sempre `aprovada=False` |

---

## Cliente genérico

`core/api_client.py` → `ExternalAPIClient`

Use para qualquer HTTP externo novo:

```python
from core.api_client import ExternalAPIClient

client = ExternalAPIClient(
    name="MEU_SERVICO",
    base_url_env="MEU_SERVICO_URL",
    api_key_env="MEU_SERVICO_KEY",
    capacidades=["busca"],
    require_api_key=True,
)
data = client.get("/v1/search", params={"q": "sousa"})
```

---

## Status em runtime

```
GET /apis/status
```

Retorna JSON com cada integração e se está ativa/configurada.

---

## Roadmap sugerido

| Prioridade | API | Motivo |
|------------|-----|--------|
| Alta | WhatsApp / Telegram Bot | Canal de entrada do usuário |
| Alta | Piper TTS completo | Voz planejada no núcleo |
| Média | Google Calendar / Gmail | Agenda e e-mail do fundador |
| Média | Search (Tavily/SerpAPI) | Grounding em tempo real |
| Baixa | Stripe | Monetização futura |

---

## Variáveis de ambiente (.env)

```bash
# Obrigatória para Gemini
GEMINI_API_KEY=

# OmniRoute (opcional, prioridade $0)
OMNIROUTE_BASE_URL=http://localhost:20128
OMNIROUTE_API_KEY=local
OMNIROUTE_MODEL=auto/cheap

# TTS Piper (opcional)
PIPER_BIN=piper
PIPER_MODEL=/caminho/para/pt_BR-model.onnx
TTS_VOICE=pt_BR

# Servidor
PORT=5000
FLASK_DEBUG=false
```
