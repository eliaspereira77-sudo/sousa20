#!/usr/bin/env python3
"""
SOUSA 2.0 — Motor Agent Desktop REA v2.0 (sousaileon_desktop_driver.py)
Integração soldada: Robô SOUSAILEON + Jarvis Registry + SOUSA_GUARDIAN (0,01%)
Padrão: Árvore de Acessibilidade Nativa (UIA InvokePattern + ValuePattern) + Token Efêmero MCP
Regra 0800 | Limite Arquitetural: MAX_LINES <= 350
"""

from __future__ import annotations

import base64
import hashlib
import json
import os
import platform
import subprocess
import sys
import time
from dataclasses import asdict, dataclass
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
    """Nó determinístico extraído da Árvore de Acessibilidade Nativa (UIA)."""
    ref: str
    role: str
    name: str
    window_title: str = ""
    control_index: int = 0
    automation_id: str = ""
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
    """Portaria Digital: inventaria binários e injeta segredos apenas em memória."""

    def __init__(self, manifest_path: Optional[Path] = None) -> None:
        base_dir = Path("C:/SOUSA_2.0_PRODUCAO") if os.name == "nt" else Path(os.path.expanduser("~/SOUSA_2.0_PRODUCAO"))
        self.manifest_path = manifest_path or (base_dir / "jarvis_desktop_manifest.json")
        self._active_leases: Dict[str, EphemeralTokenLease] = {}

    def discover_local_runtime(self) -> Dict[str, Any]:
        from shutil import which
        manifest = {
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "node_host": platform.node(),
            "driver_version": "2.0.0-UIA-EXEC",
            "governance": "SOUSA_GUARDIAN_0.01%",
            "cost_policy": "REGRA_0800_STRICT",
            "discovered_tools": {
                "python": sys.executable,
                "os": platform.system(),
                "node": which("node"),
                "git": which("git"),
                "rclone": which("rclone"),
                "ollama": which("ollama"),
                "powershell": which("pwsh") or which("powershell"),
            },
            "mcp_connectors": ["composio", "firecrawl", "perplexity", "playwright", "posthog"],
        }
        if SousaGuardianDesktopShield.validate_workspace_path(str(self.manifest_path)):
            self.manifest_path.parent.mkdir(parents=True, exist_ok=True)
            self.manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
        return manifest

    def run_with_ephemeral_secret(
        self, agent_id: str, service_name: str, env_var_name: str,
        secret_resolver: Callable[[], str], command: List[str], ttl_seconds: int = 30,
    ) -> Dict[str, Any]:
        secret_val = secret_resolver()
        lease_id = f"lease_{hashlib.sha256(f'{agent_id}:{service_name}:{time.time()}'.encode()).hexdigest()[:12]}"
        self._active_leases[lease_id] = EphemeralTokenLease(
            lease_id=lease_id, agent_id=agent_id, service_name=service_name,
            expires_at_epoch=time.time() + ttl_seconds,
            token_hash=hashlib.sha256(secret_val.encode()).hexdigest()[:16],
        )
        child_env = os.environ.copy()
        child_env[env_var_name] = secret_val
        try:
            proc = subprocess.run(command, env=child_env, capture_output=True, text=True, timeout=ttl_seconds, check=False)
            return {
                "status": "ok" if proc.returncode == 0 else "error",
                "returncode": proc.returncode,
                "lease_id": lease_id,
                "stdout": SousaGuardianDesktopShield.redact_secrets(proc.stdout, [secret_val]),
                "stderr": SousaGuardianDesktopShield.redact_secrets(proc.stderr, [secret_val]),
            }
        finally:
            child_env.pop(env_var_name, None)
            secret_val = ""
            self._active_leases.pop(lease_id, None)


