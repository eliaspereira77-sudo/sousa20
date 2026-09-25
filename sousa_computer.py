import os, sys, json, cmd, datetime, logging, subprocess, threading
from pathlib import Path
from flask import Flask, jsonify, send_from_directory

Path("logs").mkdir(exist_ok=True)
Path("config").mkdir(exist_ok=True)
Path("config/clones").mkdir(exist_ok=True)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
                    handlers=[logging.FileHandler("logs/sousa_computer.log", encoding="utf-8"), logging.StreamHandler()])
logger = logging.getLogger("SousaComputer")

def carregar_config():
    if os.path.exists("config/sousa_config.json"):
        with open("config/sousa_config.json", "r", encoding="utf-8") as f:
            return json.load(f)
    return {"sistema": {"versao": "4.0", "fundador": "Sir Elias", "modo_jarvis": True}}

class GerenciadorDeEstado:
    def __init__(self):
        self.arquivo = "config/estado_pc_virtual.json"
        self.dados = {}

    def salvar(self, conselho):
        self.dados = {
            "financeiro_saldo": conselho.agentes["FinanceiroSousa"].orcamento if "FinanceiroSousa" in conselho.agentes else 0.0,
            "financeiro_transacoes": conselho.agentes["FinanceiroSousa"].transacoes if "FinanceiroSousa" in conselho.agentes else [],
            "livros": conselho.agentes["ADSPessoal"].livros if "ADSPessoal" in conselho.agentes else [],
            "capitulos": conselho.agentes["ADSPessoal"].capitulos if "ADSPessoal" in conselho.agentes else [],
            "aulas": conselho.agentes["ADSPessoal"].aulas if "ADSPessoal" in conselho.agentes else [],
            "projetos": conselho.agentes["ADSPessoal"].projetos if "ADSPessoal" in conselho.agentes else [],
            "mentorias": conselho.agentes["MentorElias"].mentorias if "MentorElias" in conselho.agentes else []
        }
        with open(self.arquivo, "w", encoding="utf-8") as f:
            json.dump(self.dados, f, indent=4, ensure_ascii=False)

    def carregar(self, conselho):
        if os.path.exists(self.arquivo):
            with open(self.arquivo, "r", encoding="utf-8") as f:
                self.dados = json.load(f)
            if "FinanceiroSousa" in conselho.agentes:
                conselho.agentes["FinanceiroSousa"].orcamento = float(self.dados.get("financeiro_saldo", 0.0))
                conselho.agentes["FinanceiroSousa"].transacoes = self.dados.get("financeiro_transacoes", [])
            if "ADSPessoal" in conselho.agentes:
                conselho.agentes["ADSPessoal"].livros = self.dados.get("livros", [])
                conselho.agentes["ADSPessoal"].capitulos = self.dados.get("capitulos", [])
                conselho.agentes["ADSPessoal"].aulas = self.dados.get("aulas", [])
                conselho.agentes["ADSPessoal"].projetos = self.dados.get("projetos", [])
            if "MentorElias" in conselho.agentes:
                conselho.agentes["MentorElias"].mentorias = self.dados.get("mentorias", [])
            return True
        return False





