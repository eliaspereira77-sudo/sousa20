"""
SOUSA 2.0 - Modulo ADS
=======================
Capacidade do SOUSA 2.0 de diagnosticar problemas no proprio codigo e
propor correcao via LLM.

Principios (Contrato de Soberania):
- Nunca escreve em disco sozinho.
- Nunca commita/aplica nada sozinho.
- Toda PropostaDeCorrecao nasce com aprovada=False.
- Valida a estrutura da resposta do LLM antes de aceitar qualquer coisa.
- Registra-se como USB (pode_alterar_nucleo=False).
"""

from dataclasses import dataclass, field
from typing import Optional
import json
import re


NIVEIS_RISCO_VALIDOS = {"baixo", "medio", "alto"}


@dataclass
class PropostaDeCorrecao:
    """
    Representa uma sugestao de correcao gerada pelo Modulo ADS.
    Nasce sempre nao-aprovada. Quem aprova/aplica e outra camada
    (futuro SOUSAILEON), nunca o proprio Modulo ADS.
    """
    arquivo: str
    problema: str
    correcao_sugerida: str
    risco: str
    justificativa: str
    aprovada: bool = field(default=False, init=False)

    def __post_init__(self):
        # trava de seguranca: mesmo que alguem tente instanciar com
        # aprovada=True por engano, forcamos False aqui.
        self.aprovada = False


class ErroRespostaLLM(Exception):
    """Levantado quando a resposta do LLM nao tem a estrutura esperada."""
    pass


class ModuloADS:
    """
    Analista de Sistemas, Desenvolvedor, Arquiteto, Cientista da
    Computacao, Professor de ADS, Gestor da Memoria Tecnica, Editor -
    o especialista tecnico/cientifico/editorial do SOUSA 2.0.

    O SOUSA IA coordena; o Modulo ADS executa a analise.
    """

    def __init__(self, cliente_llm):
        """
        cliente_llm: qualquer objeto com metodo .generate(prompt) -> str
        (ex: GeminiClient, OmniRouteClient - mesma assinatura, drop-in).
        """
        self.cliente_llm = cliente_llm
        self.pode_alterar_nucleo = False  # exigido pelo Contrato de Soberania

    def registrar_como_usb(self, contrato_soberania):
        """
        Registra o Modulo ADS no Contrato de Soberania como uma USB,
        seguindo o mesmo padrao do RUFLO e do OmniRoute.
        """
        contrato_soberania.registrar_usb(
            nome="ModuloADS",
            pode_alterar_nucleo=self.pode_alterar_nucleo,
        )

    def diagnosticar(self, codigo_fonte: str, contexto: Optional[str] = None) -> PropostaDeCorrecao:
        """
        Envia o codigo (e contexto opcional) para o LLM, pede diagnostico
        estruturado em JSON, valida a resposta e devolve uma
        PropostaDeCorrecao (sempre nao-aprovada).

        Levanta ErroRespostaLLM se a resposta nao vier no formato esperado.
        """
        prompt = self._montar_prompt(codigo_fonte, contexto)
        resposta_bruta = self.cliente_llm.generate(prompt)
        dados = self._extrair_json(resposta_bruta)
        self._validar_estrutura(dados)

        return PropostaDeCorrecao(
            arquivo=dados.get("arquivo", "desconhecido"),
            problema=dados["problema"],
            correcao_sugerida=dados["correcao_sugerida"],
            risco=dados["risco"].lower(),
            justificativa=dados.get("justificativa", ""),
        )

    def _montar_prompt(self, codigo_fonte: str, contexto: Optional[str]) -> str:
        contexto_txt = f"\nContexto adicional: {contexto}\n" if contexto else ""
        return (
            "Voce e o Modulo ADS do SOUSA 2.0, um analista/arquiteto de "
            "software. Analise o codigo abaixo e responda SOMENTE com um "
            "JSON valido (sem markdown, sem texto ao redor), com exatamente "
            "estes campos: arquivo, problema, correcao_sugerida, risco "
            "(baixo|medio|alto), justificativa.\n"
            f"{contexto_txt}\n"
            f"Codigo:\n{codigo_fonte}\n"
        )

    def _extrair_json(self, resposta_bruta: str) -> dict:
        """
        Extrai um objeto JSON de dentro da resposta do LLM, mesmo que
        venha cercado de markdown (```json ... ```) ou texto solto.
        """
        if not resposta_bruta or not resposta_bruta.strip():
            raise ErroRespostaLLM("Resposta do LLM veio vazia.")

        texto = resposta_bruta.strip()

        # tenta parse direto primeiro
        try:
            return json.loads(texto)
        except json.JSONDecodeError:
            pass

        # tenta extrair de dentro de blocos de markdown ou texto solto
        match = re.search(r"\{.*\}", texto, re.DOTALL)
        if not match:
            raise ErroRespostaLLM(
                "Nao foi possivel localizar um JSON na resposta do LLM."
            )

        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError as exc:
            raise ErroRespostaLLM(f"JSON encontrado mas invalido: {exc}") from exc

    def _validar_estrutura(self, dados: dict) -> None:
        campos_obrigatorios = ["problema", "correcao_sugerida", "risco"]
        for campo in campos_obrigatorios:
            valor = dados.get(campo)
            if not valor or not str(valor).strip():
                raise ErroRespostaLLM(f"Campo obrigatorio ausente ou vazio: '{campo}'")

        risco = str(dados["risco"]).lower()
        if risco not in NIVEIS_RISCO_VALIDOS:
            raise ErroRespostaLLM(
                f"Valor de risco invalido: '{dados['risco']}'. "
                f"Esperado um de: {sorted(NIVEIS_RISCO_VALIDOS)}"
            )
