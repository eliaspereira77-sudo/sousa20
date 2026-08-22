"""
SOUSA 2.0 — Contrato de Soberania do Núcleo

O núcleo é soberano. Camadas e USBs (incluindo Ruflo) operam sob este contrato.
Nenhuma USB substitui identidade, política, governança ou arquitetura do núcleo.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


# ---------------------------------------------------------------------------
# Constantes do contrato
# ---------------------------------------------------------------------------

VERSAO_CONTRATO = "1.0.0"

# Domínios que pertencem exclusivamente ao núcleo (não podem ser soberanos em USB)
DOMINIOS_NUCLEO = (
    "identidade",
    "memoria_canonica",
    "politica",
    "governanca",
    "autorizacao",
    "arquitetura",
    "soberania",
)

# Ações que sempre exigem passagem pelo núcleo / governança
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
    """Levantada quando uma operação tenta violar o contrato de soberania."""

    def __init__(self, motivo: str, detalhe: Optional[Dict] = None):
        self.motivo = motivo
        self.detalhe = detalhe or {}
        super().__init__(motivo)


# ---------------------------------------------------------------------------
# Contrato
# ---------------------------------------------------------------------------

class ContratoSoberania:
    """
    Contrato operacional de soberania do SOUSA 2.0.

    Regras:
    1. O núcleo decide; USBs executam sob política.
    2. Nenhuma USB pode alterar domínios do núcleo sem autorização explícita.
    3. Evolução de capacidades não altera identidade nem arquitetura soberana.
    4. Alto risco e ações protegidas passam por governança.
    5. Ruflo e demais USBs são substituíveis; o núcleo não é.
    """

    def __init__(self):
        self.versao = VERSAO_CONTRATO
        self.usbs_registradas: Dict[str, Dict[str, Any]] = {}
        self.historico: List[Dict[str, Any]] = []

    # ----- registro de USB / camada -----------------------------------------

    def registrar_usb(
        self,
        usb_id: str,
        *,
        tipo: str = "camada",
        descricao: str = "",
        capacidades: Optional[List[str]] = None,
        pode_alterar_nucleo: bool = False,
    ) -> Dict[str, Any]:
        """
        Registra uma USB/camada sob o contrato.
        pode_alterar_nucleo deve permanecer False salvo autorização excepcional.
        """
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
        return {"ok": True, "usb": entrada}

    def desativar_usb(self, usb_id: str, motivo: str = "") -> Dict[str, Any]:
        uid = str(usb_id).upper()
        if uid not in self.usbs_registradas:
            return {"ok": False, "status": "USB_NAO_ENCONTRADA", "id": uid}
        self.usbs_registradas[uid]["status"] = "INATIVA"
        self.usbs_registradas[uid]["desativada_em"] = datetime.now(timezone.utc).isoformat()
        self.usbs_registradas[uid]["motivo_desativacao"] = motivo or "POLITICA"
        self._log("USB_DESATIVADA", {"id": uid, "motivo": motivo})
        return {"ok": True, "usb": self.usbs_registradas[uid]}

    # ----- validação de operações -------------------------------------------

    def validar_operacao(
        self,
        acao: str,
        *,
        origem: str = "desconhecida",
        dominio: Optional[str] = None,
        sinal_risco: Optional[Dict[str, Any]] = None,
        autorizada: bool = False,
    ) -> Dict[str, Any]:
        """
        Valida se uma operação pode prosseguir sob soberania do núcleo.

        Retorna {ok, status, ...}. Se ok=False, a operação deve ser bloqueada
        ou enviada para AGUARDANDO_AUTORIZACAO.
        """
        acao_n = str(acao or "").lower().strip()
        origem_n = str(origem or "desconhecida").upper()
        dominio_n = (dominio or "").lower().strip() or None

        # 1) Ações protegidas
        if acao_n in ACOES_PROTEGIDAS or any(a in acao_n for a in ACOES_PROTEGIDAS):
            if not autorizada:
                self._log("BLOQUEIO_ACAO_PROTEGIDA", {"acao": acao_n, "origem": origem_n})
                return {
                    "ok": False,
                    "status": "AGUARDANDO_AUTORIZACAO",
                    "motivo": "ACAO_PROTEGIDA_DO_NUCLEO",
                    "acao": acao_n,
                    "exige_autorizacao": True,
                }

        # 2) Tentativa de USB alterar domínio do núcleo
        if dominio_n and dominio_n in DOMINIOS_NUCLEO:
            usb = self.usbs_registradas.get(origem_n)
            if usb and not autorizada:
                self._log(
                    "BLOQUEIO_DOMINIO_NUCLEO",
                    {"dominio": dominio_n, "origem": origem_n, "acao": acao_n},
                )
                return {
                    "ok": False,
                    "status": "VIOLACAO_SOBERANIA",
                    "motivo": "DOMINIO_RESERVADO_AO_NUCLEO",
                    "dominio": dominio_n,
                    "origem": origem_n,
                }

        # 3) USB tentando elevar-se a núcleo
        if acao_n in ("elevar_usb_a_nucleo", "substituir_nucleo") and not autorizada:
            return {
                "ok": False,
                "status": "VIOLACAO_SOBERANIA",
                "motivo": "NUCLEO_NAO_SUBSTITUIVEL",
                "acao": acao_n,
            }

        # 4) Sinal de alto risco sem autorização
        if sinal_risco and not autorizada:
            from ruflo.politica import precisa_autorizacao

            auth = precisa_autorizacao(sinal_risco)
            if auth.get("necessaria"):
                self._log("BLOQUEIO_ALTO_RISCO", {"acao": acao_n, "sinal": sinal_risco})
                return {
                    "ok": False,
                    "status": "AGUARDANDO_AUTORIZACAO",
                    "motivo": auth.get("motivo") or "POLITICA_DE_GOVERNANCA",
                    "acao": acao_n,
                    "exige_autorizacao": True,
                    "sinal_risco": sinal_risco,
                }

        self._log("OPERACAO_VALIDADA", {"acao": acao_n, "origem": origem_n})
        return {
            "ok": True,
            "status": "PERMITIDA",
            "acao": acao_n,
            "origem": origem_n,
            "dominio": dominio_n,
        }

    def assert_permitida(self, **kwargs) -> None:
        """Como validar_operacao, mas levanta ViolacaoSoberania se bloqueada."""
        r = self.validar_operacao(**kwargs)
        if not r.get("ok"):
            raise ViolacaoSoberania(r.get("motivo") or r.get("status") or "BLOQUEADO", r)

    # ----- consulta ---------------------------------------------------------

    def status(self) -> Dict[str, Any]:
        ativas = [u for u in self.usbs_registradas.values() if u.get("status") == "ATIVA"]
        return {
            "contrato": "SOBERANIA_NUCLEO",
            "versao": self.versao,
            "dominios_nucleo": list(DOMINIOS_NUCLEO),
            "acoes_protegidas": list(ACOES_PROTEGIDAS),
            "usbs_ativas": len(ativas),
            "usbs": list(self.usbs_registradas.values()),
            "principio": (
                "O núcleo é soberano. USBs executam sob política. "
                "Evolução por valor comprovado, sem perder coerência, "
                "soberania, segurança e arquitetura."
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
        # Mantém histórico enxuto em memória
        if len(self.historico) > 200:
            self.historico = self.historico[-200:]


# Instância padrão do núcleo (processo)
contrato_soberania = ContratoSoberania()

# Registra Ruflo como USB/camada sob o contrato (não como núcleo)
contrato_soberania.registrar_usb(
    "RUFLO",
    tipo="camada_orquestracao",
    descricao="Camada de orquestração de ciclos do SOUSA 2.0",
    capacidades=["ciclo", "workflow", "roteamento"],
    pode_alterar_nucleo=False,
)
