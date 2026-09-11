"""SOUSA_QWEN_BRIDGE.py - Ponte Qwen 3.8 x SOUSA 2.0"""
import json, os, logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from enum import Enum
from dataclasses import dataclass, field

logging.basicConfig(level=logging.INFO, format="%(asctime)s|%(levelname)s|%(message)s")
log = logging.getLogger("SOUSA_QWEN_BRIDGE")

class FaseOperacao(Enum):
    INTENCAO="INTENCAO"; INTERPRETACAO="INTERPRETACAO"; CLASSIFICACAO_RISCO="CLASSIFICACAO_RISCO"
    AUTORIZACAO="AUTORIZACAO"; PLANEJAMENTO="PLANEJAMENTO"; EXECUCAO="EXECUCAO"
    VERIFICACAO="VERIFICACAO"; CORRECAO="CORRECAO"; PERSISTENCIA="PERSISTENCIA"
    APRENDIZADO="APRENDIZADO"; COMUNICACAO="COMUNICACAO"

class NivelRisco(Enum):
    BAIXO="BAIXO"; MEDIO="MEDIO"; ALTO="ALTO"; CRITICO="CRITICO"

@dataclass
class IntencaoFundador:
    texto: str
    origem: str = "CONSOLE"
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    contexto: Dict[str, Any] = field(default_factory=dict)

@dataclass
class ResultadoOperacao:
    sucesso: bool
    fase: FaseOperacao
    componente: str
    descricao: str
    dados: Dict[str, Any] = field(default_factory=dict)
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

@dataclass
class CicloOperacional:
    id_ciclo: str
    intencao: IntencaoFundador
    fases_executadas: List[ResultadoOperacao] = field(default_factory=list)
    risco_classificado: NivelRisco = NivelRisco.BAIXO
    autorizado: bool = False
    concluido: bool = False
    aprendizado: List[str] = field(default_factory=list)

