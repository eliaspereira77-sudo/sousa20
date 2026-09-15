# VALIDADOR UNIVERSAL - SOUSA 2.0

## Principio
EXECUTAR != CONCLUIR (Contrato Executavel Secoes 10, 11, 26)

Nenhuma operacao e declarada COMPLETED sem evidencia real.
Nenhuma aprovacao declarativa e aceita.

## Estados de Verdade
CONFIRMADO | PROVAVEL | NAO_VERIFICADO | BLOQUEADO |
FALHOU | NAO_EXECUTADO | ESTADO_DESCONHECIDO

## Funcoes de Validacao Real
- validarArquivoExiste: fs.existsSync real
- validarSintaxeJS: node --check real
- validarJSON: JSON.parse real
- validarConteudo: busca real no conteudo
- compararEstados: EXPECTED vs ACTUAL real
- verificar(task): orquestra e retorna estado de verdade

## Integracao
- Complementa o GUARDIAO_SOBERANIA
- Guardiao protege QUEM executa (soberania)
- Validador protege COMO se conclui (evidencia)

## Itens do Checklist atendidos
- Item 20: Verificacao obrigatoria
- Item 35: Verificacao pos-execucao

Data: 
2026-09-15
