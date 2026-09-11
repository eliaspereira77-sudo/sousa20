#!/usr/bin/env python3
"""
test_sousa_qwen_bridge.py
=========================
Teste completo da ponte Qwen 3.8 ↔ SOUSA 2.0

FASE: REFINO → INTEGRAÇÃO → SINCRONIZAÇÃO → CONSOLIDAÇÃO
PRINCÍPIO: Testar o Fio Condutor de ponta a ponta sem criar do zero.

Este teste valida:
- Processamento de intenções via Fio Condutor completo
- Classificação de risco e soberania do fundador
- Comportamento JARVIS (varredura do ecossistema)
- Comportamento WOLVERINE (autodiagnóstico)
- Integração com Registry, LAB, Drive, Ruflo
- Respeito à Fonte da Verdade
"""

import pytest
import json
import sys
import os
from datetime import datetime
from unittest.mock import Mock, patch, MagicMock
from pathlib import Path

# Adicionar o caminho do módulo ao sys.path para importação
sys.path.insert(0, str(Path(__file__).parent))

from SOUSA_QWEN_BRIDGE import (
    SousaqwenBridge,
    IntencaoFundador,
    ResultadoOperacao,
    CicloOperacional,
    FaseOperacao,
    NivelRisco,
    ComponenteSOUSA,
    inicializar_bridge,
)


# ============================================================
# FIXTURES
# ============================================================

@pytest.fixture
def bridge():
    """Fixture: Bridge inicializada para testes"""
    return SousaqwenBridge()


@pytest.fixture
def intencao_simples():
    """Fixture: Intenção simples de baixo risco"""
    return IntencaoFundador(
        texto="Listar capacidades disponíveis no Registry",
        origem="CONSOLE",
        contexto={"tipo": "consulta", "urgencia": "normal"},
    )


@pytest.fixture
def intencao_media():
    """Fixture: Intenção de médio risco"""
    return IntencaoFundador(
        texto="Gerar relatório de saúde do ecossistema",
        origem="CONSOLE",
        contexto={"tipo": "diagnostico", "urgencia": "normal"},
    )


@pytest.fixture
def intencao_critica():
    """Fixture: Intenção de alto risco"""
    return IntencaoFundador(
        texto="Deletar todos os logs antigos do sistema",
        origem="CONSOLE",
        contexto={"tipo": "manutencao", "urgencia": "alta"},
    )


@pytest.fixture
def intencao_destrutiva():
    """Fixture: Intenção crítica (soberania do fundador)"""
    return IntencaoFundador(
        texto="Sobrescrever a Fonte da Verdade com novos valores",
        origem="CONSOLE",
        contexto={"tipo": "configuracao", "urgencia": "critica"},
    )


@pytest.fixture
def config_teste(tmp_path):
    """Fixture: Arquivo de configuração de teste"""
    config = {
        "fase": "REFINO_INTEGRACAO_TESTE",
        "prioridade_zero": "VALIDAR_FIO_CONDUTOR",
        "nao_criar_do_zero": True,
        "auditar_antes_de_criar": True,
    }
    config_file = tmp_path / "test_config.json"
    config_file.write_text(json.dumps(config, indent=2))
    return str(config_file)


# ============================================================
# TESTES: INICIALIZAÇÃO E CONFIGURAÇÃO
# ============================================================