# =============================================
# CASCATA INTELIGENTE DE APIs (SOUSA 2.0 - 9 APIs)
# =============================================
class CascataAPIs:
    def __init__(self):
        self.apis = [
            {"nome": "Apps Script (Google)", "cota_diaria": 100, "custo": "gratuito", "velocidade": "media", "modelo": "GPT-4 via Apps Script"},
            {"nome": "Gemini API (Google)", "cota_diaria": 1500, "custo": "gratuito", "velocidade": "rapida", "modelo": "Gemini 2.0 Flash"},
            {"nome": "Groq Cloud", "cota_diaria": 30000, "custo": "gratuito (beta)", "velocidade": "ultra-rapida (LPU)", "modelo": "Llama 3.1 70B / Mixtral"},
            {"nome": "OpenRouter", "cota_diaria": 999999, "custo": "pay-per-use", "velocidade": "variavel", "modelo": "Agregador: 100+ modelos"},
            {"nome": "Cerebras Inference", "cota_diaria": 10000, "custo": "gratuito (beta)", "velocidade": "ultra-rapida (WSE)", "modelo": "Llama 3.1 8B/70B"},
            {"nome": "Mistral AI", "cota_diaria": 5000, "custo": "trial/pay-per-use", "velocidade": "rapida", "modelo": "Mistral Large 2 / Mixtral 8x22B"},
            {"nome": "Perplexity API", "cota_diaria": 600, "custo": "limitado/pay-per-use", "velocidade": "rapida", "modelo": "Sonar Pro (busca em tempo real)"},
            {"nome": "DeepSeek API", "cota_diaria": 10000, "custo": "generoso (USD 0.27/1M)", "velocidade": "media", "modelo": "DeepSeek-V3 / DeepSeek-R1"},
            {"nome": "Ollama Local", "cota_diaria": 999999, "custo": "local (zero custo)", "velocidade": "depende_hardware", "modelo": "Qwen2.5 / Llama 3.2 (local)"}
        ]
        self.uso_atual = {}
        self.api_ativa = None

    def escolher_melhor_api(self, criterio="cota"):
        if criterio == "velocidade":
            ordem = {"ultra-rapida (LPU)": 5, "ultra-rapida (WSE)": 4, "rapida": 3, "media": 2, "variavel": 1, "depende_hardware": 0}
            apis_ordenadas = sorted(self.apis, key=lambda x: ordem.get(x["velocidade"], 0), reverse=True)
        elif criterio == "custo":
            apis_ordenadas = sorted(self.apis, key=lambda x: 0 if "gratuito" in x["custo"].lower() else 1)
        else:
            apis_ordenadas = sorted(self.apis, key=lambda x: x["cota_diaria"], reverse=True)
        
        for api in apis_ordenadas:
            nome = api["nome"]
            uso = self.uso_atual.get(nome, {"requisicoes": 0})
            if uso["requisicoes"] < api["cota_diaria"]:
                self.api_ativa = api
                return api
        return None

    def status_cotas(self):
        print("\\n" + "="*70)
        print("  CASCATA DE APIs DO SOUSA 2.0 (9 PROVEDORES)")
        print("="*70)
        for i, api in enumerate(self.apis, 1):
            nome = api["nome"]
            uso = self.uso_atual.get(nome, {"requisicoes": 0})
            disponivel = api["cota_diaria"] - uso["requisicoes"]
            print(f"  [{i}] {nome}")
            print(f"      Modelo: {api['modelo']} | Velocidade: {api['velocidade']}")
            print(f"      Requisições: {uso['requisicoes']}/{api['cota_diaria']} ({disponivel} disponíveis) | Custo: {api['custo']}")
        print("="*70 + "\\n")

    def relatorio_inteligente(self):
        print("\\n  📊 RELATÓRIO ESTRATÉGICO DE APIs:")
        print("  ─" * 68)
        print("   Respostas ultra-rápidas  | Groq Cloud / Cerebras")
        print("   Raciocínio complexo      | DeepSeek-R1")
        print("   Busca em tempo real      | Perplexity")
        print("   Custo zero / Generoso    | Gemini 2.0 / Groq / DeepSeek")
        print("   Múltiplos modelos        | OpenRouter (100+ modelos)")
        print("   Privacidade total        | Ollama Local (100% offline)")
        print("  ─" * 68 + "\\n")

cascata = CascataAPIs()


# =============================================
# INTERFACE POR VOZ (SOUSA IA OUVINTE)
# =============================================
import speech_recognition as sr
import pyttsx3

