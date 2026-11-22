# REPO WIKI — sousa_qoder
_Gerado automaticamente pelo SOUSA-QODER em 2026-11-12 09:57 UTC (Regra 0800)_

## Visão Geral da Arquitetura
- **Arquivos indexados:** 11
- **Total de linhas:** 900
- **Violação MAX_LINES (350):** 0 (Nenhuma)

## Mapa de Módulos e Símbolos
| Arquivo | Linguagem | Linhas | Símbolos Principais | Dependências |
| :--- | :---: | :---: | :--- | :--- |
| `REPO_WIKI.md` | md | 21 | — | — |
| `__init__.py` | py | 4 | — | — |
| `ads_qoder_bridge.py` | py | 38 | AgenteADSQoderBridge, __init__, diagnosticar_arquitetura, executar_quest_spec, mapear_projeto, preparar_edicao_segura | modes, typing |
| `checkpoint_guard.py` | py | 99 | CheckpointGuard, __init__, audit_file, create_checkpoint, revert | ast, datetime, hashlib, json, pathlib |
| `cli.py` | py | 72 | build_parser, main | argparse, json, modes, pathlib, sys |
| `model_router.py` | py | 54 | ModelTier, route_task | dataclasses, typing |
| `modes.py` | py | 120 | ActionStep, QuestSpec, SousaQoderEngine, __init__, agent_mode, ask_mode | checkpoint_guard, dataclasses, datetime, model_router, pathlib |
| `repo_wiki.py` | py | 137 | ModuleInfo, RepoWikiEngine, __init__, _analyze_file, build_markdown, query | ast, dataclasses, datetime, os, pathlib |
| `self_evolution.py` | py | 124 | AutoEvolutionEngine, PropostaDeEvolucao, __init__, autorizar_soberano, escanear_oportunidades, exportar_manifesto_instalador | checkpoint_guard, dataclasses, datetime, json, pathlib |
| `usinagem_soldagem.py` | py | 145 | CaoDeGuardaSeguranca, DiagnosticoUsinagem, MecanicoFaxineiro, MonitorDeSintaxe, UsinagemAutosoldagemEngine, __init__ | ast, checkpoint_guard, dataclasses, pathlib, re |
| `tests/test_sousa_qoder.py` | py | 86 | TestSousaQoder, setUp, tearDown, test_agent_mode_checkpoint_and_revert, test_quest_mode_and_cli, test_repo_wiki_and_ask_mode | artifacts.sousa_qoder.cli, artifacts.sousa_qoder.modes, artifacts.sousa_qoder.self_evolution, artifacts.sousa_qoder.usinagem_soldagem, pathlib |