class SousaileonDesktopDriver:
    """Braço Mecânico do Robô SOUSAILEON: leitura UIA + InvokePattern & ValuePattern."""

    def __init__(self, broker: Optional[JarvisEphemeralBroker] = None) -> None:
        self.broker = broker or JarvisEphemeralBroker()
        self.os_name = platform.system().lower()
        self._last_snapshot: List[UIElementNode] = []

    def check_user_idle_seconds(self) -> float:
        if self.os_name != "windows":
            return 999.0
        ps = (
            "Add-Type @'\nusing System; using System.Runtime.InteropServices;\n"
            "public struct LASTINPUTINFO { public uint cbSize; public uint dwTime; }\n"
            "public class IdleCheck {\n"
            "  [DllImport(\"user32.dll\")] public static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);\n"
            "  public static uint GetIdleMs() {\n"
            "    LASTINPUTINFO lii = new LASTINPUTINFO(); lii.cbSize = (uint)Marshal.SizeOf(typeof(LASTINPUTINFO));\n"
            "    GetLastInputInfo(ref lii); return ((uint)Environment.TickCount - lii.dwTime);\n"
            "  }\n}\n'@; [IdleCheck]::GetIdleMs()"
        )
        res = subprocess.run(["powershell", "-NoProfile", "-Command", ps], capture_output=True, text=True, check=False)
        try:
            return float(res.stdout.strip()) / 1000.0
        except ValueError:
            return 0.0

    def snapshot_accessibility_tree(self, window_title_filter: str = "") -> List[UIElementNode]:
        if self.os_name != "windows":
            self._last_snapshot = []
            return self._last_snapshot

        safe_filter = window_title_filter.replace("'", "''")
        ps_uia = f"""
        Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes
        $root = [System.Windows.Automation.AutomationElement]::RootElement
        $cond = [System.Windows.Automation.Condition]::TrueCondition
        $wins = $root.FindAll([System.Windows.Automation.TreeScope]::Children, $cond)
        $out = @(); $idx = 1
        foreach ($w in $wins) {{
            $wTitle = $w.Current.Name
            if ('{safe_filter}' -ne '' -and $wTitle -notlike '*{safe_filter}*') {{ continue }}
            $ctrls = $w.FindAll([System.Windows.Automation.TreeScope]::Descendants, $cond)
            $cIdx = 0
            foreach ($c in $ctrls) {{
                $cIdx++
                if ($idx -gt 100) {{ break }}
                $ct = $c.Current.ControlType.ProgrammaticName -replace 'ControlType\\.',''
                if ($ct -in @('Button','Edit','MenuItem','TabItem','CheckBox','ComboBox')) {{
                    $out += [PSCustomObject]@{{
                        ref = "@e$idx"; role = $ct; name = $c.Current.Name;
                        window_title = $wTitle; control_index = $cIdx;
                        automation_id = $c.Current.AutomationId; enabled = $c.Current.IsEnabled
                    }}
                    $idx++
                }}
            }}
        }}
        $out | ConvertTo-Json -Compress
        """
        proc = subprocess.run(["powershell", "-NoProfile", "-Command", ps_uia], capture_output=True, text=True, check=False)
        raw = proc.stdout.strip()
        if not raw:
            self._last_snapshot = []
            return self._last_snapshot
        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            parsed = [parsed]
        self._last_snapshot = [
            UIElementNode(
                ref=i.get("ref", ""), role=i.get("role", ""), name=i.get("name", ""),
                window_title=i.get("window_title", ""), control_index=int(i.get("control_index", 0)),
                automation_id=i.get("automation_id", ""), enabled=bool(i.get("enabled", True)),
            ) for i in parsed
        ]
        return self._last_snapshot

    def _execute_uia_pattern(self, target: UIElementNode, action: str, text_value: str = "") -> Dict[str, Any]:
        """Aciona InvokePattern (clique) ou ValuePattern (texto) diretamente via UIA."""
        if self.os_name != "windows":
            return {"status": "error", "reason": "Execucao UIA nativa disponivel apenas no Windows 11."}

        win_b64 = base64.b64encode(target.window_title.encode("utf-8")).decode("ascii")
        txt_b64 = base64.b64encode(text_value.encode("utf-8")).decode("ascii")
        aid_b64 = base64.b64encode(target.automation_id.encode("utf-8")).decode("ascii")

        ps_exec = f"""
        Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes
        $winTitle = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('{win_b64}'))
        $txtVal   = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('{txt_b64}'))
        $autoId   = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('{aid_b64}'))
        $root = [System.Windows.Automation.AutomationElement]::RootElement
        $cond = [System.Windows.Automation.Condition]::TrueCondition
        $wins = $root.FindAll([System.Windows.Automation.TreeScope]::Children, $cond)
        $targetEl = $null
        foreach ($w in $wins) {{
            if ($w.Current.Name -eq $winTitle) {{
                $ctrls = $w.FindAll([System.Windows.Automation.TreeScope]::Descendants, $cond)
                if ({target.control_index} -gt 0 -and {target.control_index} -le $ctrls.Count) {{
                    $cand = $ctrls[{target.control_index} - 1]
                    if ($autoId -eq '' -or $cand.Current.AutomationId -eq $autoId) {{ $targetEl = $cand; break }}
                }}
            }}
        }}
        if (-not $targetEl) {{ Write-Output '{{"ok":false,"error":"Elemento UIA nao localizado"}}'; exit 1 }}
        try {{
            if ('{action}' -eq 'click') {{
                $pat = $null
                if ($targetEl.TryGetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern, [ref]$pat)) {{
                    ([System.Windows.Automation.InvokePattern]$pat).Invoke()
                    Write-Output '{{"ok":true,"pattern":"InvokePattern"}}'
                }} elseif ($targetEl.TryGetCurrentPattern([System.Windows.Automation.SelectionItemPattern]::Pattern, [ref]$pat)) {{
                    ([System.Windows.Automation.SelectionItemPattern]$pat).Select()
                    Write-Output '{{"ok":true,"pattern":"SelectionItemPattern"}}'
                }} elseif ($targetEl.TryGetCurrentPattern([System.Windows.Automation.TogglePattern]::Pattern, [ref]$pat)) {{
                    ([System.Windows.Automation.TogglePattern]$pat).Toggle()
                    Write-Output '{{"ok":true,"pattern":"TogglePattern"}}'
                }} else {{
                    Write-Output '{{"ok":false,"error":"Controle nao suporta Invoke/Select/Toggle"}}'
                }}
            }} elseif ('{action}' -eq 'type') {{
                $vPat = $null
                if ($targetEl.TryGetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern, [ref]$vPat)) {{
                    ([System.Windows.Automation.ValuePattern]$vPat).SetValue($txtVal)
                    Write-Output '{{"ok":true,"pattern":"ValuePattern"}}'
                }} else {{
                    Write-Output '{{"ok":false,"error":"Controle nao suporta ValuePattern"}}'
                }}
            }}
        }} catch {{
            $errMsg = $_.Exception.Message -replace '"',''
            Write-Output "{{\`"ok\`":false,\`"error\`":\`"$errMsg\`"}}"
        }}
        """
        proc = subprocess.run(["powershell", "-NoProfile", "-Command", ps_exec], capture_output=True, text=True, check=False)
        raw = proc.stdout.strip()
        try:
            res = json.loads(raw) if raw else {"ok": False, "error": proc.stderr.strip()}
        except json.JSONDecodeError:
            res = {"ok": False, "error": raw or proc.stderr.strip()}
        return {"status": "executed" if res.get("ok") else "error", "uia_result": res}

    def dispatch_action(
        self, action: str, ref: str, text_value: str = "",
        founder_approved: bool = False, min_idle_seconds: float = 5.0,
    ) -> Dict[str, Any]:
        """Valida Gate 0,01% e ociosidade antes de disparar clique ou texto UIA."""
        if action not in ("click", "type"):
            return {"status": "error", "reason": f"Acao nao suportada: {action}. Use 'click' ou 'type'."}

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
                "reason": f"Fundador ativo no teclado/mouse ({idle:.1f}s < {min_idle_seconds}s).",
            }

        exec_out = self._execute_uia_pattern(target, action, text_value)
        return {
            **exec_out,
            "executor": "ROBO_SOUSAILEON",
            "action": action,
            "target": asdict(target),
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        }


if __name__ == "__main__":
    driver = SousaileonDesktopDriver()
    manifest = driver.broker.discover_local_runtime()
    print(json.dumps({"jarvis_manifest": manifest}, indent=2, ensure_ascii=False))