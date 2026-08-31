# SOUSA 2.0 & SOUSA IA — RELEASE PADRÃO NASA (2026)

## Visão Geral
Este pacote contém o ecossistema consolidado **SOUSA 2.0** e a camada de inteligência **SOUSA IA**, desenvolvidos para operação autônoma, modularidade total (*Plug-and-Play USB Digital*), governança de missão crítica (*Zero Resíduo*) e controle soberano Mobile-First.

## Estrutura do Pacote
- `src/`: 33 módulos JavaScript modulares + `SOUSA_Core_2.0_Consolidado_Turbinado.gs` (arquivo único para Apps Script).
- `docs/`: Documentação de arquitetura, manuais, guias e relatório de homologação de engenharia aeroespacial.
- `sousa_cli.py`: CLI em Python de auto-diagnóstico estático, telemetria e sincronização em 1 clique.
- `sousa_meta_installer.sh`: Script shell de acionamento autônomo.

## Instruções de Implantação
1. **Google Apps Script**:
   - Abra seu projeto no GAS.
   - Opção 1: Cole o conteúdo de `src/SOUSA_Core_2.0_Consolidado_Turbinado.gs` em um arquivo de script único.
   - Opção 2: Adicione individualmente os 33 módulos da pasta `src/`.
   - Execute `SOUSA_USB_bootSeguro()` para inicializar o barramento.
2. **Terminal / Local**:
   - Execute `python3 sousa_cli.py --autorizar` para validar todos os módulos e gerar telemetria.
3. **Telegram (SOUSA Connect)**:
   - Use `/status`, `/metricas` ou `/diagnostico` para gerenciar tudo pelo smartphone.
