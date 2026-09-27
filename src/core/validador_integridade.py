"""
SOUSA 2.0 - Validador de Integridade do Ecossistema
Detecta: entulhos, duplicidades, arquivos mortos, violações de competência
"""

import os
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Tuple


class ValidadorIntegridade:
    """Valida a saúde do ecossistema SOUSA 2.0."""
    
    def __init__(self, repo_path: str = "."):
        self.repo_path = Path(repo_path)
        self.problemas = []
        self.agentes_permitidos = {
            "ESTRATEGISTA": ["estrategista", "estratégia", "mercado", "tendência"],
            "PRODUTOR": ["produtor", "vídeo", "áudio", "imagem", "conteúdo"],
            "FINANCEIRO": ["financeiro", "roi", "custo", "receita", "lucro"],
            "MECÂNICO": ["mecânico", "bug", "debug", "otimização", "refatoração"],
            "CÃO_DE_GUARDA": ["cão", "guarda", "soberania", "validação", "segurança"],
            "MONITOR_SINTAXE": ["monitor", "sintaxe", "qualidade", "padrão"],
            "ADS": ["ads", "desenvolvimento", "novo", "feature", "integração"],
            "SABER": ["saber", "conhecimento", "memória", "aprendizado"],
        }
    
    def validar_tudo(self) -> Dict[str, any]:
        """Executa todas as validações."""
        print(f"\n{'='*60}")
        print("VALIDADOR DE INTEGRIDADE - SOUSA 2.0")
        print(f"{'='*60}\n")
        
        self._verificar_arquivos_mortos()
        self._verificar_duplicidades()
        self._verificar_entulhos()
        self._verificar_violacoes_competencia()
        self._verificar_governanca()
        
        return self._gerar_relatorio()
    
    def _verificar_arquivos_mortos(self):
        """Detecta arquivos não referenciados em mais de 90 dias."""
        print("[CHECK] Verificando arquivos mortos...")
        
        cutoff_date = datetime.now().timestamp() - (90 * 24 * 60 * 60)
        
        for file_path in self.repo_path.rglob("*"):
            if file_path.is_file() and not self._is_ignored(file_path):
                mtime = file_path.stat().st_mtime
                if mtime < cutoff_date:
                    # Verifica se é referenciado em algum lugar
                    if not self._is_referenced(file_path):
                        self.problemas.append({
                            "tipo": "ARQUIVO_MORTO",
                            "arquivo": str(file_path),
                            "descricao": f"Arquivo não modificado em >90 dias e não referenciado"
                        })
    
    def _verificar_duplicidades(self):
        """Detecta arquivos com conteúdo idêntico."""
        print("[CHECK] Verificando duplicidades...")
        
        hash_map = {}
        
        for file_path in self.repo_path.rglob("*"):
            if file_path.is_file() and not self._is_ignored(file_path):
                try:
                    content_hash = hash(file_path.read_bytes())
                    if content_hash in hash_map:
                        self.problemas.append({
                            "tipo": "DUPLICIDADE",
                            "arquivo": str(file_path),
                            "descricao": f"Conteúdo idêntico a: {hash_map[content_hash]}"
                        })
                    else:
                        hash_map[content_hash] = str(file_path)
                except:
                    pass
    
    def _verificar_entulhos(self):
        """Detecta código comentado, TODOs antigos, imports não utilizados."""
        print("[CHECK] Verificando entulhos...")
        
        for file_path in self.repo_path.rglob("*.py"):
            if not self._is_ignored(file_path):
                content = file_path.read_text(encoding="utf-8", errors="ignore")
                lines = content.split("\n")
                
                for i, line in enumerate(lines, 1):
                    # Código comentado em bloco
                    if line.strip().startswith("#") and len(line.strip()) > 50:
                        self.problemas.append({
                            "tipo": "ENTULHO",
                            "arquivo": f"{file_path}:{i}",
                            "descricao": "Comentário longo (possível código morto)"
                        })
                    
                    # TODOs antigos
                    if "TODO" in line or "FIXME" in line:
                        self.problemas.append({
                            "tipo": "ENTULHO",
                            "arquivo": f"{file_path}:{i}",
                            "descricao": f"TODO/FIXME pendente: {line.strip()[:50]}"
                        })
    
    def _verificar_violacoes_competencia(self):
        """Detecta agentes operando fora do seu quadrado."""
        print("[CHECK] Verificando violações de competência...")
        
        agentes_dir = self.repo_path / "agentes"
        if not agentes_dir.exists():
            return
        
        for agente_file in agentes_dir.glob("*.txt"):
            content = agente_file.read_text(encoding="utf-8", errors="ignore").lower()
            agente_nome = agente_file.stem.upper()
            
            # Verifica se o agente menciona competências de outros
            for outro_agente, keywords in self.agentes_permitidos.items():
                if outro_agente != agente_nome:
                    for keyword in keywords:
                        if keyword in content:
                            self.problemas.append({
                                "tipo": "VIOLAÇÃO_COMPETÊNCIA",
                                "arquivo": str(agente_file),
                                "descricao": f"Agente {agente_nome} menciona competência de {outro_agente}: '{keyword}'"
                            })
    
    def _verificar_governanca(self):
        """Verifica se arquivos críticos da governança existem."""
        print("[CHECK] Verificando governança...")
        
        arquivos_obrigatorios = [
            "00_GOVERNANCA/MAPA_COMPETENCIAS_AGENTES.md",
            "00_GOVERNANCA/PROTOCOLO_EXCELENCIA_MERCADO.md",
        ]
        
        for arquivo in arquivos_obrigatorios:
            if not (self.repo_path / arquivo).exists():
                self.problemas.append({
                    "tipo": "GOVERNANCA",
                    "arquivo": arquivo,
                    "descricao": "Arquivo de governança obrigatório ausente"
                })
    
    def _is_ignored(self, path: Path) -> bool:
        """Verifica se o caminho deve ser ignorado."""
        ignore_patterns = [".git", ".venv", "node_modules", "__pycache__", ".tmp"]
        return any(pattern in str(path) for pattern in ignore_patterns)
    
    def _is_referenced(self, file_path: Path) -> bool:
        """Verifica se o arquivo é referenciado em algum lugar."""
        file_name = file_path.name
        
        for check_path in self.repo_path.rglob("*"):
            if check_path.is_file() and not self._is_ignored(check_path) and check_path != file_path:
                try:
                    content = check_path.read_text(encoding="utf-8", errors="ignore")
                    if file_name in content:
                        return True
                except:
                    pass
        
        return False
    
    def _gerar_relatorio(self) -> Dict[str, any]:
        """Gera relatório final."""
        print(f"\n{'='*60}")
        print("RELATÓRIO DE INTEGRIDADE")
        print(f"{'='*60}\n")
        
        if not self.problemas:
            print("[OK] Ecossistema 100% saudável. Zero problemas detectados.")
            return {"status": "SAUDAVEL", "problemas": 0}
        
        print(f"[ALERTA] {len(self.problemas)} problema(s) detectado(s):\n")
        
        for i, problema in enumerate(self.problemas, 1):
            print(f"{i}. [{problema['tipo']}] {problema['arquivo']}")
            print(f"   {problema['descricao']}\n")
        
        # Salvar relatório
        relatorio_path = self.repo_path / "00_GOVERNANCA" / "relatorio_integridade.json"
        relatorio_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(relatorio_path, "w", encoding="utf-8") as f:
            json.dump({
                "data": datetime.now().isoformat(),
                "total_problemas": len(self.problemas),
                "problemas": self.problemas
            }, f, indent=2, ensure_ascii=False)
        
        print(f"Relatório salvo em: {relatorio_path}")
        
        return {"status": "PROBLEMAS_DETECTADOS", "problemas": len(self.problemas), "detalhes": self.problemas}


if __name__ == "__main__":
    validador = ValidadorIntegridade()
    resultado = validador.validar_tudo()
    
    if resultado["status"] == "SAUDAVEL":
        print("\n[SOUSA_IA] Ecossistema aprovado. Pronto para commit.")
    else:
        print(f"\n[SOUSA_IA] {resultado['problemas']} problema(s) precisam ser corrigidos antes do commit.")
