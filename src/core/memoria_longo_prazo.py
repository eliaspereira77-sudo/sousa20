"""
SOUSA 2.0 - Núcleo de Memória de Longo Prazo (LTM)
Responsável por registrar, recuperar e aplicar aprendizados de todos os agentes.
"""
import json
import os
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any

class MemoriaLongoPrazo:
    def __init__(self, base_path: str = "SOUSA_MEMORIA"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
        self.licoes_path = self.base_path / "licoes_aprendidas"
        self.historico_path = self.base_path / "historico_acoes"
        self.licoes_path.mkdir(exist_ok=True)
        self.historico_path.mkdir(exist_ok=True)

    def registrar_experiencia(self, agente: str, acao: str, resultado: str, sucesso: bool, licao: str, metricas: Dict[str, Any] = None):
        registro = {
            "timestamp": datetime.now().isoformat(), "agente": agente.upper(), "acao": acao,
            "resultado": resultado, "sucesso": sucesso, "licao_aprendida": licao, "metricas": metricas or {}
        }
        data_str = datetime.now().strftime("%Y-%m-%d")
        historico_file = self.historico_path / f"acoes_{data_str}.json"
        historico = []
        if historico_file.exists():
            with open(historico_file, "r", encoding="utf-8") as f:
                try: historico = json.load(f)
                except: historico = []
        historico.append(registro)
        with open(historico_file, "w", encoding="utf-8") as f:
            json.dump(historico, f, indent=2, ensure_ascii=False)
            
        if not sucesso or "descoberta" in resultado.lower():
            self._salvar_licao_permanente(agente, licao, acao)
        print(f"[MEMÓRIA LTM] Experiência registrada pelo agente {agente}. Sucesso: {sucesso}")

    def _salvar_licao_permanente(self, agente: str, licao: str, contexto: str):
        licoes_file = self.licoes_path / "banco_licoes.json"
        licoes = []
        if licoes_file.exists():
            with open(licoes_file, "r", encoding="utf-8") as f:
                try: licoes = json.load(f)
                except: licoes = []
        for l in licoes:
            if l["licao"] == licao: return
        licoes.append({"agente_origem": agente.upper(), "contexto": contexto, "licao": licao, "data_registro": datetime.now().isoformat()})
        with open(licoes_file, "w", encoding="utf-8") as f:
            json.dump(licoes, f, indent=2, ensure_ascii=False)

    def consultar_licoes(self, agente: str = None, palavra_chave: str = None) -> List[Dict[str, Any]]:
        licoes_file = self.licoes_path / "banco_licoes.json"
        if not licoes_file.exists(): return []
        with open(licoes_file, "r", encoding="utf-8") as f:
            try: todas_licoes = json.load(f)
            except: return []
        return [l for l in todas_licoes if (agente is None or l["agente_origem"] == agente.upper()) and (palavra_chave is None or palavra_chave.lower() in l["licao"].lower() or palavra_chave.lower() in l["contexto"].lower())]

memoria_sousa = MemoriaLongoPrazo()

if __name__ == "__main__":
    print("[TESTE] Registrando experiência de aprendizado...")
    memoria_sousa.registrar_experiencia(agente="PRODUTOR", acao="Geração de vídeo com edge-tts", resultado="Vídeo gerado com sucesso em 2 segundos", sucesso=True, licao="edge-tts é a solução mais rápida e leve para TTS em ambiente restrito", metricas={"tempo_segundos": 2, "custo": 0})
    print("[TESTE] Registrando erro para aprendizado...")
    memoria_sousa.registrar_experiencia(agente="ESTRATEGISTA", acao="Tentativa de usar API paga de vídeo", resultado="Falha: Violação da regra de soberania", sucesso=False, licao="Nunca sugerir ferramentas pagas. Sempre buscar alternativa open-source primeiro.", metricas={})
    print("\n[TESTE] Consultando lições sobre 'paga' ou 'soberania':")
    for l in memoria_sousa.consultar_licoes(palavra_chave="paga"):
        print(f"  -> [{l['agente_origem']}] {l['licao']}")
    print("\n[TESTE] Memória LTM funcionando perfeitamente.")
