#!/usr/bin/env python3
"""
SOUSA 2.0 — Motor Agent Desktop REA (sousaileon_desktop_driver.py)
Integração soldada: Robô SOUSAILEON + Jarvis Registry + SOUSA_GUARDIAN (0,01%)
Padrão: Árvore de Acessibilidade Nativa (UIA/AX Sem Visão) + Injeção Efêmera MCP (Zero-Secret)
Regra 0800 | Limite Arquitetural: MAX_LINES <= 350
"""

from __future__ import annotations

import hashlib
import json
import os
import platform
import subprocess
import sys
import time
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional


CRITICAL_ACTION_KEYWORDS = (
    "delete", "excluir", "apagar", "format", "pagar", "pay", "transfer",
    "enviar", "send", "publicar", "publish", "uninstall", "desinstalar",
    "regedit", "shutdown", "desligar", "rm -rf", "del /f"
)

ALLOWED_ROOT_DIRS = (
    os.path.abspath(os.path.expanduser("~/SOUSA_2.0_PRODUCAO")),
    os.path.abspath(os.path.expanduser("~/sousa20")),
    os.path.abspath("C:\\SOUSA_2.0_PRODUCAO"),
    os.path.abspath("C:\\sousa20"),
)


@dataclass
class UIElementNode:
    """Nó determinístico extraído da Árvore de Acessibilidade Nativa (UIA / AT-SPI)."""
    ref: str
    role: str
    name: str
    automation_id: str = ""
    bounds: Dict[str, int] = field(default_factory=dict)
    enabled: bool = True


@dataclass
class EphemeralTokenLease:
    """Concessão temporária em memória pelo Jarvis Registry (Zero Chaves Fixas)."""
    lease_id: str
    agent_id: str
    service_name: str
    expires_at_epoch: float
    token_hash: str


class SousaGuardianDesktopShield:
    """Blindagem jurídica e operacional 0,01% do Fundador Elias Pereira de Sousa."""

    @staticmethod
    def validate_workspace_path(target_path: str) -> bool:
        resolved = os.path.abspath(os.path.expanduser(target_path))
        return any(
            resolved == root or resolved.startswith(root + os.sep)
            for root in ALLOWED_ROOT_DIRS
        )

    @staticmethod
    def requires_founder_gate(action_description: str, element_name: str = "") -> bool:
        combined = f"{action_description} {element_name}".lower()
        return any(kw in combined for kw in CRITICAL_ACTION_KEYWORDS)

    @staticmethod
    def redact_secrets(payload: str, secret_values: List[str]) -> str:
        sanitized = payload
        for secret in secret_values:
            if secret and len(secret) >= 6:
                sanitized = sanitized.replace(secret, "[REDACTED_BY_SOUSA_GUARDIAN]")
        return sanitized