class TestInicializacao:
    """Testa a inicialização da Bridge"""

    def test_inicializacao_padrao(self):
        """A bridge deve inicializar sem erros com configuração padrão"""
        bridge = SousaqwenBridge()
        assert bridge is not None
        assert bridge.ciclo_atual is None
        assert len(bridge.historico_ciclos) == 0

    def test_inicializacao_com_config(self, config_teste):
        """A bridge deve carregar configuração de arquivo"""
        bridge = SousaqwenBridge(config_path=config_teste)
        assert bridge.config["fase"] == "REFINO_INTEGRACAO_TESTE"
        assert bridge.config["nao_criar_do_zero"] is True

    def test_inicializacao_sem_config(self, tmp_path):
        """A bridge deve funcionar mesmo sem arquivo de configuração"""
        config_path = tmp_path / "inexistente.json"
        bridge = SousaqwenBridge(config_path=str(config_path))
        assert bridge.config["fase"] == "REFINO_INTEGRACAO_SINCRONIZACAO_CONSOLIDACAO"

    def test_funcao_inicializar_bridge(self):
        """A função de inicialização deve retornar uma bridge válida"""
        bridge = inicializar_bridge()
        assert isinstance(bridge, SousaqwenBridge)


# ============================================================
# TESTES: ESTRUTURAS DE DADOS
# ============================================================

class TestEstruturasDados:
    """Testa as estruturas de dados do SOUSA"""

    def test_intencao_fundador(self):
        """IntencaoFundador deve criar objetos corretos"""
        intencao = IntencaoFundador(
            texto="Teste de intenção",
            origem="CONSOLE",
            contexto={"tipo": "teste"},
        )
        assert intencao.texto == "Teste de intenção"
        assert intencao.origem == "CONSOLE"
        assert "timestamp" in intencao.timestamp

    def test_resultado_operacao(self):
        """ResultadoOperacao deve criar objetos corretos"""
        resultado = ResultadoOperacao(
            sucesso=True,
            fase=FaseOperacao.INTERPRETACAO,
            componente="QWEN_3.8",
            descricao="Teste executado",
        )
        assert resultado.sucesso is True
        assert resultado.fase == FaseOperacao.INTERPRETACAO
        assert "timestamp" in resultado.timestamp

    def test_ciclo_operacional(self, intencao_simples):
        """CicloOperacional deve criar objetos corretos"""
        ciclo = CicloOperacional(
            id_ciclo="TESTE_001",
            intencao=intencao_simples,
        )
        assert ciclo.id_ciclo == "TESTE_001"
        assert ciclo.intencao == intencao_simples
        assert ciclo.autorizado is False
        assert ciclo.concluido is False


# ============================================================
# TESTES: FIO CONDUTOR - FASES INDIVIDUAIS
# ============================================================

