import asyncio
import edge_tts
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent.parent.parent / "00_GOVERNANCA" / "producoes_midia"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Voz neural brasileira masculina (excelente qualidade)
VOICE = "pt-BR-AntonioNeural" 
# Outras opções: "pt-BR-FranciscaNeural" (Feminina), "pt-BR-BrendaNeural"

async def gerar_audio(texto, nome_arquivo):
    output_path = OUTPUT_DIR / nome_arquivo
    communicate = edge_tts.Communicate(texto, VOICE)
    await communicate.save(str(output_path))
    print(f"[PRODUTOR] Áudio gerado com sucesso: {output_path}")

if __name__ == "__main__":
    print("="*60)
    print(" AGENTE PRODUTOR: GERADOR DE VOZ NEURAL (edge-tts)")
    print("="*60)
    
    texto = "Olá, aqui é o Sousa. O futuro da automação multimídia é gratuito, soberano e está apenas começando."
    asyncio.run(gerar_audio(texto, "intro_sousa_neural.mp3"))
    print("[PRODUTOR] Missão cumprida! Áudio pronto para o SadTalker.")