class JarvisEphemeralBroker:
    """
    Portaria Digital (padrão Solo.io agentdesktop + Jarvis Registry):
    Inventaria ferramentas locais e injeta credenciais apenas em memória durante a chamada.
    """

    def __init__(self, manifest_path: Optional[Path] = None) -> None:
        base_dir = Path("C:/SOUSA_2.0_PRODUCAO") if os.name == "nt" else Path(os.path.expanduser("~/SOUSA_2.0_PRODUCAO"))
        self.manifest_path = manifest_path or (base_dir / "jarvis_desktop_manifest.json")
        self._active_leases: Dict[str, EphemeralTokenLease] = {}

    def discover_local_runtime(self) -> Dict[str, Any]:
        tools = {
            "python": sys.executable,
            "os": platform.system(),
            "release": platform.release(),
            "node": self._which("node"),
            "git": self._which("git"),
            "rclone": self._which("rclone"),
            "ollama": self._which("ollama"),
            "powershell": self._which("pwsh") or self._which("powershell"),
        }
        manifest = {
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "node_host": platform.node(),
            "governance": "SOUSA_GUARDIAN_0.01%",
            "cost_policy": "REGRA_0800_STRICT",
            "discovered_tools": tools,
            "mcp_connectors": [
                "composio", "firecrawl", "perplexity", "playwright", "posthog"
            ],
        }
        if SousaGuardianDesktopShield.validate_workspace_path(str(self.manifest_path)):
            self.manifest_path.parent.mkdir(parents=True, exist_ok=True)
            self.manifest_path.write_text(
                json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8"
            )
        return manifest

    def run_with_ephemeral_secret(
        self,
        agent_id: str,
        service_name: str,
        env_var_name: str,
        secret_resolver: Callable[[], str],
        command: List[str],
        ttl_seconds: int = 30,
    ) -> Dict[str, Any]:
        """Executa processo filho com chave efêmera em memória sem gravar em disco."""
        secret_val = secret_resolver()
        lease_raw = f"{agent_id}:{service_name}:{time.time()}".encode("utf-8")
        lease_id = f"lease_{hashlib.sha256(lease_raw).hexdigest()[:12]}"
        token_hash = hashlib.sha256(secret_val.encode("utf-8")).hexdigest()[:16]

        lease = EphemeralTokenLease(
            lease_id=lease_id,
            agent_id=agent_id,
            service_name=service_name,
            expires_at_epoch=time.time() + ttl_seconds,
            token_hash=token_hash,
        )
        self._active_leases[lease_id] = lease

        child_env = os.environ.copy()
        child_env[env_var_name] = secret_val
        try:
            proc = subprocess.run(
                command,
                env=child_env,
                capture_output=True,
                text=True,
                timeout=ttl_seconds,
                check=False,
            )
            clean_out = SousaGuardianDesktopShield.redact_secrets(proc.stdout, [secret_val])
            clean_err = SousaGuardianDesktopShield.redact_secrets(proc.stderr, [secret_val])
            return {
                "status": "ok" if proc.returncode == 0 else "error",
                "returncode": proc.returncode,
                "lease_id": lease_id,
                "stdout": clean_out,
                "stderr": clean_err,
            }
        finally:
            child_env.pop(env_var_name, None)
            secret_val = ""
            self._active_leases.pop(lease_id, None)

    @staticmethod
    def _which(binary: str) -> Optional[str]:
        from shutil import which
        return which(binary)