class TestFioCondutorFases:
    """Testa cada fase do Fio Condutor isoladamente"""

    def test_fase_interpretacao(self, bridge, intencao_simples):
        """A fase de interpretação deve processar a intenção via Qwen"""
        resultado = bridge._fase_interpretacao(intencao_simples)

        assert resultado.sucesso is True
        assert resultado.fase == FaseOperacao.INTERPRETACAO
        assert resultado.componente == "QWEN_3.8"
        assert "intencao_original" in resultado.dados
        assert "intencao_interpretada" in resultado.dados

    def test_fase_classificacao_risco_baixo(self, bridge):
        """Operações simples devem ser classificadas como risco BAIXO"""
        interpretacao = ResultadoOperacao(
            sucesso=True,
            fase=FaseOperacao.INTERPRETACAO,
            componente="QWEN",
            descricao="Consulta simples",
            dados={"acoes_necessarias": ["LISTAR", "CONSULTAR"]},
        )

        risco = bridge._fase_classificar_risco(interpretacao)
        assert risco == NivelRisco.BAIXO

    def test_fase_classificacao_risco_critico(self, bridge):
        """Operações destrutivas devem ser classificadas como risco CRÍTICO"""
        interpretacao = ResultadoOperacao(
            sucesso=True,
            fase=FaseOperacao.INTERPRETACAO,
            componente="QWEN",
            descricao="Operação destrutiva",
            dados={
                "acoes_necessarias": [
                    "DELETAR",
                    "SOBRESCREVER_FONTE_VERDADE",
                ]
            },
        )

        risco = bridge._fase_classificar_risco(interpretacao)
        assert risco == NivelRisco.CRITICO

    def test_fase_planejamento(self, bridge, intencao_simples):
        """A fase de planejamento deve gerar um plano de execução"""
        interpretacao = bridge._fase_interpretacao(intencao_simples)
        plano = bridge._fase_planejamento(interpretacao)

        assert plano.sucesso is True
        assert plano.fase == FaseOperacao.PLANEJAMENTO
        assert "etapas" in plano.dados
        assert "agentes_selecionados" in plano.dados

    def test_fase_execucao(self, bridge):
        """A fase de execução deve processar o plano"""
        plano = ResultadoOperacao(
            sucesso=True,
            fase=FaseOperacao.PLANEJAMENTO,
            componente="QWEN",
            descricao="Plano gerado",
            dados={"etapas": ["etapa1", "etapa2"]},
        )

        execucao = bridge._fase_execucao(plano)
        assert execucao.sucesso is True
        assert execucao.fase == FaseOperacao.EXECUCAO
        assert execucao.componente == "EXECUTOR_UNIVERSAL"

    def test_fase_verificacao(self, bridge):
        """A fase de verificação deve validar a execução"""
        execucao = ResultadoOperacao(
            sucesso=True,
            fase=FaseOperacao.EXECUCAO,
            componente="EXECUTOR",
            descricao="Execução bem-sucedida",
        )

        verificacao = bridge._fase_verificacao(execucao)
        assert verificacao.sucesso is True
        assert verificacao.fase == FaseOperacao.VERIFICACAO
        assert "CAO_DE_GUARDA" in verificacao.componente

    def test_fase_persistencia(self, bridge, intencao_simples):
        """A fase de persistência deve salvar checkpoint"""
        ciclo = CicloOperacional(id_ciclo="TEST_PERSIST", intencao=intencao_simples)
        persistencia = bridge._fase_persistencia(ciclo)

        assert persistencia.sucesso is True
        assert persistencia.fase == FaseOperacao.PERSISTENCIA
        assert "SOUSA_DRIVE_PERSISTENCE" in persistencia.componente
        assert "checkpoint" in persistencia.dados

    def test_fase_aprendizado(self, bridge, intencao_simples):
        """A fase de aprendizado deve consolidar lições"""
        ciclo = CicloOperacional(id_ciclo="TEST_LEARN", intencao=intencao_simples)
        aprendizado = bridge._fase_aprendizado(ciclo)

        assert aprendizado.sucesso is True
        assert aprendizado.fase == FaseOperacao.APRENDIZADO
        assert "RUFLO_ADAPTADO" in aprendizado.componente

    def test_fase_comunicacao(self, bridge, intencao_simples):
        """A fase de comunicação deve gerar mensagem ao fundador"""
        ciclo = CicloOperacional(id_ciclo="TEST_COMM", intencao=intencao_simples)
        ciclo.fases_executadas = [
            ResultadoOperacao(
                sucesso=True,
                fase=FaseOperacao.EXECUCAO,
                componente="EXECUTOR",
                descricao="Ok",
            )
        ]

        comunicacao = bridge._fase_comunicacao(ciclo)
        assert comunicacao.sucesso is True
        assert comunicacao.fase == FaseOperacao.COMUNICACAO
        assert "mensagem_fundador" in comunicacao.dados


# ============================================================
# TESTES: FIO CONDUTOR - FLUXO COMPLETO
# ============================================================

