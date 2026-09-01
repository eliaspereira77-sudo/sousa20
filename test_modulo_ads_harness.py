"""
Harness de teste do Modulo ADS - 10 casos.
Roda sem framework externo: python test_modulo_ads_harness.py
"""

from core.modulo_ads import ModuloADS, PropostaDeCorrecao, ErroRespostaLLM


class LLMFalso:
    """Cliente LLM fake, so devolve o que a gente configurar."""
    def __init__(self, resposta):
        self.resposta = resposta

    def generate(self, prompt):
        return self.resposta


class ContratoSoberaniaFalso:
    """Contrato de Soberania fake, so registra chamadas."""
    def __init__(self):
        self.usbs_registradas = []

    def registrar_usb(self, nome, pode_alterar_nucleo):
        self.usbs_registradas.append((nome, pode_alterar_nucleo))


RESPOSTA_BOA = """{
    "arquivo": "core/exemplo.py",
    "problema": "Funcao nao trata excecao de rede.",
    "correcao_sugerida": "Adicionar try/except em torno da chamada HTTP.",
    "risco": "medio",
    "justificativa": "Erro de rede poderia derrubar o processo inteiro."
}"""

RESPOSTA_COM_MARKDOWN = """
Aqui esta minha analise:

```json
{
    "arquivo": "core/exemplo.py",
    "problema": "Variavel nao inicializada.",
    "correcao_sugerida": "Inicializar a variavel antes do loop.",
    "risco": "baixo",
    "justificativa": "Pode gerar NameError em certos caminhos de execucao."
}
```

Espero que ajude.
"""

RESPOSTA_SEM_JSON = "Desculpe, nao consegui analisar o codigo fornecido."

RESPOSTA_CAMPO_VAZIO = """{
    "arquivo": "core/exemplo.py",
    "problema": "",
    "correcao_sugerida": "Adicionar validacao.",
    "risco": "alto",
    "justificativa": "N/A"
}"""

RESPOSTA_RISCO_INVALIDO = """{
    "arquivo": "core/exemplo.py",
    "problema": "Loop infinito em condicao rara.",
    "correcao_sugerida": "Adicionar condicao de parada.",
    "risco": "critico",
    "justificativa": "Risco nao esta na lista permitida."
}"""

RESPOSTA_VAZIA = ""

RESPOSTA_JSON_QUEBRADO = """{
    "arquivo": "core/exemplo.py",
    "problema": "Faltou fechar chave"
"""

RESPOSTA_SEM_CORRECAO_SUGERIDA = """{
    "arquivo": "core/exemplo.py",
    "problema": "Falha de seguranca.",
    "risco": "alto",
    "justificativa": "Campo correcao_sugerida ausente."
}"""

RESPOSTA_RISCO_MAIUSCULO = """{
    "arquivo": "core/exemplo.py",
    "problema": "Uso de biblioteca depreciada.",
    "correcao_sugerida": "Trocar pela biblioteca nova.",
    "risco": "MEDIO",
    "justificativa": "Deve normalizar para minusculo."
}"""


resultados = []


def teste(nome):
    def decorator(func):
        def wrapper():
            try:
                func()
                resultados.append((nome, True, None))
            except AssertionError as e:
                resultados.append((nome, False, str(e)))
            except Exception as e:
                resultados.append((nome, False, f"Excecao inesperada: {e}"))
        return wrapper
    return decorator


@teste("1) Resposta boa gera PropostaDeCorrecao valida e nao-aprovada")
def teste_resposta_boa():
    ads = ModuloADS(LLMFalso(RESPOSTA_BOA))
    proposta = ads.diagnosticar("codigo qualquer")
    assert isinstance(proposta, PropostaDeCorrecao)
    assert proposta.aprovada is False
    assert proposta.risco == "medio"
    assert proposta.arquivo == "core/exemplo.py"