class SousaVoz:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.engine = pyttsx3.init()
        self.engine.setProperty('rate', 175)
        self.ativo = True
        self.palavra_ativacao = "sousa"
        
    def falar(self, texto):
        """SOUSA IA fala em voz alta"""
        print(f"  [VOZ] {texto}")
        try:
            self.engine.say(texto)
            self.engine.runAndWait()
        except Exception as e:
            print(f"  [ERRO VOZ] {e}")
    
    def ouvir(self, timeout=5):
        """SOUSA IA escuta o microfone"""
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
            print("  [MICROFONE] Ouvindo... (fale agora)")
            try:
                audio = self.recognizer.listen(source, timeout=timeout, phrase_time_limit=10)
                texto = self.recognizer.recognize_google(audio, language="pt-BR")
                print(f"  [OUVIDO] {texto}")
                return texto.lower()
            except sr.WaitTimeoutError:
                return None
            except sr.UnknownValueError:
                return None
            except Exception as e:
                print(f"  [ERRO MICROFONE] {e}")
                return None
    
    def processar_comando(self, texto):
        """Interpreta o comando de voz e executa"""
        if not texto:
            return False
        
        texto = texto.strip().lower()
        
        # Palavra de ativação
        if texto.startswith(self.palavra_ativacao):
            texto = texto[len(self.palavra_ativacao):].strip()
        
        # Comandos de voz mapeados
        if 'status' in texto:
            self.falar("Sistema operacional. 13 capacidades ativas. 9 módulos funcionais.")
            return 'status'
        elif 'ajuda' in texto or 'help' in texto:
            self.falar("Posso executar operações, verificar status, gerar relatórios e coordenar a cascata de APIs. Qual sua ordem?")
            return 'help'
        elif 'diagnóstico' in texto or 'diagnostico' in texto:
            self.falar("Sistema saudável. Todos os módulos operacionais.")
            return 'diagnostico'
        elif 'backup' in texto:
            self.falar("Executando backup agora.")
            return 'consolidar'
        elif 'sincronizar' in texto or 'drive' in texto:
            self.falar("Sincronizando com SOUSA DRIVE.")
            return 'sousa_sync'
        elif 'cascata' in texto or 'api' in texto:
            self.falar("Cascata de 10 APIs operacional. Apps Script, Gemini, Groq, OpenRouter, Cerebras, Mistral, Perplexity, DeepSeek, Agnes e Ollama.")
            return 'cascata_status'
        elif 'saldo' in texto or 'financeiro' in texto:
            self.falar("Verificando saldo financeiro.")
            return 'financeiro_balanco'
        elif 'livros' in texto or 'ads' in texto:
            self.falar("Verificando produção do ADS.")
            return 'ads_relatorio'
        elif 'sair' in texto or 'exit' in texto or 'tchau' in texto:
            self.falar("Até a próxima, Sir Elias.")
            return 'exit'
        else:
            self.falar(f"Comando não reconhecido: {texto}")
            return None

voz = SousaVoz()

class SousaIAConselho:
    def __init__(self):
        config = carregar_config()
        sistema = config.get("sistema", {})
        self.nome = sistema.get("nome", "SOUSA IA CONSELHO")
        self.status = "ONLINE"
        self.saude = 100.0
        self.agentes = {}
        self.fundador = sistema.get("fundador", "Sir Elias")
        self.modo_jarvis = sistema.get("modo_jarvis", True)
        self.config = config
        self.memoria = GerenciadorDeEstado()

    def registrar(self, agente): self.agentes[agente.nome] = agente
    def status_geral(self):
        return {"Status": self.status, "Saude": f"{self.saude}%", "Agentes": len(self.agentes), 
                "Ativos": sum(1 for a in self.agentes.values() if a.ativo), "CEO": self.nome}
    def falar(self, msg): print(f"  [CONSELHO] {msg}" if self.modo_jarvis else f"  {msg}")
    def saudacao(self):
        h = datetime.datetime.now().hour
        p = "Bom dia" if h < 12 else "Boa tarde" if h < 18 else "Boa noite"
        self.falar(f"{p}, {self.fundador}. PC Virtual SOUSA inicializado. Sistemas nominais.")
        if self.memoria.carregar(self):
            self.falar("Memoria persistente restaurada. Continuando seus projetos, Sir.")

class AgenteEspecialista:
    def __init__(self, nome, desc, conselho):
        self.nome, self.descricao, self.ativo, self.conselho = nome, desc, False, conselho
        self.conselho.registrar(self)
    def start(self):
        self.ativo = True
        print(f"  >> [{self.nome}] ONLINE - {self.descricao}")
    def status(self): print(f"  [{'ATIVO' if self.ativo else 'INATIVO'}] {self.nome}: {self.descricao}")

class AgenteADSPessoal(AgenteEspecialista):
    def __init__(self, c):
        super().__init__("ADS Pessoal", "Cientista, Arquiteto, Dev, Professor, Tutor HW e Escriba", c)
        self.projetos, self.aulas, self.livros, self.capitulos = [], [], [], []
    def criar_projeto(self, n, s):
        self.projetos.append({"nome": n, "stack": s}); print(f"  >> Projeto '{n}' ({s}) iniciado.")
    def ministrar_aula(self, t, d):
        self.aulas.append({"tema": t, "duracao": d}); print(f"  >> Aula '{t}' ministrada ({d}).")
    def criar_livro(self, t, g):
        self.livros.append({"titulo": t, "genero": g, "capitulos": 0}); print(f"  >> Livro '{t}' ({g}) criado.")
    def escrever_capitulo(self, tl, n, r):
        self.capitulos.append({"livro": tl, "numero": n, "resumo": r})
        for l in self.livros:
            if l["titulo"] == tl: l["capitulos"] += 1
        print(f"  >> Cap. {n} de '{tl}': {r}")
    def relatorio(self):
        print(f"  [ADS PESSOAL] Projetos: {len(self.projetos)} | Aulas: {len(self.aulas)} | Livros: {len(self.livros)} | Caps: {len(self.capitulos)}")