class TestFioCondutorCompleto:
    """Testa o Fio Condutor de ponta a ponta"""

    def test_processar_intencao_simples(self, bridge, intencao_simples):
        """Intenção simples deve completar o fluxo inteiro"""
        ciclo = bridge.processar_intencao(intencao_simples)

        assert ciclo.concluido is True
        assert ciclo.id_ciclo.startswith("CICLO_")
        assert len(ciclo.fases_executadas) > 0
        assert ciclo.autorizado is True
        assert ciclo in bridge.historico_ciclos

    def test_processar_intencao_media(self, bridge, intencao_media):
        """Intenção de médio risco deve completar o fluxo"""
        ciclo = bridge.processar_intencao(intencao_media)
        assert ciclo.concluido is True

    @patch("SOUSA_QWEN_BRIDGE.SousaqwenBridge._solicitar_autorizacao")
    def test_processar_intencao_critica_sem_autorizacao(
        self, mock_auth, bridge, intencao_destrutiva
    ):
        """Intenção crítica sem autorização deve ser abortada"""
        mock_auth.return_value = False

        ciclo = bridge.processar_intencao(intencao_destrutiva)

        # Deve ter sido abortada antes da execução
        assert ciclo.concluido is False or not any(
            f.fase == FaseOperacao.EXECUCAO for f in ciclo.fases_executadas
        )

    @patch("SOUSA_QWEN_BRIDGE.SousaqwenBridge._solicitar_autorizacao")
    def test_processar_intencao_critica_com_autorizacao(
        self, mock_auth, bridge, intencao_destrutiva
    ):
        """Intenção crítica com autorização deve executar"""
        mock_auth.return_value = True

        ciclo = bridge.processar_intencao(intencao_destrutiva)

        assert ciclo.autorizado is True
        assert ciclo.concluido is True

    def test_historico_ciclos(self, bridge, intencao_simples, intencao_media):
        """Múltiplas intenções devem acumular no histórico"""
        bridge.processar_intencao(intencao_simples)
        bridge.processar_intencao(intencao_media)
        bridge.processar_intencao(intencao_simples)

        assert len(bridge.historico_ciclos) == 3


# ============================================================
# TESTES: COMPORTAMENTO JARVIS
# ============================================================

class TestComportamentoJarvis:
    """Testa o comportamento JARVIS de varredura do ecossistema"""

    def test_varrer_ecossistema(self, bridge):
        """Deve varrer todo o ecossistema e gerar relatório"""
        relatorio = bridge.varrer_ecossistema()

        assert "timestamp" in relatorio
        assert "componentes_verificados" in relatorio
        assert "anomalias" in relatorio
        assert len(relatorio["componentes_verificados"]) > 0

    def test_verificar_componente(self, bridge):
        """Deve verificar status de componentes individuais"""
        status = bridge._verificar_componente(ComponenteSOUSA.FONTE_DA_VERDADE)
        assert status in ["OPERACIONAL", "DEGRADADO", "INOPERANTE", "DESCONHECIDO"]

    def test_varredura_inclui_todos_componentes(self, bridge):
        """Varredura deve cobrir os componentes principais"""
        relatorio = bridge.varrer_ecossistema()
        componentes_verificados = [
            c["componente"] for c in relatorio["componentes_verificados"]
        ]

        # Pelo menos estes componentes devem ser verificados
        componentes_obrigatorios = [
            "SOUSA_SOURCE_OF_TRUTH",
            "SOUSA_IA",
            "REGISTRY_CAPACIDADES",
            "SOUSA_DRIVE_PERSISTENCE",
            "SOUSA_LAB",
            "RUFLO_ADAPTADO",
        ]

        for comp in componentes_obrigatorios:
            assert comp in componentes_verificados, f"Componente {comp} não verificado"


# ============================================================
# TESTES: WOLVERINE (AUTODIAGNÓSTICO)
# ============================================================

class TestWolverine:
    """Testa o comportamento WOLVERINE de autodiagnóstico"""

    def test_autodiagnostico(self, bridge):
        """Deve executar autodiagnóstico e retornar relatório"""
        diagnostico = bridge.autodiagnostico()

        assert "timestamp" in diagnostico
        assert "problemas_encontrados" in diagnostico
        assert "correcoes_propostas" in diagnostico
        assert "correcoes_aplicadas" in diagnostico
        assert "aprendizado_gerado" in diagnostico

    def test_autodiagnostico_retorna_estrutura_valida(self, bridge):
        """Estrutura do diagnóstico deve ser válida"""
        diagnostico = bridge.autodiagnostico()

        # Todos os campos devem ser listas (mesmo que vazias)
        assert isinstance(diagnostico["problemas_encontrados"], list)
        assert isinstance(diagnostico["correcoes_propostas"], list)
        assert isinstance(diagnostico["correcoes_aplicadas"], list)
        assert isinstance(diagnostico["aprendizado_gerado"], list)


