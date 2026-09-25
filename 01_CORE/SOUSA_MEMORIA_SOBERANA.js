/**
 * SOUSA 2.0 - MEMORIA SOBERANA
 * O cerebro persistente do SOUSA.
 * Nao depende de IA externa, nuvem ou ferramenta terceira.
 */

const fs = require('fs');
const path = require('path');

const PASTA_MEMORIA = path.join(__dirname, 'SOUSA_MEMORIA');

const SOUSA_MEMORIA = {
    // Carregar tudo de uma vez
    carregar() {
        return {
            identidade: this.ler('identidade.json'),
            estado_atual: this.ler('estado_atual.json'),
            erros_aprendidos: this.ler('erros_aprendidos/registro.json'),
            historico_hoje: this.ler(historico/.json)
        };
    },
    
    // Ler arquivo JSON
    ler(arquivo) {
        const caminho = path.join(PASTA_MEMORIA, arquivo);
        try {
            return JSON.parse(fs.readFileSync(caminho, 'utf8'));
        } catch(e) {
            return null;
        }
    },
    
    // Gravar arquivo JSON
    gravar(arquivo, dados) {
        const caminho = path.join(PASTA_MEMORIA, arquivo);
        const pasta = path.dirname(caminho);
        if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, {recursive: true});
        fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
    },
    
    // Atualizar estado atual
    atualizarEstado(novosDados) {
        const estado = this.ler('estado_atual.json') || {};
        const atualizado = {...estado, ...novosDados, ultima_sessao: new Date().toISOString()};
        this.gravar('estado_atual.json', atualizado);
        return atualizado;
    },
    
    // Registrar licao aprendida
    registrarErro(contexto, erro, causa, licao) {
        const registro = this.ler('erros_aprendidos/registro.json') || {erros: []};
        registro.erros.push({
            data: new Date().toISOString().split('T')[0],
            contexto, erro, causa, licao,
            evitar_de: erro.toLowerCase()
        });
        this.gravar('erros_aprendidos/registro.json', registro);
    },
    
    // Verificar se erro ja foi aprendido
    jaErrouAntes(descricao) {
        const registro = this.ler('erros_aprendidos/registro.json');
        if (!registro) return false;
        return registro.erros.some(e => 
            e.erro.toLowerCase().includes(descricao.toLowerCase())
        );
    },
    
    // Registrar ferramenta gerada
    registrarFerramenta(nome, tipo, proposito) {
        const arquivo = erramentas_geradas/.json;
        this.gravar(arquivo, {
            nome, tipo, proposito,
            criada_em: new Date().toISOString(),
            status: 'ATIVA'
        });
    },
    
    // Listar todas as ferramentas geradas
    listarFerramentas() {
        const pasta = path.join(PASTA_MEMORIA, 'ferramentas_geradas');
        if (!fs.existsSync(pasta)) return [];
        return fs.readdirSync(pasta)
            .filter(f => f.endsWith('.json'))
            .map(f => JSON.parse(fs.readFileSync(path.join(pasta, f), 'utf8')));
    },
    
    // Consulta rapida (usada antes de qualquer acao)
    consultar() {
        const mem = this.carregar();
        console.log('=== SOUSA MEMORIA SOBERANA ===');
        console.log('Proximo passo:', mem.estado_atual?.proximo_passo);
        console.log('Erros a evitar:', mem.erros_aprendidos?.erros?.length || 0);
        console.log('Ferramentas geradas:', this.listarFerramentas().length);
        console.log('Ultima sessao:', mem.estado_atual?.ultima_sessao);
        return mem;
    }
};

if (require.main === module) {
    SOUSA_MEMORIA.consultar();
}

module.exports = SOUSA_MEMORIA;