@teste("2) Resposta com markdown ao redor do JSON e extraida corretamente")
def teste_resposta_com_markdown():
    ads = ModuloADS(LLMFalso(RESPOSTA_COM_MARKDOWN))
    proposta = ads.diagnosticar("codigo qualquer")
    assert proposta.risco == "baixo"
    assert "Inicializar" in proposta.correcao_sugerida


@teste("3) Resposta sem JSON nenhum levanta ErroRespostaLLM")
def teste_resposta_sem_json():
    ads = ModuloADS(LLMFalso(RESPOSTA_SEM_JSON))
    try:
        ads.diagnosticar("codigo qualquer")
        assert False, "deveria ter levantado ErroRespostaLLM"
    except ErroRespostaLLM:
        pass


@teste("4) Campo obrigatorio vazio levanta ErroRespostaLLM")
def teste_campo_vazio():
    ads = ModuloADS(LLMFalso(RESPOSTA_CAMPO_VAZIO))
    try:
        ads.diagnosticar("codigo qualquer")
        assert False, "deveria ter levantado ErroRespostaLLM"
    except ErroRespostaLLM:
        pass


@teste("5) Valor de risco invalido levanta ErroRespostaLLM")
def teste_risco_invalido():
    ads = ModuloADS(LLMFalso(RESPOSTA_RISCO_INVALIDO))
    try:
        ads.diagnosticar("codigo qualquer")
        assert False, "deveria ter levantado ErroRespostaLLM"
    except ErroRespostaLLM:
        pass


@teste("6) Registro como USB no Contrato de Soberania")
def teste_registro_usb():
    ads = ModuloADS(LLMFalso(RESPOSTA_BOA))
    contrato = ContratoSoberaniaFalso()
    ads.registrar_como_usb(contrato)
    assert ("ModuloADS", False) in contrato.usbs_registradas


@teste("7) Resposta vazia levanta ErroRespostaLLM")
def teste_resposta_vazia():
    ads = ModuloADS(LLMFalso(RESPOSTA_VAZIA))
    try:
        ads.diagnosticar("codigo qualquer")
        assert False, "deveria ter levantado ErroRespostaLLM"
    except ErroRespostaLLM:
        pass


@teste("8) JSON quebrado/incompleto levanta ErroRespostaLLM")
def teste_json_quebrado():
    ads = ModuloADS(LLMFalso(RESPOSTA_JSON_QUEBRADO))
    try:
        ads.diagnosticar("codigo qualquer")
        assert False, "deveria ter levantado ErroRespostaLLM"
    except ErroRespostaLLM:
        pass


@teste("9) Campo correcao_sugerida ausente levanta ErroRespostaLLM")
def teste_campo_ausente():
    ads = ModuloADS(LLMFalso(RESPOSTA_SEM_CORRECAO_SUGERIDA))
    try:
        ads.diagnosticar("codigo qualquer")
        assert False, "deveria ter levantado ErroRespostaLLM"
    except ErroRespostaLLM:
        pass


@teste("10) Risco em maiusculo e normalizado para minusculo")
def teste_risco_maiusculo():
    ads = ModuloADS(LLMFalso(RESPOSTA_RISCO_MAIUSCULO))
    proposta = ads.diagnosticar("codigo qualquer")
    assert proposta.risco == "medio"


def rodar_todos():
    testes = [
        teste_resposta_boa,
        teste_resposta_com_markdown,
        teste_resposta_sem_json,
        teste_campo_vazio,
        teste_risco_invalido,
        teste_registro_usb,
        teste_resposta_vazia,
        teste_json_quebrado,
        teste_campo_ausente,
        teste_risco_maiusculo,
    ]
    for t in testes:
        t()

    passou = sum(1 for _, ok, _ in resultados if ok)
    total = len(resultados)

    print(f"\n=== Harness Modulo ADS: {passou}/{total} passou ===\n")
    for nome, ok, erro in resultados:
        status = "OK" if ok else "FALHA"
        print(f"[{status}] {nome}")
        if not ok:
            print(f"        motivo: {erro}")

    if passou != total:
        raise SystemExit(1)


if __name__ == "__main__":
    rodar_todos()