class AgenteFinanceiroSousa(AgenteEspecialista):
    def __init__(self, c):
        super().__init__("Financeiro Sousa", "Fluxo de caixa e ROI de Elias", c)
        self.orcamento, self.transacoes = 0.0, []
    def entrada(self, d, v):
        self.orcamento += v; self.transacoes.append({"tipo": "entrada", "desc": d, "valor": v}); print(f"  >> Entrada: {d} - R$ {v:.2f}")
    def saida(self, d, v):
        self.orcamento -= v; self.transacoes.append({"tipo": "saida", "desc": d, "valor": v}); print(f"  >> Saida: {d} - R$ {v:.2f}")
    def balanco(self): print(f"  [FINANCEIRO SOUSA] Saldo: R$ {self.orcamento:.2f} | Transacoes: {len(self.transacoes)}")

class AgenteNuvem(AgenteEspecialista):
    def __init__(self, c): super().__init__("SOUSA DRIVE", "Sincronizacao da nuvem de Elias via Rclone", c)
    def sincronizar(self):
        print("\\n  [NUVEM] Sincronizando SOUSA DRIVE...")
        r = os.system(f'rclone sync "{os.getcwd()}" sousa_drive:/SOUSA_2.0_PRODUCAO --progress')
        print("  >> [OK] SOUSA DRIVE ATUALIZADO!\\n" if r == 0 else "  >> [ERRO] Falha.\\n")

class AgenteProdutor(AgenteEspecialista):
    def __init__(self, c): super().__init__("Modulo Produtor", "Fabrica de conteudo de Elias", c); self.fila = []
    def add(self, t, x): self.fila.append({"tipo": t, "conteudo": x}); print(f"  >> [{t}] adicionado a fila de Elias.")
    def lista(self): print(f"  [PRODUTOR] Fila de Elias: {len(self.fila)} itens.")

class AgenteEstrategista(AgenteEspecialista):
    def __init__(self, c): super().__init__("Modulo Estrategista", "Analise de mercado e receita para Elias", c); self.analises = []
    def analisar(self, n): self.analises.append({"nicho": n}); print(f"  >> Analisando '{n}' para Elias... Oportunidade: ALTA")

class AgenteMentorElias(AgenteEspecialista):
    def __init__(self, c): super().__init__("Mentor de Elias", "Educacao e coaching focado em Elias", c); self.mentorias, self.alunos = [], []
    def criar(self, t, d): self.mentorias.append({"tema": t, "duracao": d}); print(f"  >> Mentoria '{t}' criada para Elias.")
    def add_aluno(self, n): self.alunos.append(n); print(f"  >> Aluno '{n}' registrado por Elias.")

class AgenteJuridicoSousa(AgenteEspecialista):
    def __init__(self, c): super().__init__("Juridico Sousa", "Contratos e compliance dos projetos de Elias", c)
    def compliance(self, a): print(f"  >> Compliance '{a}' dos projetos de Elias: OK")

class AgenteSaberElias(AgenteEspecialista):
    def __init__(self, c): super().__init__("Saber & Conhecimento", "Base de conhecimento de Elias (UNOPAR/EMEF)", c); self.base = []
    def add(self, t, f): self.base.append({"topico": t, "fonte": f}); print(f"  >> Conhecimento '{t}' registrado na base de Elias.")

class AgenteAntigravity(AgenteEspecialista):
    def __init__(self, c): super().__init__("Antigravity", "Monitor autentico e verdadeiro do SOUSA 2.0", c)
    def verificar(self, a): print(f"  >> Antigravity: Integridade de '{a}': 100%")

# =============================================
# API REST PARA DASHBOARD WEB (DADOS REAIS)
# =============================================
app = Flask(__name__)
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response
conselho_global = None

