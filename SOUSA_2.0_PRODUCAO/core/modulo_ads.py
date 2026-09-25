"""
SOUSA 2.0 - Módulo ADS
======================
Capacidade de diagnosticar problemas no próprio código e propor correção via LLM.

Princípios (Contrato de Soberania):
- Nunca escreve em disco sozinho.
- Nunca commita/aplica nada sozinho.
- Toda PropostaDeCorrecao nasce com aprovada=False.
- Valida a estrutura da resposta do LLM antes de aceitar.
- Registra-se como USB (pode_alterar_nucleo=False).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Optional
import json
import re


NIVEIS_RISCO_VALIDOS = {"baixo", "medio", "alto"}


@dataclass
class PropostaDeCorrecao:
    """Sugestão de correção gerada pelo Módulo ADS. Sempre nasce não-aprovada."""

    arquivo: str
    problema: str
    correcao_sugerida: str
    risco: str
    justificativa: str
    aprovada: bool = field(default=False, init=False)

    def __post_init__(self):
        self.aprovada = False


class ErroRespostaLLM(Exception):
    """Resposta do LLM fora da estrutura esperada."""


class ModuloADS:
    """
    Analista de Sistemas / Arquiteto do SOUSA 2.0.
    O SOUSA IA coordena; o Módulo ADS executa a análise.
    """

    def __init__(self, cliente_llm: Any):
        """
        cliente_llm: objeto com .generate(prompt) -> str
        (GeminiClient, OmniRouteClient, etc. — mesma assinatura).
        """
        self.cliente_llm = cliente_llm
        self.pode_alterar_nucleo = False

    def registrar_como_usb(self, contrato_soberania) -> dict:
        return contrato_soberania.registrar_usb(
            "MODULO_ADS",
            tipo="analise_codigo",
            descricao="Diagnóstico e proposta de correção de código via LLM",
            capacidades=["diagnostico", "proposta_correcao"],
            pode_alterar_nucleo=False,
        )

    def diagnosticar(
        self, codigo_fonte: str, contexto: Optional[str] = None
    ) -> PropostaDeCorrecao:
        prompt = self._montar_prompt(codigo_fonte, contexto)
        resposta_bruta = self.cliente_llm.generate(prompt)
        dados = self._extrair_json(resposta_bruta)
        self._validar_estrutura(dados)

        return PropostaDeCorrecao(
            arquivo=dados.get("arquivo", "desconhecido"),
            problema=dados["problema"],
            correcao_sugerida=dados["correcao_sugerida"],
            risco=str(dados["risco"]).lower(),
            justificativa=dados.get("justificativa", ""),
        )

    def _montar_prompt(self, codigo_fonte: str, contexto: Optional[str]) -> str:
        contexto_txt = f"\nContexto adicional: {contexto}\n" if contexto else ""
        return (
            "Você é o Módulo ADS do SOUSA 2.0, um analista/arquiteto de software. "
            "Analise o código abaixo e responda SOMENTE com um JSON válido "
            "(sem markdown, sem texto ao redor), com exatamente estes campos: "
            "arquivo, problema, correcao_sugerida, risco (baixo|medio|alto), justificativa.\n"
            f"{contexto_txt}\n"
            f"Código:\n{codigo_fonte}\n"
        )

    def _extrair_json(self, resposta_bruta: str) -> dict:
        if not resposta_bruta or not resposta_bruta.strip():
            raise ErroRespostaLLM("Resposta do LLM veio vazia.")

        texto = resposta_bruta.strip()
        try:
            return json.loads(texto)
        except json.JSONDecodeError:
            pass

        match = re.search(r"\{.*\}", texto, re.DOTALL)
        if not match:
            raise ErroRespostaLLM("Não foi possível localizar um JSON na resposta do LLM.")

        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError as exc:
            raise ErroRespostaLLM(f"JSON encontrado mas inválido: {exc}") from exc

    def _validar_estrutura(self, dados: dict) -> None:
        for campo in ("problema", "correcao_sugerida", "risco"):
            valor = dados.get(campo)
            if not valor or not str(valor).strip():
                raise ErroRespostaLLM(f"Campo obrigatório ausente ou vazio: '{campo}'")

        risco = str(dados["risco"]).lower()
        if risco not in NIVEIS_RISCO_VALIDOS:
            raise ErroRespostaLLM(
                f"Valor de risco inválido: '{dados['risco']}'. "
                f"Esperado um de: {sorted(NIVEIS_RISCO_VALIDOS)}"
            )