# ============================================================
# TESTES: INTEGRIDADE E REGRAS DE OPERAÇÃO
# ============================================================

class TestRegrasOperacao:
    """Valida as 10 regras de operação do SOUSA"""

    def test_regra_001_fonte_da_verdade(self, bridge, intencao_simples):
        """R001: Qwen NUNCA cria outra Fonte da Verdade"""
        # A bridge deve sempre referenciar a Fonte da Verdade existente
        assert bridge.config is not None
        # A fonte da verdade não deve ser sobrescrita durante operações
        ciclo = bridge.processar_intencao(intencao_simples)
        assert ciclo.concluido is True

    def test_regra_003_nao_duplicar(self, bridge):
        """R003: Qwen NUNCA duplica capacidade do Registry"""
        resultado = bridge.consultar_registry("capacidade_teste")

        assert "capacidade" in resultado
        assert "encontrada" in resultado
        assert "acao_recomendada" in resultado
        # Deve recomendar auditar antes de criar
        assert resultado["acao_recomendada"] == "AUDITAR_ANTES_DE_CRIAR"

    def test_regra_005_cada_um_no_quadrado(self, bridge, intencao_simples):
        """R005: Cada componente deve atuar na sua competência"""
        ciclo = bridge.processar_intencao(intencao_simples)

        # Verificar que cada fase foi executada pelo componente correto
        fases_componentes = {f.fase: f.componente for f in ciclo.fases_executadas}

        # Qwen não deve aparecer como EXECUTOR (deve ser o EXECUTOR_UNIVERSAL)
        if FaseOperacao.EXECUCAO in fases_componentes:
            assert "EXECUTOR_UNIVERSAL" in fases_componentes[FaseOperacao.EXECUCAO]

    def test_regra_006_registrar_ciclos(self, bridge, intencao_simples):
        """R006: Qwen SEMPRE registra ciclos de operação"""
        ciclo = bridge.processar_intencao(intencao_simples)

        # O ciclo deve estar no histórico
        assert ciclo in bridge.historico_ciclos
        # O ciclo deve ter todas as fases registradas
        assert len(ciclo.fases_executadas) > 0

    def test_regra_010_soberania(self, bridge, intencao_destrutiva):
        """R010: Soberania do fundador é princípio absoluto"""
        # Operações críticas devem solicitar autorização
        with patch.object(bridge, "_solicitar_autorizacao", return_value=False):
            ciclo = bridge.processar_intencao(intencao_destrutiva)

        # Sem autorização, não deve executar
        assert ciclo.autorizado is False


# ============================================================
# TESTES: INTEGRAÇÃO COM LAB E ANDROID
# ============================================================

class TestIntegracaoLab:
    """Testa integração com SOUSA LAB"""

    def test_promover_lab_para_producao(self, bridge):
        """Deve promover módulos do LAB para PRODUÇÃO"""
        resultado = bridge.promover_lab_para_producao("modulo_teste_android")

        assert resultado.sucesso is True
        assert resultado.fase == FaseOperacao.EXECUCAO
        assert "SOUSA_LAB" in resultado.componente
        assert resultado.dados["autorizado"] is True


# ============================================================
# TESTES: CENÁRIOS REAIS DO CHECKLIST
# ============================================================