class SousaqwenBridge:
    def __init__(self, config_path=None):
        self.config = self._carregar_config(config_path)
        self.ciclo_atual = None
        self.historico_ciclos = []
        log.info("SOUSA_QWEN_BRIDGE inicializada")

    def _carregar_config(self, p=None):
        if p and os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f: return json.load(f)
        return {"fase":"REFINO_INTEGRACAO","prioridade_zero":"FIO_CONDUTOR","nao_criar_do_zero":True}

    def processar_intencao(self, intencao):
        ciclo = CicloOperacional(id_ciclo=f"CICLO_{datetime.now().strftime('%Y%m%d_%H%M%S')}", intencao=intencao)
        self.ciclo_atual = ciclo
        log.info(f"Intencao: {intencao.texto[:60]}")
        r1 = self._fase_interpretacao(intencao); ciclo.fases_executadas.append(r1)
        risco = self._fase_classificar_risco(r1); ciclo.risco_classificado = risco
        ciclo.fases_executadas.append(ResultadoOperacao(True, FaseOperacao.CLASSIFICACAO_RISCO, "QWEN+CAO_DE_GUARDA", f"Risco: {risco.value}"))
        if risco in (NivelRisco.ALTO, NivelRisco.CRITICO):
            if not self._solicitar_autorizacao(intencao, risco): return ciclo
        ciclo.autorizado = True
        r2 = self._fase_planejamento(r1); ciclo.fases_executadas.append(r2)
        r3 = self._fase_execucao(r2); ciclo.fases_executadas.append(r3)
        r4 = self._fase_verificacao(r3); ciclo.fases_executadas.append(r4)
        r5 = self._fase_persistencia(ciclo); ciclo.fases_executadas.append(r5)
        r6 = self._fase_aprendizado(ciclo); ciclo.fases_executadas.append(r6)
        r7 = self._fase_comunicacao(ciclo); ciclo.fases_executadas.append(r7)
        ciclo.concluido = True
        self.historico_ciclos.append(ciclo)
        log.info(f"Ciclo {ciclo.id_ciclo} concluido")
        return ciclo

    def _fase_interpretacao(self, intencao):
        return ResultadoOperacao(True, FaseOperacao.INTERPRETACAO, "QWEN_3.8", "Intencao interpretada",
            {"intencao_original": intencao.texto, "complexidade": "MEDIA"})

    def _fase_classificar_risco(self, interpretacao):
        acoes = interpretacao.dados.get("acoes_necessarias", [])
        criticas = ["DELETAR","SOBRESCREVER_FONTE_VERDADE","PUBLICAR_EXTERNO","GASTO_FINANCEIRO"]
        for a in acoes:
            if any(c in str(a).upper() for c in criticas): return NivelRisco.CRITICO
        return NivelRisco.BAIXO

    def _solicitar_autorizacao(self, intencao, risco):
        log.warning(f"Autorizacao necessaria (risco: {risco.value})")
        return True

    def _fase_planejamento(self, interpretacao):
        return ResultadoOperacao(True, FaseOperacao.PLANEJAMENTO, "QW
Set-Content -Path "test_sousa_qwen_bridge.py" -Encoding UTF8 -Value @'
"""test_sousa_qwen_bridge.py - Testes da integracao Qwen x SOUSA"""
import pytest, json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from SOUSA_QWEN_BRIDGE import (SousaqwenBridge, IntencaoFundador, ResultadoOperacao,
    CicloOperacional, FaseOperacao, NivelRisco, inicializar_bridge)

@pytest.fixture
def bridge():
    return SousaqwenBridge()

@pytest.fixture
def intencao_simples():
    return IntencaoFundador(texto="Listar capacidades do Registry", origem="CONSOLE")

@pytest.fixture
def intencao_critica():
    return IntencaoFundador(texto="Deletar todos os logs antigos", origem="CONSOLE")

class TestInicializacao:
    def test_bridge_cria(self):
        b = SousaqwenBridge()
        assert b is not None
        assert len(b.historico_ciclos) == 0

    def test_inicializar_bridge(self):
        b = inicializar_bridge()
        assert isinstance(b, SousaqwenBridge)

class TestFioCondutor:
    def test_processar_intencao(self, bridge, intencao_simples):
        ciclo = bridge.processar_intencao(intencao_simples)
        assert ciclo.concluido is True
        assert len(ciclo.fases_executadas) > 0
        assert ciclo.autorizado is True

    def test_historico(self, bridge, intencao_simples):
        bridge.processar_intencao(intencao_simples)
        bridge.processar_intencao(intencao_simples)
        assert len(bridge.historico_ciclos) == 2

    def test_fases_completas(self, bridge, intencao_simples):
        ciclo = bridge.processar_intencao(intencao_simples)
        fases = [f.fase for f in ciclo.fases_executadas]
        assert FaseOperacao.INTERPRETACAO in fases
        assert FaseOperacao.CLASSIFICACAO_RISCO in fases
        assert FaseOperacao.PLANEJAMENTO in fases
        assert FaseOperacao.EXECUCAO in fases
        assert FaseOperacao.VERIFICACAO in fases
        assert FaseOperacao.PERSISTENCIA in fases
        assert FaseOperacao.APRENDIZADO in fases
        assert FaseOperacao.COMUNICACAO in fases

    def test_risco_baixo(self, bridge):
        r = ResultadoOperacao(True, FaseOperacao.INTERPRETACAO, "QWEN", "ok",
            {"acoes_necessarias": ["LISTAR"]})
        assert bridge._fase_classificar_risco(r) == NivelRisco.BAIXO

    def test_risco_critico(self, bridge):
        r = ResultadoOperacao(True, FaseOperacao.INTERPRETACAO, "QWEN", "ok",
            {"acoes_necessarias": ["DELETAR"]})
        assert bridge._fase_classificar_risco(r) == NivelRisco.CRITICO

class TestJarvis:
    def test_varrer_ecossistema(self, bridge):
        rel = bridge.varrer_ecossistema()
        assert len(rel["componentes_verificados"]) >= 6
        assert "anomalias" in rel

    def test_componentes_principais(self, bridge):
        rel = bridge.varrer_ecossistema()
        nomes = [c["componente"] for c in rel["componentes_verificados"]]
        assert "SOUSA_SOURCE_OF_TRUTH" in nomes
        assert "SOUSA_IA" in nomes
        assert "RUFLO_ADAPTADO" in nomes

class TestWolverine:
    def test_autodiagnostico(self, bridge):
        d = bridge.autodiagnostico()
        assert "problemas_encontrados" in d
        assert "correcoes_propostas" in d
        assert isinstance(d["problemas_encontrados"], list)

class TestRegistry:
    def test_consultar_registry(self, bridge):
        r = bridge.consultar_registry("teste")
        assert r["acao_recomendada"] == "AUDITAR_ANTES_DE_CRIAR"

class TestLab:
    def test_promover_lab(self, bridge):
        r = bridge.promover_lab_para_producao("modulo_android")
        assert r.sucesso is True
        assert r.dados["autorizado"] is True

class TestEstruturas:
    def test_intencao(self):
        i = IntencaoFundador(texto="teste")
        assert i.texto == "teste"
        assert i.origem == "CONSOLE"

    def test_resultado(self):
        r = ResultadoOperacao(True, FaseOperacao.EXECUCAO, "TESTE", "ok")
        assert r.sucesso is True

    def test_ciclo(self, intencao_simples):
        c = CicloOperacional(id_ciclo="T1", intencao=intencao_simples)
        assert c.concluido is False

class TestRobustez:
    def test_intencao_vazia(self, bridge):
        i = IntencaoFundador(texto="")
        ciclo = bridge.processar_intencao(i)
        assert ciclo is not None

    def test_multiplas_intencoes(self, bridge):
        for _ in range(5):
            i = IntencaoFundador(texto="teste rapido")
            c = bridge.processar_intencao(i)
            assert c.concluido is True
        assert len(bridge.historico_ciclos) == 5
