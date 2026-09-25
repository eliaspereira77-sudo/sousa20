# SOUSA 2.0 — Produção

Sistema de IA Pessoal Avançado.

## Estrutura oficial (local = nuvem)

```
SOUSA_2.0_PRODUCAO/
├── agentes/          # Agentes e automações
├── config/           # Configurações
├── core/             # Núcleo Python (Gemini, SousaIA, etc.)
│   ├── __init__.py
│   ├── gemini_client.py
│   └── sousa_ia.py
├── docs/             # Documentação
├── estado/           # Estado e memória operacional
├── scripts/          # Scripts auxiliares
├── app.py            # Entry point Flask
├── requirements.txt
├── .env.example
├── regras_nuvem.txt  # Filtros rclone
├── SINCRONIZAR_NUVEM.bat / .sh
└── INICIAR_SOUSA.bat
```

## Sincronização Local ↔ Nuvem

Requisito: [rclone](https://rclone.org) configurado com remote `SOUSA_DRIVE`.

### Windows
```bat
SINCRONIZAR_NUVEM.bat          REM interativo
SINCRONIZAR_NUVEM.bat push     REM local → nuvem
SINCRONIZAR_NUVEM.bat pull     REM nuvem → local
```

### Linux / macOS
```bash
chmod +x SINCRONIZAR_NUVEM.sh
./SINCRONIZAR_NUVEM.sh          # interativo
./SINCRONIZAR_NUVEM.sh push
./SINCRONIZAR_NUVEM.sh pull
```

## Iniciar o sistema

1. Copie `.env.example` → `.env` e preencha `GEMINI_API_KEY`
2. `pip install -r requirements.txt`
3. `python app.py`  
   ou no Windows: `INICIAR_SOUSA.bat`

## Endpoints

| Rota | Descrição |
|------|-----------|
| `GET /` | Status do sistema |
| `GET /health` | Health check |
| `GET /status` | Status detalhado |
| `POST /chat` | Chat (OmniRoute → Gemini fallback) |
| `POST /chat/gemini` | Chat dedicado Gemini (SDK moderno) |

### Exemplo
```bash
curl -X POST http://localhost:5000/chat/gemini \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá SOUSA"}'
```

## Google Cloud

Projeto oficial: **SOUSA ITINGA V2**
