# Integração LangGraph — SOUSA 2.0

## Papel
Primary Orchestrator do Ciclo Operacional.

## O que foi integrado
- Contrato de integração
- Mapeamento dos estados do ciclo → nodes LangGraph
- Schema de estado
- Conexão com agentes especialistas já registrados
- Rota primária no OperationalCycle

## O que NÃO foi feito (de propósito)
- Não substitui o núcleo SOUSA
- Não duplica a implementação Ruflo do GitHub
- Não instala dependências pagas
- Não ativa serviços pagos

## Próximo passo natural
Implementar o grafo em Python (quando houver ambiente)
ou conectar os handlers do Ruflo (sousa20) aos nodes definidos aqui.