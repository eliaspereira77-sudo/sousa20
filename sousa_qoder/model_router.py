"""
Model Tier Router (Clean-Room Qoder Auto / Fast / Ultimate -> Regra 0800).
Seleciona o tier ideal pela complexidade da tarefa mantendo custo_usd == 0.0.
"""

from dataclasses import dataclass
from typing import Dict


@dataclass(frozen=True)
class ModelTier:
    name: str
    qoder_equivalent: str
    provider_cascade: tuple
    cost_usd: float = 0.0
    max_context_files: int = 8


TIERS: Dict[str, ModelTier] = {
    "fast": ModelTier(
        name="fast",
        qoder_equivalent="Qoder Fast (0.8x)",
        provider_cascade=("ollama/qwen2.5-coder:7b", "groq/llama-3.3-70b", "gemini-flash"),
        cost_usd=0.0,
        max_context_files=5,
    ),
    "auto": ModelTier(
        name="auto",
        qoder_equivalent="Qoder Auto (0.5x)",
        provider_cascade=("ollama/qwen2.5-coder:14b", "openrouter/free", "cerebras/llama-3.3"),
        cost_usd=0.0,
        max_context_files=10,
    ),
    "ultimate": ModelTier(
        name="ultimate",
        qoder_equivalent="Qoder Ultimate (2.0x)",
        provider_cascade=("deepseek-r1-free", "qwen3-coder-free", "gemini-pro-free"),
        cost_usd=0.0,
        max_context_files=25,
    ),
}


def route_task(prompt: str, mode: str = "agent", requested_tier: str = "auto") -> ModelTier:
    """Escolhe o tier 0800 mais econômico para o modo e complexidade do pedido."""
    if requested_tier in TIERS and requested_tier != "auto":
        return TIERS[requested_tier]

    p_low = prompt.lower()
    if mode == "quest" or any(k in p_low for k in ("arquitetura", "refator", "migra", "spec", "sistema")):
        return TIERS["ultimate"]
    if mode == "ask" or len(prompt) < 120:
        return TIERS["fast"]
    return TIERS["auto"]
