"""
SOUSA 2.0 — Contrato de Soberania do Núcleo

O núcleo é soberano. Camadas e USBs (incluindo Ruflo) operam sob este contrato.
Nenhuma USB substitui identidade, política, governança ou arquitetura do núcleo.

Eventos de validação são espelhados na Auditoria de Acesso (persistente).
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import uuid


VERSAO_CONTRATO = "1.1.1"

DOMINIOS_NUCLEO = (
    "identidade",
    "memoria_canonica",
    "politica",
    "governanca",
    "autorizacao",
    "arquitetura",
    "soberania",
)

ACOES_PROTEGIDAS = (
    "alterar_identidade",
    "alterar_politica",
    "alterar_arquitetura",
    "substituir_nucleo",
    "desativar_governanca",
    "bypass_autorizacao",
    "apagar_memoria_canonica",
    "elevar_usb_a_nucleo",
)


class ViolacaoSoberania(Exception):
    def __init__(self, motivo: str, detalhe: Optional[Dict] = None):
        self.motivo = motivo
        self.detalhe = detalhe or {}
        super().__init__(motivo)


class ContratoSoberania:
    """
    Contrato operacional de soberania do SOUSA 2.0.

    Regras:
    1. O núcleo decide; USBs executam sob política.
    2. Nenhuma USB altera domínios do núcleo sem autorização explícita.
    3. Evolução de capacidades não altera identidade nem arquitetura soberana.
    4. Alto risco e ações protegidas passam por governança.
    5. Ruflo e demais USBs são substituíveis; o núcleo não é.
    6. Autorização concedida é registrada, tem escopo e pode expirar.
    7. Validações relevantes são auditadas de forma persistente.
    """

    def __init__(self):
        self.versao = VERSAO_CONTRATO
        self.usbs_registradas: Dict[str, Dict[str, Any]] = {}
        self.historico: List[Dict[str, Any]] = []
        self.autorizacoes: Dict[str, Dict[str, Any]] = {}

    def registrar_usb(
        self,
        usb_id: str,
        *,
        tipo: str = "camada",
        descricao: str = "",
        capacidades: Optional[List[str]] = None,
        pode_alterar_nucleo: bool = False,
    ) -> Dict[str, Any]:
        if pode_alterar_nucleo:
            raise ViolacaoSoberania(
                "USB não pode ser registrada com pode_alterar_nucleo=True",
                {"usb_id": usb_id},
            )

        entrada = {
            "id": str(usb_id).upper(),
            "tipo": tipo,
            "descricao": descricao,
            "capacidades": capacidades or [],
            "pode_alterar_nucleo": False,
            "status": "ATIVA",
            "registrada_em": datetime.now(timezone.utc).isoformat(),
        }
        self.usbs_registradas[entrada["id"]] = entrada
        self._log("USB_REGISTRADA", entrada)
        self._auditar(
            evento="USB",
            acao="registrar_usb",
            origem=entrada["id"],
            resultado="REGISTRADA",
            detalhe=entrada,
        )
        return {"ok": True, "usb": entrada}

    def desativar_usb(self, usb_id: str, motivo: str = "") -> Dict[str, Any]:
        uid = str(usb_id).upper()
        if uid not in self.usbs_registradas:
            return {"ok": False, "status": "USB_NAO_ENCONTRADA", "id": uid}
        self.usbs_registradas[uid]["status"] = "INATIVA"
        self.usbs_registradas[uid]["desativada_em"] = datetime.now(timezone.utc).isoformat()
        self.usbs_registradas[uid]["motivo_desativacao"] = motivo or "POLITICA"
        self._log("USB_DESATIVADA", {"id": uid, "motivo": motivo})
        self._auditar(
            evento="USB",
            acao="desativar_usb",
            origem=uid,
            resultado="DESATIVADA",
            detalhe={"motivo": motivo},
        )
        return {"ok": True, "usb": self.usbs_registradas[uid]}

    # ----- autorização ------------------------------------------------------

    def conceder_autorizacao(
        self,
        *,
        acao: str,
        concedida_por: str = "operador",
        origem: Optional[str] = None,
        ciclo_id: Optional[str] = None,
        escopo: Optional[Dict[str, Any]] = None,
        motivo: str = "AUTORIZACAO_CONCEDIDA",
        valida_por_segundos: Optional[int] = None,
    ) -> Dict[str, Any]:
        auth_id = f"AUTH_{uuid.uuid4().hex[:12]}"
        agora = datetime.now(timezone.utc)
        expira = None
        if valida_por_segundos and valida_por_segundos > 0:
            expira = agora.timestamp() + valida_por_segundos

        registro = {
            "id": auth_id,
            "acao": str(acao).lower().strip(),
            "concedida_por": concedida_por,
            "origem": (origem or "").upper() or None,
            "ciclo_id": ciclo_id,
            "escopo": escopo or {},
            "motivo": motivo,
            "status": "CONCEDIDA",
            "concedida_em": agora.isoformat(),
            "expira_em": expira,
            "usada": False,
        }
        self.autorizacoes[auth_id] = registro
        self._log("AUTORIZACAO_CONCEDIDA", registro)
        self._auditar(
            evento="AUTORIZACAO",
            acao=registro["acao"],
            origem=registro.get("origem") or concedida_por,
            resultado="CONCEDIDA",
            ciclo_id=ciclo_id,
            detalhe=registro,
        )
        return {"ok": True, "status": "AUTORIZACAO_CONCEDIDA", "autorizacao": registro}

    def consumir_autorizacao(
        self,
        acao: str,
        *,
        auth_id: Optional[str] = None,
        origem: Optional[str] = None,
        ciclo_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        agora = datetime.now(timezone.utc).timestamp()
        acao_n = str(acao).lower().strip()

        candidatas = []
        if auth_id and auth_id in self.autorizacoes:
            candidatas = [self.autorizacoes[auth_id]]
        else:
            candidatas = [
                a
                for a in self.autorizacoes.values()
                if a.get("status") == "CONCEDIDA"
                and not a.get("usada")
                and a.get("acao") == acao_n
            ]
            if origem:
                candidatas = [
                    a
                    for a in candidatas
                    if not a.get("origem") or a.get("origem") == str(origem).upper()
                ]
            if ciclo_id:
                candidatas = [
                    a
                    for a in candidatas
                    if not a.get("ciclo_id") or a.get("ciclo_id") == ciclo_id
                ]

        for a in sorted(candidatas, key=lambda x: x.get("concedida_em", ""), reverse=True):
            exp = a.get("expira_em")
            if exp is not None and agora > exp:
                a["status"] = "EXPIRADA"
                continue
            a["usada"] = True
            a["usada_em"] = datetime.now(timezone.utc).isoformat()
            a["status"] = "CONSUMIDA"
            self._log("AUTORIZACAO_CONSUMIDA", {"id": a["id"], "acao": acao_n})
            self._auditar(
                evento="AUTORIZACAO",
                acao=acao_n,
                origem=origem,
                resultado="CONSUMIDA",
                ciclo_id=ciclo_id,
                detalhe={"auth_id": a["id"]},
            )
            return {"ok": True, "status": "AUTORIZADA", "autorizacao": a}

        return {"ok": False, "status": "SEM_AUTORIZACAO_VALIDA", "acao": acao_n}

    def validar_operacao(
        self,
        acao: str,
        *,
        origem: str = "desconhecida",
        dominio: Optional[str] = None,
        sinal_risco: Optional[Dict[str, Any]] = None,
        autorizada: bool = False,
        auth_id: Optional[str] = None,
        ciclo_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        acao_n = str(acao or "").lower().strip()
        origem_n = str(origem or "desconhecida").upper()
        dominio_n = (dominio or "").lower().strip() or None

        if not autorizada:
            cons = self.consumir_autorizacao(
                acao_n, auth_id=auth_id, origem=origem_n, ciclo_id=ciclo_id
            )
            if cons.get("ok"):
                autorizada = True

        resultado: Dict[str, Any]

        if acao_n in ACOES_PROTEGIDAS or any(a in acao_n for a in ACOES_PROTEGIDAS):
            if not autorizada:
                self._log("BLOQUEIO_ACAO_PROTEGIDA", {"acao": acao_n, "origem": origem_n})
                resultado = {
                    "ok": False,
                    "status": "AGUARDANDO_AUTORIZACAO",
                    "motivo": "ACAO_PROTEGIDA_DO_NUCLEO",
                    "acao": acao_n,
                    "origem": origem_n,
                    "dominio": dominio_n,
                    "ciclo_id": ciclo_id,
                    "exige_autorizacao": True,
                }
                self._auditar_validacao(resultado)
                return resultado

        if dominio_n and dominio_n in DOMINIOS_NUCLEO:
            usb = self.usbs_registradas.get(origem_n)
            if usb and not autorizada:
                self._log(
                    "BLOQUEIO_DOMINIO_NUCLEO",
                    {"dominio": dominio_n, "origem": origem_n, "acao": acao_n},
                )
                resultado = {
                    "ok": False,
                    "status": "VIOLACAO_SOBERANIA",
                    "motivo": "DOMINIO_RESERVADO_AO_NUCLEO",
                    "dominio": dominio_n,
                    "origem": origem_n,
                    "acao": acao_n,
                    "ciclo_id": ciclo_id,
                }
                self._auditar_validacao(resultado)
                return resultado

        if acao_n in ("elevar_usb_a_nucleo", "substituir_nucleo") and not autorizada:
            resultado = {
                "ok": False,
                "status": "VIOLACAO_SOBERANIA",
                "motivo": "NUCLEO_NAO_SUBSTITUIVEL",
                "acao": acao_n,
                "origem": origem_n,
                "ciclo_id": ciclo_id,
            }
            self._auditar_validacao(resultado)
            return resultado

        if sinal_risco and not autorizada:
            from ruflo.politica import precisa_autorizacao

            auth = precisa_autorizacao(sinal_risco)
            if auth.get("necessaria"):
                self._log("BLOQUEIO_ALTO_RISCO", {"acao": acao_n, "sinal": sinal_risco})
                resultado = {
                    "ok": False,
                    "status": "AGUARDANDO_AUTORIZACAO",
                    "motivo": auth.get("motivo") or "POLITICA_DE_GOVERNANCA",
                    "acao": acao_n,
                    "origem": origem_n,
                    "dominio": dominio_n,
                    "ciclo_id": ciclo_id,
                    "exige_autorizacao": True,
                    "sinal_risco": sinal_risco,
                }
                self._auditar_validacao(resultado)
                return resultado

        self._log("OPERACAO_VALIDADA", {"acao": acao_n, "origem": origem_n, "autorizada": autorizada})
        resultado = {
            "ok": True,
            "status": "PERMITIDA",
            "acao": acao_n,
            "origem": origem_n,
            "dominio": dominio_n,
            "ciclo_id": ciclo_id,
            "autorizada": autorizada,
        }
        self._auditar_validacao(resultado)
        return resultado

    def assert_permitida(self, **kwargs) -> None:
        r = self.validar_operacao(**kwargs)
        if not r.get("ok"):
            raise ViolacaoSoberania(r.get("motivo") or r.get("status") or "BLOQUEADO", r)

    def status(self) -> Dict[str, Any]:
        ativas = [u for u in self.usbs_registradas.values() if u.get("status") == "ATIVA"]
        auth_abertas = [
            a
            for a in self.autorizacoes.values()
            if a.get("status") == "CONCEDIDA" and not a.get("usada")
        ]
        return {
            "contrato": "SOBERANIA_NUCLEO",
            "versao": self.versao,
            "dominios_nucleo": list(DOMINIOS_NUCLEO),
            "acoes_protegidas": list(ACOES_PROTEGIDAS),
            "usbs_ativas": len(ativas),
            "usbs": list(self.usbs_registradas.values()),
            "autorizacoes_abertas": len(auth_abertas),
            "principio": (
                "O núcleo é soberano. USBs executam sob política. "
                "Evolução por valor comprovado, sem perder coerência, "
                "soberania, segurança e arquitetura. "
                "Autorização concedida é explícita, registrada e consumível. "
                "Acessos relevantes são auditados de forma persistente."
            ),
        }

    def _log(self, tipo: str, detalhe: Dict[str, Any]) -> None:
        self.historico.append(
            {
                "tipo": tipo,
                "detalhe": detalhe,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        )
        if len(self.historico) > 200:
            self.historico = self.historico[-200:]

    def _auditar(self, **kwargs: Any) -> None:
        try:
            from core.auditoria import auditoria
            auditoria.registrar(**kwargs)
        except Exception:
            pass  # auditoria nunca interrompe o fluxo soberano

    def _auditar_validacao(self, resultado: Dict[str, Any]) -> None:
        try:
            from core.auditoria import auditoria
            auditoria.registrar_validacao(resultado)
        except Exception:
            pass


contrato_soberania = ContratoSoberania()

contrato_soberania.registrar_usb(
    "RUFLO",
    tipo="camada_orquestracao",
    descricao="Camada de orquestração de ciclos do SOUSA 2.0",
    capacidades=["ciclo", "workflow", "roteamento"],
    pode_alterar_nucleo=False,
)