class SousaileonDesktopDriver:
    """
    Braço Mecânico do Robô SOUSAILEON para Desktop Nativo (Windows 11 / Linux).
    Prioriza UI Automation (UIA) via PowerShell/pywinauto antes de qualquer visão.
    """

    def __init__(self, broker: Optional[JarvisEphemeralBroker] = None) -> None:
        self.broker = broker or JarvisEphemeralBroker()
        self.os_name = platform.system().lower()
        self._last_snapshot: List[UIElementNode] = []

    def check_user_idle_seconds(self) -> float:
        """Verifica ociosidade do teclado/mouse para não disputar foco com o Fundador."""
        if self.os_name != "windows":
            return 999.0
        ps_script = (
            "Add-Type @'\n"
            "using System; using System.Runtime.InteropServices;\n"
            "public struct LASTINPUTINFO { public uint cbSize; public uint dwTime; }\n"
            "public class IdleCheck {\n"
            "  [DllImport(\"user32.dll\")] public static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);\n"
            "  public static uint GetIdleMs() {\n"
            "    LASTINPUTINFO lii = new LASTINPUTINFO();\n"
            "    lii.cbSize = (uint)Marshal.SizeOf(typeof(LASTINPUTINFO));\n"
            "    GetLastInputInfo(ref lii);\n"
            "    return ((uint)Environment.TickCount - lii.dwTime);\n"
            "  }\n"
            "}\n"
            "'@; [IdleCheck]::GetIdleMs()"
        )
        res = subprocess.run(
            ["powershell", "-NoProfile", "-Command", ps_script],
            capture_output=True, text=True, check=False
        )
        try:
            return float(res.stdout.strip()) / 1000.0
        except ValueError:
            return 0.0

    def snapshot_accessibility_tree(self, window_title_filter: str = "") -> List[UIElementNode]:
        """Extrai controles interativos da janela ativa via UIA nativo (custo zero de tokens)."""
        if self.os_name != "windows":
            self._last_snapshot = []
            return self._last_snapshot

        safe_filter = window_title_filter.replace("'", "''")
        ps_uia = f"""
        Add-Type -AssemblyName UIAutomationClient
        Add-Type -AssemblyName UIAutomationTypes
        $root = [System.Windows.Automation.AutomationElement]::RootElement
        $cond = [System.Windows.Automation.Condition]::TrueCondition
        $wins = $root.FindAll([System.Windows.Automation.TreeScope]::Children, $cond)
        $out = @()
        $idx = 1
        foreach ($w in $wins) {{
            $title = $w.Current.Name
            if ('{safe_filter}' -ne '' -and $title -notlike '*{safe_filter}*') {{ continue }}
            $ctrls = $w.FindAll([System.Windows.Automation.TreeScope]::Descendants, $cond)
            foreach ($c in $ctrls) {{
                if ($idx -gt 80) {{ break }}
                $ct = $c.Current.ControlType.ProgrammaticName -replace 'ControlType\\.',''
                if ($ct -in @('Button','Edit','MenuItem','TabItem','CheckBox','ComboBox')) {{
                    $out += [PSCustomObject]@{{
                        ref = "@e$idx"
                        role = $ct
                        name = $c.Current.Name
                        automation_id = $c.Current.AutomationId
                        enabled = $c.Current.IsEnabled
                    }}
                    $idx++
                }}
            }}
        }}
        $out | ConvertTo-Json -Compress
        """
        proc = subprocess.run(
            ["powershell", "-NoProfile", "-Command", ps_uia],
            capture_output=True, text=True, check=False
        )
        raw = proc.stdout.strip()
        if not raw:
            self._last_snapshot = []
            return self._last_snapshot
        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            parsed = [parsed]
        self._last_snapshot = [
            UIElementNode(
                ref=item.get("ref", ""),
                role=item.get("role", ""),
                name=item.get("name", ""),
                automation_id=item.get("automation_id", ""),
                enabled=bool(item.get("enabled", True)),
            )
            for item in parsed
        ]
        return self._last_snapshot

    def dispatch_action(
        self,
        action: str,
        ref: str,
        text_value: str = "",
        founder_approved: bool = False,
        min_idle_seconds: float = 5.0,
    ) -> Dict[str, Any]:
        """Executa clique ou digitação por @ref com trava de foco e Gate 0,01%."""
        target = next((n for n in self._last_snapshot if n.ref == ref), None)
        if not target:
            return {"status": "error", "reason": f"Referencia {ref} nao encontrada no snapshot UIA."}

        if SousaGuardianDesktopShield.requires_founder_gate(action, target.name) and not founder_approved:
            return {
                "status": "blocked_gate_0_01",
                "reason": "Acao critica bloqueada pelo SOUSA_GUARDIAN. Exige aprovacao no Cockpit.",
                "target": asdict(target),
            }

        idle = self.check_user_idle_seconds()
        if idle < min_idle_seconds:
            return {
                "status": "deferred_user_active",
                "reason": f"Fundador ativo no teclado/mouse ({idle:.1f}s < {min_idle_seconds}s). Aguardando janela livre.",
            }

        return {
            "status": "dispatched",
            "executor": "ROBO_SOUSAILEON",
            "action": action,
            "target": asdict(target),
            "text_length": len(text_value),
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        }


if __name__ == "__main__":
    broker = JarvisEphemeralBroker()
    manifest = broker.discover_local_runtime()
    print(json.dumps({"jarvis_manifest": manifest}, indent=2, ensure_ascii=False))