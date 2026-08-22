# SOUSA 2.0 & SOUSA IA — RELEASE PADRÃO NASA (2026)

## Visão Geral
Este pacote contém o ecossistema consolidado **SOUSA 2.0** + **SOUSA IA**, preparado como release padrão de engenharia (nível missão crítica).

Inclui:
- Núcleo SOUSA IA (DNA, memória, voz, identidade, compositor)
- Camada USB (boot, registry, adapters, persistência, transporte, STT/TTS)
- Orquestrador, política, capacidades, autonomia
- Avatar e canais operacionais
- CLI, painel operacional, instalador e documentação de arquitetura/testes

## Estrutura
```
pacote_oficial/
├── README.md
├── package.json
├── sousa_cli.py
├── sousa_meta_installer.sh
├── SOUSA_2.0_PAINEL_OPERACIONAL.html
├── docs/
│   ├── ARQUITETURA_SOUSA_IA_2.0.md
│   ├── GUIA_INCORPORACAO_E_SINCRONIZACAO.md
│   ├── MANUAL_FERRAMENTAS_E_PLUGINS.md
│   ├── RELATORIO_ENGENHARIA_MISSAO_CRITICA_NASA.md
│   └── RELATORIO_TESTES_E_HOMOLOGACAO.md
└── src/
    ├── SOUSA_*.js (módulos core, USB, IA, avatar, etc.)
    └── SOUSA_Core_2.0_Consolidado_Turbinado.gs
```

Importado do Drive: `SOUSA_2.0_PACOTE_OFICIAL_LIMPO.zip` (14/08/2026).
