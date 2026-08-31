# SOUSA 2.0

**Sistema de Inteligência Artificial Pessoal Avançado**  
Ecossistema completo de IA com capacidades internas, externas, multimídia, voz clonada, avatar multilíngue e distribuição global.

---

## Visão

O SOUSA 2.0 é um sistema de IA pessoal de próxima geração projetado para:

- Operar com autonomia operacional real
- Integrar enriquecimento contínuo via **SOUSA IA**
- Possuir camada de orquestração **Ruflo**
- Suportar voz clonada de alta fidelidade
- Gerar e controlar avatares multilíngues
- Distribuir conteúdo e interações em escala global
- Combinar capacidades internas (raciocínio, memória, planejamento) com externas (APIs, ferramentas, agentes)

O objetivo não é apenas um chatbot: é um **sistema operacional de IA pessoal**.

---

## Arquitetura de Alto Nível

```
SOUSA 2.0
├── Camada Core (SOUSA IA)
│   ├── Raciocínio e planejamento
│   ├── Memória de longo prazo (canônica + FTS5)
│   ├── Contrato de Soberania
│   ├── Auditoria de Acesso
│   └── Registro Formal de Capacidades
├── Camada Ruflo (Orquestração)
│   ├── Máquina de estados de ciclo
│   ├── Política de governança
│   ├── Persistência de ciclos
│   └── Handlers plugáveis
├── USB Enriquecimento
│   └── Amplificação de contexto sob soberania
├── Multimídia + Voz + Avatar (planejado)
│   ├── Clonagem de voz
│   ├── Avatar multilíngue
│   └── Geração e streaming de mídia
└── Distribuição Global (planejado)
    ├── Canais (web, mobile, voice, social)
    ├── Publicação automatizada
    └── Sincronização multi-região
```

---

## Status Atual

| Componente              | Status          |
|-------------------------|-----------------|
| Core + Gemini API       | Ativo           |
| Memória Canônica        | Ativo           |
| Soberania + Auditoria   | Ativo           |
| Camada Ruflo            | Ativo           |
| USB Enriquecimento      | Ativo           |
| Registro de Capacidades | Ativo           |
| Voz clonada             | Planejado       |
| Avatar multilíngue      | Planejado       |
| Distribuição global     | Planejado       |

**Versão atual:** `0.3.1-bugfix`

---

## Estrutura do Repositório

```
sousa20/
├── README.md
├── requirements.txt
├── .gitignore
├── app.py                      # Entry point Flask
├── config/
│   └── settings.py
├── core/
│   ├── __init__.py
│   ├── sousa_ia.py             # Núcleo de enriquecimento
│   ├── gemini_client.py
│   ├── memoria.py              # Memória canônica (SQLite + FTS5)
│   ├── soberania.py            # Contrato de soberania
│   ├── auditoria.py            # Auditoria persistente
│   └── registro_capacidades.py
├── ruflo/
│   ├── __init__.py
│   ├── orchestrator.py         # Máquina de estados
│   ├── handlers.py
│   ├── politica.py
│   └── persistencia.py
├── usb/
│   └── enriquecimento.py
├── scripts/
│   └── run_ciclo.py
├── voice/
│   └── clone.py                # Placeholder
├── avatar/
│   └── multilingual.py         # Placeholder
├── distribution/
│   └── global_publish.py       # Placeholder
├── docs/
│   ├── architecture.md
│   ├── GOVERNANCA.md
│   ├── RUFLO.md
│   ├── SOBERANIA.md
│   └── ...
└── data/                       # Runtime (não versionado)
    ├── .gitkeep
    ├── memoria.db
    ├── auditoria.db
    └── ciclos/
```

---

## Início Rápido

```bash
# Clone
git clone https://github.com/eliaspereira77-sudo/sousa20.git
cd sousa20

# Ambiente
python -m venv venv
source venv/bin/activate   # Linux/Mac
# ou
venv\Scripts\activate      # Windows

pip install -r requirements.txt

# Configure a chave Gemini
export GEMINI_API_KEY="sua_chave_aqui"

# Execute a API
python app.py

# Ou execute um ciclo via CLI
python scripts/run_ciclo.py ciclo_padrao --intencao "status do sistema" --json
```

---

## Endpoints principais

| Método | Rota       | Descrição                          |
|--------|------------|------------------------------------|
| GET    | `/`        | Info do sistema                    |
| GET    | `/health`  | Healthcheck                         |
| GET    | `/status`  | Status consolidado                 |
| POST   | `/chat`    | Chat direto via Gemini             |
| POST   | `/ciclo`   | Ciclo completo Ruflo               |
| GET/POST | `/memoria` | Consulta / gravação na memória   |

---

## Roadmap Operacional

1. **Fundação** (concluída) – Estrutura, Gemini, memória, soberania, Ruflo
2. **Estabilização** (atual) – Correção de bugs, testes, alinhamento API
3. **Voz + Avatar** – Clonagem e avatar multilíngue
4. **Distribuição Global** – Publicação e sincronização multi-canal
5. **Autonomia** – Capacidades internas avançadas + auto-melhoria

---

## Princípios de Desenvolvimento

- Preferir caminhos automatizados sempre que existirem
- Quando não existirem, criar o mecanismo
- Avanço operacional > arrumação de arquivos
- Código limpo, modular e documentado
- Tudo deve servir ao objetivo: **fazer o SOUSA 2.0 avançar de verdade**
- O núcleo é soberano; USBs executam sob política

---

**SOUSA 2.0** – Sistema de IA Pessoal de Próxima Geração  
Mantido por [eliaspereira77-sudo](https://github.com/eliaspereira77-sudo)
