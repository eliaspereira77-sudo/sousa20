/**
 * SOUSA 2.0 - MEMORIA SOBERANA
 * O cerebro persistente do SOUSA.
 * Nao depende de IA externa, nuvem ou ferramenta terceira.
 */

const fs = require('fs');
const path = require('path');

const PASTA_MEMORIA = path.join(__dirname, '..', 'SOUSA_MEMORIA');

const SOUSA_MEMORIA = {
    carregar() {
        return {
            identidade: this.ler('identidade.json'),
            estado_atual: this.ler('estado_atual.json'),
            erros_aprendidos: this.ler('erros_aprendidos/registro.json'),
            historico_hoje: this.ler('historico/' + new Date().toISOString().split('T')[0] + '.json')
        };
    },
    
    ler(arquivo) {
        const caminho = path.join(PASTA_MEMORIA, arquivo);
        try {
            return JSON.parse(fs.readFileSync(caminho, 'utf8'));
        } catch(e) {
            return null;
        }
    },
    
    gravar(arquivo, dados) {
        const caminho = path.join(PASTA_MEMORIA, arquivo);
        const pasta = path.dirname(caminho);
        if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, {recursive: true});
        fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
    },
    
    atualizarEstado(novosDados) {
        const estado = this.ler('estado_atual.json') || {};
        const atualizado = Object.assign({}, estado, novosDados, {ultima_sessao: new Date().toISOString()});
        this.gravar('estado_atual.json', atualizado);
        return atualizado;
    },
    
    registrarErro(contexto, erro, causa, licao) {
        const registro = this.ler('erros_aprendidos/registro.json') || {erros: []};
        registro.erros.push({
            data: new Date().toISOString().split('T')[0],
            contexto: contexto,
            erro: erro,
            causa: causa,
            licao: licao
        });
        this.gravar('erros_aprendidos/registro.json', registro);
    },
    
    jaErrouAntes(descricao) {
        const registro = this.ler('erros_aprendidos/registro.json');
        if (!registro) return false;
        return registro.erros.some(function(e) {
            return e.erro.toLowerCase().indexOf(descricao.toLowerCase()) !== -1;
        });
    },
    
    registrarFerramenta(nome, tipo, proposito) {
        const arquivo = 'ferramentas_geradas/' + nome.toLowerCase().replace(/\s+/g,'_') + '.json';
        this.gravar(arquivo, {
            nome: nome,
            tipo: tipo,
            proposito: proposito,
            criada_em: new Date().toISOString(),
            status: 'ATIVA'
        });
    },
    
    listarFerramentas() {
        const pasta = path.join(PASTA_MEMORIA, 'ferramentas_geradas');
        if (!fs.existsSync(pasta)) return [];
        return fs.readdirSync(pasta)
            .filter(function(f) { return f.endsWith('.json'); })
            .map(function(f) { return JSON.parse(fs.readFileSync(path.join(pasta, f), 'utf8')); });
    },
    
    consultar() {
        const mem = this.carregar();
        console.log('=== SOUSA MEMORIA SOBERANA ===');
        console.log('Proximo passo:', mem.estado_atual ? mem.estado_atual.proximo_passo : 'nao definido');
        console.log('Erros a evitar:', mem.erros_aprendidos ? mem.erros_aprendidos.erros.length : 0);
        console.log('Ferramentas geradas:', this.listarFerramentas().length);
        console.log('Ultima sessao:', mem.estado_atual ? mem.estado_atual.ultima_sessao : 'primeira sessao');
        return mem;
    }
};

if (require.main === module) {
    SOUSA_MEMORIA.consultar();
}

module.exports = SOUSA_MEMORIA;
