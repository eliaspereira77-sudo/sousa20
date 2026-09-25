/**
 * SOUSA 2.0 - RECONHECEDOR DE AMBIENTE AUTOMÁTICO
 * Detecta e registra qualquer ambiente local automaticamente
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

const SOUSA_AMBIENTE = {
    arquivo_registro: 'AMBIENTES_REGISTRADOS.json',
    
    reconhecer() {
        const info = {
            id: this.gerarId(),
            timestamp: new Date().toISOString(),
            hostname: os.hostname(),
            plataforma: os.platform(),
            arquitetura: os.arch(),
            versao_so: os.release(),
            usuario: os.userInfo().username,
            cpus: os.cpus().length,
            memoria_total_gb: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2),
            memoria_livre_gb: (os.freemem() / 1024 / 1024 / 1024).toFixed(2),
            diretorio_atual: process.cwd(),
            node_version: process.version,
            capacidades_detectadas: this.detectarCapacidades()
        };
        
        console.log('=== SOUSA 2.0 - RECONHECIMENTO DE AMBIENTE ===');
        console.log(Máquina: );
        console.log(SO:   ());
        console.log(Usuário: );
        console.log(Node: );
        console.log(CPU:  cores);
        console.log(Memória:  GB total /  GB livre);
        console.log(Diretório: );
        console.log('');
        console.log('Capacidades detectadas:');
        info.capacidades_detectadas.forEach(cap => console.log(  - ));
        console.log('');
        
        this.registrar(info);
        return info;
    },
    
    detectarCapacidades() {
        const capacidades = [];
        const plataforma = os.platform();
        
        // Detectar sistema operacional
        if (plataforma === 'win32') capacidades.push('Windows Desktop');
        if (plataforma === 'linux') capacidades.push('Linux/Termux');
        if (plataforma === 'darwin') capacidades.push('macOS');
        
        // Detectar navegador
        if (typeof window !== 'undefined') capacidades.push('Navegador');
        
        // Detectar Termux
        if (process.env.PREFIX && process.env.PREFIX.includes('termux')) {
            capacidades.push('Termux');
        }
        
        // Detectar GAS
        if (typeof GasApp !== 'undefined' || typeof DriveApp !== 'undefined') {
            capacidades.push('Google Apps Script');
        }
        
        // Detectar Node.js
        if (typeof require !== 'undefined') capacidades.push('Node.js');
        
        // Detectar Python
        try {
            require('child_process').execSync('python --version', {stdio: 'pipe'});
            capacidades.push('Python');
        } catch(e) {}
        
        // Detectar Git
        try {
            require('child_process').execSync('git --version', {stdio: 'pipe'});
            capacidades.push('Git');
        } catch(e) {}
        
        return capacidades;
    },
    
    gerarId() {
        return ${os.hostname()}-;
    },
    
    registrar(info) {
        let registros = [];
        
        if (fs.existsSync(this.arquivo_registro)) {
            try {
                registros = JSON.parse(fs.readFileSync(this.arquivo_registro, 'utf8'));
            } catch(e) {
                registros = [];
            }
        }
        
        // Verificar se já existe registro desta máquina
        const existente = registros.find(r => r.hostname === info.hostname);
        if (existente) {
            existente.ultima_conexao = info.timestamp;
            existente.capacidades_detectadas = info.capacidades_detectadas;
            console.log(Ambiente já registrado. Atualizado em );
        } else {
            registros.push(info);
            console.log(NOVO ambiente registrado: );
        }
        
        fs.writeFileSync(this.arquivo_registro, JSON.stringify(registros, null, 2));
        console.log(Registro salvo em: );
    },
    
    listarAmbientes() {
        if (!fs.existsSync(this.arquivo_registro)) {
            console.log('Nenhum ambiente registrado');
            return [];
        }
        const registros = JSON.parse(fs.readFileSync(this.arquivo_registro, 'utf8'));
        console.log(Ambientes registrados: );
        registros.forEach(r => {
            console.log(  -  () - Último: );
        });
        return registros;
    }
};

// Executar reconhecimento automaticamente ao ser chamado
if (require.main === module) {
    SOUSA_AMBIENTE.reconhecer();
    console.log('');
    SOUSA_AMBIENTE.listarAmbientes();
}

module.exports = SOUSA_AMBIENTE;
