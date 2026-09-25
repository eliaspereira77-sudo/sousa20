/**
 * SOUSA 2.0 - BACKEND LOCAL
 * Servidor HTTP minimalista para processar comandos
 */

const express = require('express');
const Gemini = require('./01_CORE/SOUSA_Gemini_CLIENT.js');

const app = express();
const PORT = 3000;

app.use(express.json());

// Health check
app.get('/ping', (req, res) => {
    res.json({ status: 'online', timestamp: new Date().toISOString() });
});

// Status do sistema
app.get('/status', (req, res) => {
    res.json({
        uptime: process.uptime(),
        memoria: process.memoryUsage(),
        node: process.version,
        timestamp: new Date().toISOString()
    });
});

// Processar comando via IA
app.post('/comando', async (req, res) => {
    try {
        const { comando, dados } = req.body;
        console.log([BACKEND] Comando recebido: );
        
        let resposta;
        switch(comando) {
            case 'chat_conselho':
                resposta = await Gemini.gerarResposta(dados.mensagem);
                break;
            default:
                resposta = Comando não reconhecido: ;
        }
        
        res.json({ sucesso: true, resposta });
    } catch(e) {
        res.status(500).json({ erro: e.message });
    }
});

app.listen(PORT, () => {
    console.log([BACKEND] SOUSA 2.0 rodando em http://localhost:);
});
