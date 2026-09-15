# Agentes LangGraph — SOUSA 2.0

LangGraph atua como orquestrador.
Os agentes especialistas continuam sendo:

- specialist-research
- specialist-code
- specialist-voice
- specialist-desktop

Na etapa EXECUTANDO, o nó execute_node pode:
1. Chamar CrewAI para montar a equipe
2. Delegar para OpenManus
3. Chamar agentes individuais registrados

LangGraph NÃO substitui esses agentes.
Ele coordena a passagem de estado entre eles.