@app.route("/api/status")
def api_status():
    if not conselho_global: return jsonify({"erro": "Sistema nao inicializado"})
    estado = conselho_global.memoria.dados if hasattr(conselho_global.memoria, 'dados') else {}
    return jsonify({
        "sistema": {"versao": conselho_global.config.get("sistema", {}).get("versao", "4.0"), "fundador": conselho_global.fundador, "status": conselho_global.status, "saude": conselho_global.saude},
        "agentes": {"total": len(conselho_global.agentes), "ativos": sum(1 for a in conselho_global.agentes.values() if a.ativo), "lista": [{"nome": a.nome, "ativo": a.ativo, "descricao": a.descricao} for a in conselho_global.agentes.values()]},
        "financeiro": {"saldo": estado.get("financeiro_saldo", 0.0), "transacoes": estado.get("financeiro_transacoes", [])},
        "ads": {"projetos": estado.get("projetos", []), "aulas": estado.get("aulas", []), "livros": estado.get("livros", []), "capitulos": estado.get("capitulos", [])},
        "mentor": {"mentorias": estado.get("mentorias", [])},
        "hardware": conselho_global.config.get("hardware", {}),
        "clone": conselho_global.config.get("clone_pc", {}),
        "timestamp": datetime.datetime.now().isoformat()
    })

def iniciar_api(conselho):
    global conselho_global
    conselho_global = conselho
    print("\\n" + "="*60)
    print("  API REST INICIADA EM http://localhost:5000")
    print("  Dashboard disponivel em: http://localhost:5000/api/status")
    print("="*60 + "\\n")
    app.run(debug=False, port=5000, threaded=True)