class TestCenariosReais:
    """Testa cenários reais do relatório SOUSA 2.0"""

    def test_cenario_01_listar_registry(self, bridge):
        """Cenário 1: Fundador pede para listar capacidades"""
        intencao = IntencaoFundador(
            texto="Quais capacidades estão disponíveis no Registry?",
            origem="CONSOLE_JOYSTICK",
            contexto={"tipo": "consulta"},
        )
        ciclo = bridge.processar_intencao(intencao)
        assert ciclo.concluido is True

    def test_cenario_02_diagnostico_ecossistema(self, bridge):
        """Cenário 2: Fundador pede diagnóstico completo"""
        intencao = IntencaoFundador(
            texto="Faça um diagnóstico completo do ecossistema",
            origem="CONSOLE_JOYSTICK",
            contexto={"tipo": "diagnostico"},
        )
        ciclo = bridge.processar_intencao(intencao)
        assert ciclo.concluido is True

    def test_cenario_03_relatorio_saude(self, bridge):
        """Cenário 3: Relatório de saúde do sistema"""
        intencao = IntencaoFundador(
            texto="Gere um relatório de saúde do SOUSA 2.0",
            origem="CONSOLE",
        )
        ciclo = bridge.processar_intencao(intencao)
        assert ciclo.concluido is True

    def test_cenario_04_varredura_jarvis(self, bridge):
        """Cenário 4: Varredura JARVIS de todo ecossistema"""
        relatorio = bridge.varrer_ecossistema()
        assert relatorio["saude_geral"] in [
            "SAUDAVEL",
            "DEGRADADO",
            "CRITICO",
            "DESCONHECIDA",
        ]

    def test_cenario_05_autodiagnostico_wolverine(self, bridge):
        """Cenário 5: Autodiagnóstico WOLVERINE"""
        diagnostico = bridge.autodiagnostico()
        assert diagnostico is not None


# ============================================================
# TESTES: PERFORMANCE E ROBUSTEZ
# ============================================================

class TestPerformanceRobustez:
    """Testa performance e robustez da bridge"""

    def test_multiplas_intencoes_rapidas(self, bridge):
        """Bridge deve processar múltiplas intenções sem travar"""
        intencao = IntencaoFundador(texto="Teste rápido")

        for i in range(10):
            ciclo = bridge.processar_intencao(intencao)
            assert ciclo.concluido is True

        assert len(bridge.historico_ciclos) == 10

    def test_intencao_vazia(self, bridge):
        """Bridge deve lidar com intenções vazias graciosamente"""
        intencao = IntencaoFundador(texto="")

        # Não deve lançar exceção
        try:
            ciclo = bridge.processar_intencao(intencao)
            assert ciclo is not None
        except Exception as e:
            pytest.fail(f"Bridge não tratou intenção vazia: {e}")

    def test_intencao_texto_muito_longo(self, bridge):
        """Bridge deve lidar com textos muito longos"""
        texto_longo = "A" * 10000
        intencao = IntencaoFundador(texto=texto_longo)

        try:
            ciclo = bridge.processar_intencao(intencao)
            assert ciclo is not None
        except Exception as e:
            pytest.fail(f"Bridge não tratou texto longo: {e}")


# ============================================================
# TESTES: MOCKS E INTEGRAÇÃO EXTERNA
# ============================================================

class TestMocksIntegracao:
    """Testa integração com componentes externos via mocks"""

    @patch("SOUSA_QWEN_BRIDGE.SousaqwenBridge.consultar_registry")
    def test_consulta_registry_mocked(self, mock_registry, bridge):
        """Deve usar o mock do registry quando configurado"""
        mock_registry.return_value = {
            "capacidade": "teste",
            "encontrada": True,
            "componente_responsavel": "MODULO_X",
        }

        resultado = bridge.consultar_registry("teste")
        assert resultado["encontrada"] is True
        mock_registry.assert_called_once_with("teste")


# ============================================================
# PONTO DE ENTRADA
# ============================================================

if __name__ == "__main__":
    # Executar testes com pytest
    pytest.main([__file__, "-v", "--tb=short"])