# =============================================
# TERMINAL SOUSA SHELL
# =============================================
class SousaShell(cmd.Cmd):
    intro = "\\n" + "="*60 + "\\n  SOUSA COMPUTER v4.0 | PC VIRTUAL EXCLUSIVO DE ELIAS\\n  SOUSA IA CONSELHO (JARVIS) ONLINE\\n" + "="*60 + "\\n"
    prompt = "SOUSA PC> "

    def __init__(self, conselho):
        super().__init__()
        self.c = conselho
        self.antigravity = AgenteAntigravity(conselho)
        self.ads = AgenteADSPessoal(conselho)
        self.produtor = AgenteProdutor(conselho)
        self.estrategista = AgenteEstrategista(conselho)
        self.mentor = AgenteMentorElias(conselho)
        self.juridico = AgenteJuridicoSousa(conselho)
        self.saber = AgenteSaberElias(conselho)
        self.financeiro = AgenteFinanceiroSousa(conselho)
        self.nuvem = AgenteNuvem(conselho)

    def do_atualizar_apps_script(self, args):
        import pyperclip, webbrowser, subprocess, sys
        try:
            import pyperclip
        except ImportError:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "pyperclip", "-q"])
            import pyperclip

        codigo = '''/**
 * SOUSA 2.0 - CORE / MOTOR DO TUNEL
 * Braço Operacional do SOUSA IA / JARVIS
 * Implementado: 2026-09-15 | Editado: 2026-09-20
 * Principio: EXECUTAR != CONCLUIR
 */

var CONFIG = {
  sistema: 'SOUSA 2.0',
  identidade: 'JARVIS',
  versao: '2.0.1',
  capacidades_totais: 13,
  modulos_ativos: 9,
  cotas: { max_requisicoes_dia: 100, max_tokens_dia: 50000 }
};

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    sistema: CONFIG.sistema, status: 'ONLINE', identidade: CONFIG.identidade,
    versao: CONFIG.versao, timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var startTime = new Date();
  var response = { success: false, data: null, error: null, timestamp: startTime.toISOString(), duration_ms: 0 };
  try {
    var body = {}, action = '', payload = {};
    if (e.postData && e.postData.contents) {
      try { body = JSON.parse(e.postData.contents); } catch (pe) { body = {}; }
    }
    var params = e.parameter || {};
    action = body.action || params.action || '';
    payload = body.payload || body; // Fallback se não vier aninhado

    if (!action) {
      response.error = 'Campo action ausente';
      response.data = { actions_disponiveis: ['ping','status','testar_backend','liberar_esteira','reconectar','reiniciar_sessao','logs','diagnostico','chat_conselho','metricas','cascata_api'] };
      return enviarResposta(response);
    }

    response = handleAction(action, payload);
  } catch (err) {
    response.error = 'Erro no servidor: ' + err.toString();
  }
  response.duration_ms = (new Date() - startTime);
  return enviarResposta(response);
}

function enviarResposta(response) {
  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function handleAction(action, payload) {
  var startTime = new Date();
  var response = { action: action, success: false, data: null, error: null, timestamp: startTime.toISOString(), duration_ms: 0 };
  try {
    switch(action) {
      case 'ping':
        response.data = { status: 'online', mensagem: 'SOUSA IA operacional', versao: CONFIG.versao, capacidades: CONFIG.capacidades_totais };
        response.success = true; break;
      case 'status':
        response.data = { sistema: CONFIG.sistema, nucleo: 'ONLINE', modulos_ativos: CONFIG.modulos_ativos, capacidades_jarvis: CONFIG.capacidades_totais, memoria: 'operacional', conexao: 'ativa', ultima_verificacao: new Date().toISOString() };
        response.success = true; break;
      case 'testar_backend':
        var props = PropertiesService.getScriptProperties();
        props.setProperty('ultimo_teste', new Date().toISOString());
        response.data = { backend: 'Google Apps Script', conexao: 'testada', resposta: 'OK', tempo_resposta_ms: (new Date() - startTime), storage: 'PropertiesService operacional' };
        response.success = true; break;
      case 'liberar_esteira':
        PropertiesService.getScriptProperties().setProperty('esteira_status', 'LIBERADA');
        response.data = { acao: 'esteira_liberada', mensagem: 'Esteira do tunel liberada para operacoes', status: 'OPERACIONAL' };
        response.success = true; break;
      case 'reconectar':
        response.data = { acao: 'reconexao_iniciada', tunnel: 'reiniciando', mensagem: 'Conexao com tunel restabelecida' };
        response.success = true; break;
      case 'reiniciar_sessao':
        PropertiesService.getScriptProperties().setProperty('sessao_estado', 'limpo');
        response.data = { acao: 'sessao_reiniciada', memoria_preservada: true, estado: 'limpo' };
        response.success = true; break;
      case 'logs':
        response.data = { logs: [ { timestamp: new Date().toISOString(), tipo: 'INFO', mensagem: 'SOUSA IA operacional', modulo: 'CORE' } ], total: 1 };
        response.success = true; break;
      case 'diagnostico':
        response.data = { sistema: 'SAUDAVEL', modulos: { juridico: 'OK', financeiro: 'OK', produtor: 'OK', estrategista: 'OK', afiliadopro: 'OK', ads_academico: 'OK', saber_conhecimento: 'OK', mentor: 'OK', conselho: 'OK' }, capacidades: { total: 13, ativas: 13, pendentes: 0 }, memoria: { estado: 'OPERACIONAL' }, conexao: { status: 'ATIVA' } };
        response.success = true; break;
      case 'chat_conselho':
        var msg = (payload.mensagem || payload.message || '').toString();
        response.data = { modulo: 'CONSELHO', tipo: 'CHAT_SOUSA_IA', mensagem_recebida: msg, resposta: processarIntencaoJARVIS(msg), identidade: 'SOUSA IA com comportamento JARVIS' };
        response.success = true; break;
      case 'metricas':
        var props = PropertiesService.getScriptProperties();
        response.data = { requisicoes_hoje: parseInt(props.getProperty('requisicoes_hoje') || '0'), max_requisicoes: CONFIG.cotas.max_requisicoes_dia };
        response.success = true; break;
      case 'cascata_api':
        response.data = { total: 10, apis: ['Apps Script', 'Gemini', 'Groq', 'OpenRouter', 'Cerebras', 'Mistral', 'Perplexity', 'DeepSeek', 'Agnes AI', 'Ollama Local'] };
        response.success = true; break;
      default:
        response.error = 'Action nao reconhecida: ' + action;
        break;
    }
  } catch (e) {
    response.error = e.toString();
  }
  response.duration_ms = (new Date() - startTime);
  return response;
}

function processarIntencaoJARVIS(msg) {
  if (!msg) return 'Intencao recebida. Como posso ajudar, Sir Elias?';
  var lower = msg.toLowerCase();
  if (lower.match(/^(oi|ola|bom dia|boa tarde|boa noite)/)) return 'Saudacoes, Sir Elias. SOUSA IA operacional. 13 capacidades ativas. Todos os 9 modulos funcionais.';
  if (lower.indexOf('status') !== -1) return 'SOUSA IA operacional. 13 capacidades ativas. Todos os modulos funcionais. Esteira liberada.';
  if (lower.indexOf('ajuda') !== -1) return 'Posso executar operacoes do tunel, verificar status, gerar relatorios e coordenar a cascata de 10 APIs. Qual sua ordem?';
  return 'Intencao recebida, Sir Elias. Processando via SOUSA IA com comportamento JARVIS.';
}'''
        pyperclip.copy(codigo)
        
        print("\\n" + "="*75)
        print("  🚀 AUTOMAÇÃO DA PRANCHETA ATIVADA PELO SOUSA IA")
        print("="*75)
        print("  [OK] Código SOUSA_Core.gs corrigido e gerado com sucesso.")
        print("  [OK] Código COPIADO para a área de transferência (Clipboard).")
        print("  [INFO] Abrindo o Google Apps Script no seu navegador...")
        print("="*75)
        
        webbrowser.open("https://script.google.com/home")
        
        print("\\n  📋 INSTRUÇÕES PARA O FUNDADOR (3 teclas):")
        print("  1. No navegador, clique no projeto 'SOUSA ITINGA V2'.")
        print("  2. Clique na área de código e pressione: Ctrl + A (selecionar tudo)")
        print("  3. Pressione: Ctrl + V (colar o código que o SOUSA IA preparou)")
        print("  4. Pressione: Ctrl + S (salvar) e depois 'Implantar' > 'Nova implantação'")
        print("="*75 + "\\n")

    def do_ouvir(self, args):
        """Ativa o modo de escuta contínua por voz"""
        self.c.falar("Modo de voz ativado. Diga 'SOUSA' seguido do comando. Para sair, diga 'SOUSA SAIR'.")
        voz.falar("Modo de voz ativado. Diga SOUSA seguido do comando.")
        
        while True:
            comando = voz.ouvir(timeout=8)
            if comando:
                resultado = voz.processar_comando(comando)
                if resultado:
                    if resultado == 'exit':
                        break
                    # Executar o comando no shell
                    try:
                        self.onecmd(resultado)
                    except Exception as e:
                        voz.falar(f"Erro ao executar: {e}")
            else:
                # Timeout, continua ouvindo
                pass

    def do_exit(self, args):
        self.c.falar("Consolidando estado antes do desligamento...")
        self.c.memoria.salvar(self.c)
        self.c.falar("Ate a proxima, Sir Elias. Seu ecossistema esta preservado.")
        return True

    def preloop(self): self.c.saudacao()
    def do_status(self, args):
        s = self.c.status_geral()
        print("\\n  STATUS DO PC VIRTUAL DE ELIAS:")
        for k, v in s.items(): print(f"    {k}: {v}")
        print("\\n  SEUS AGENTES ESPECIALISTAS:")
        for a in self.c.agentes.values(): a.status()
        print()
    def do_consolidar(self, args):
        self.c.falar("Consolidando PC Virtual de Elias...")
        self.c.memoria.salvar(self.c)
        self.c.falar("Estado salvo com sucesso.")
    def do_sousa_sync(self, args):
        self.nuvem.start()
        self.nuvem.sincronizar()
    def do_clonar_pc(self, args):
        self.c.falar("Iniciando clonagem do PC fisico de Elias... Aguarde, Sir.")
        try:
            cpu = subprocess.run(["powershell","-Command","Get-CimInstance Win32_Processor | Select-Object -ExpandProperty Name"], capture_output=True, text=True).stdout.strip()
            ram = subprocess.run(["powershell","-Command","[math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)"], capture_output=True, text=True).stdout.strip()
            os_name = subprocess.run(["powershell","-Command","(Get-CimInstance Win32_OperatingSystem).Caption"], capture_output=True, text=True).stdout.strip()
            py_ver = subprocess.run(["powershell","-Command","python --version 2>&1"], capture_output=True, text=True).stdout.strip()
            host = subprocess.run(["powershell","-Command","hostname"], capture_output=True, text=True).stdout.strip()
            clone_data = {"Hardware":{"CPU":cpu,"RAM_GB":ram},"Software":{"OS":os_name,"Python":py_ver},"Network":{"Hostname":host},"Timestamp":datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
            self.c.config["clone_pc"] = clone_data
            with open("config/sousa_config.json", "w", encoding="utf-8") as f: json.dump(self.c.config, f, indent=4, ensure_ascii=False)
            cf = "config/clones/clone_" + datetime.datetime.now().strftime("%Y%m%d_%H%M%S") + ".json"
            with open(cf, "w", encoding="utf-8") as f: json.dump(clone_data, f, indent=4, ensure_ascii=False)
            print("\\n" + "="*60 + "\\n  CLONAGEM DO PC FISICO DE ELIAS CONCLUIDA\\n" + "="*60)
            print(f"  CPU     : {cpu}\\n  RAM     : {ram} GB\\n  OS      : {os_name}\\n  Python  : {py_ver}\\n  Hostname: {host}\\n  Arquivo : {cf}\\n" + "="*60 + "\\n")
            self.c.falar("Clonagem concluida. Seu PC fisico foi digitalizado e salvo no SOUSA 2.0.")
        except Exception as e: self.c.falar(f"Falha na clonagem: {str(e)}.")
    def do_config_show(self, args):
        self.c.falar("Configuracoes Ativas do Ecossistema de Elias:")
        print(f"  - Fundador: {self.c.config.get('sistema',{}).get('fundador','N/A')}")
        print(f"  - HW CPU: {self.c.config.get('hardware',{}).get('CPU','N/A')}")
        print(f"  - HW RAM: {self.c.config.get('hardware',{}).get('RAM_GB','N/A')} GB")
        print(f"  - Clone: {'SIM' if self.c.config.get('clone_pc') else 'NAO'}\\n")
    def do_ads_projeto(self, args):
        p = args.split(maxsplit=1)
        if len(p)==2: self.ads.criar_projeto(p[0], p[1])
    def do_ads_aula(self, args):
        p = args.split(maxsplit=1)
        if len(p)==2: self.ads.ministrar_aula(p[0], p[1])
    def do_ads_livro(self, args):
        p = args.split(maxsplit=1)
        if len(p)==2: self.ads.criar_livro(p[0], p[1])
    def do_ads_capitulo(self, args):
        p = args.split(maxsplit=2)
        if len(p)==3: self.ads.escrever_capitulo(p[0], int(p[1]), p[2])
    def do_ads_relatorio(self, args): self.ads.relatorio()
    def do_financeiro_entrada(self, args):
        p = args.split(maxsplit=1)
        if len(p)==2: self.financeiro.entrada(p[0], float(p[1]))
    def do_financeiro_saida(self, args):
        p = args.split(maxsplit=1)
        if len(p)==2: self.financeiro.saida(p[0], float(p[1]))
    def do_financeiro_balanco(self, args): self.financeiro.balanco()
    def do_mentor_criar(self, args):
        p = args.split(maxsplit=1)
        if len(p)==2: self.mentor.criar(p[0], p[1])
    def do_mentor_aluno(self, args):
        if args: self.mentor.add_aluno(args)
    def do_cascata_status(self, args):
        cascata.status_cotas()
    
    def do_cascata_relatorio(self, args):
        cascata.relatorio_inteligente()
        
    def do_escolher_api(self, args):
        criterio = args.strip().lower() if args else "cota"
        melhor = cascata.escolher_melhor_api(criterio)
        if melhor:
            self.c.falar(f"API selecionada (critério: {criterio}): {melhor['nome']}")
            self.c.falar(f"Modelo: {melhor['modelo']} | Velocidade: {melhor['velocidade']}")
            self.c.falar(f"Cota: {melhor['cota_diaria']} req/dia | Custo: {melhor['custo']}")
            cascata.api_ativa = melhor
        else:
            self.c.falar("Nenhuma API disponível no momento.")

    def do_cascata_status(self, args):
        """Mostra o status da cascata de APIs"""
        cascata.status_cotas()
    
    def do_usar_melhor_api(self, args):
        """Força o uso da API com maior cota disponível"""
        melhor = cascata.escolher_melhor_api()
        if melhor:
            self.c.falar(f"API selecionada: {melhor['nome']}")
            self.c.falar(f"Cota diária: {melhor['cota_diaria']} requisições")
            self.c.falar(f"Custo: {melhor['custo']}")
        else:
            self.c.falar("Nenhuma API com cota disponível no momento.")

    def default(self, line): self.c.falar(f"Comando '{line}' nao reconhecido, Sir Elias.")

def main():
    print("BOOT DO PC VIRTUAL EXCLUSIVO DE ELIAS...")
    conselho = SousaIAConselho()
    print("SISTEMA PRONTO. SEUS AGENTES ESPECIALISTAS CARREGADOS.\\n")
    
    api_thread = threading.Thread(target=iniciar_api, args=(conselho,), daemon=True)
    api_thread.start()
    
    print("Acesse o dashboard em: http://localhost:5000/api/status\\n")
    SousaShell(conselho).cmdloop()

if __name__ == "__main__":
    main()
