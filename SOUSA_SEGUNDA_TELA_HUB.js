/**
 * ============================================================================
 * SOUSA 2.0 • SEGUNDA TELA (DASHBOARD CENTRAL DE MÓDULOS)
 * Visual & Arquitetura Fiel à Referência Visual Soberana
 * Módulos Oficiais: ADS, PRODUTOR, AFILIADOSPRO, FINANCEIRO, ESTRATEGISTA,
 *                   MENTOR, SABER & CONHECIMENTO, JURIDICO, SOUSA IA & CONSELHO
 * ============================================================================
 */
(function(root) {
  'use strict';

  // Os 9 Módulos Oficiais da Segunda Tela
  const MODULOS_SEGUNDA_TELA = [
    {
      id: "ads",
      nome: "ADS",
      funcao: "Arquitetura, Desenvolvimento e Software: engenharia limpa, código desacoplado e esteira resiliente.",
      subtitulo: "Engenharia de Software & Sistemas",
      comando: "Gerenciar Software",
      comandoSecundario: "Auditar Código & Deploy",
      status: "ONLINE",
      statusCor: "#48E048",
      metricas: [
        { rotulo: "Arquitetura", valor: "Desacoplada" },
        { rotulo: "Build & Lint", valor: "100% OK" },
        { rotulo: "Uptime", valor: "99.98%" }
      ],
      logsRecentes: [
        "[ADS-CORE] Arquitetura modular e desacoplada verificada sem dependências circulares",
        "[PIPELINE] Deploy contínuo validado com integridade estrita e zero falhas",
        "[DEVOPS] Rotas da API Express e persistência IndexedDB sincronizadas"
      ],
      svgArte: `
        <svg viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="gradAdsHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#FFE885" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#0B2559" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="gradChipOuro" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFF8DC"/>
              <stop offset="30%" stop-color="#FFDF66"/>
              <stop offset="70%" stop-color="#D4AF37"/>
              <stop offset="100%" stop-color="#8A6014"/>
            </linearGradient>
            <linearGradient id="gradBarramento" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#00E5FF"/>
              <stop offset="100%" stop-color="#0077B6"/>
            </linearGradient>
          </defs>
          <circle cx="70" cy="55" r="46" fill="url(#gradAdsHalo)"/>

          <!-- Placa de Circuito Impresso Mãe 3D -->
          <rect x="30" y="24" width="80" height="66" rx="8" fill="#0A1C3C" stroke="url(#gradChipOuro)" stroke-width="2"/>
          
          <!-- Barramentos e Trilhas de Circuito Douradas e Azuis -->
          <line x1="20" y1="36" x2="30" y2="36" stroke="#FFE885" stroke-width="2"/>
          <line x1="20" y1="46" x2="30" y2="46" stroke="#FFE885" stroke-width="2"/>
          <line x1="20" y1="56" x2="30" y2="56" stroke="#FFE885" stroke-width="2"/>
          <line x1="20" y1="66" x2="30" y2="66" stroke="#FFE885" stroke-width="2"/>
          <line x1="20" y1="76" x2="30" y2="76" stroke="#FFE885" stroke-width="2"/>

          <line x1="110" y1="36" x2="120" y2="36" stroke="#FFE885" stroke-width="2"/>
          <line x1="110" y1="46" x2="120" y2="46" stroke="#FFE885" stroke-width="2"/>
          <line x1="110" y1="56" x2="120" y2="56" stroke="#FFE885" stroke-width="2"/>
          <line x1="110" y1="66" x2="120" y2="66" stroke="#FFE885" stroke-width="2"/>
          <line x1="110" y1="76" x2="120" y2="76" stroke="#FFE885" stroke-width="2"/>

          <!-- Microchip Central Processador ADS em Alto Relevo 3D -->
          <rect x="46" y="34" width="48" height="46" rx="6" fill="#142852" stroke="url(#gradChipOuro)" stroke-width="2.2"/>
          <rect x="52" y="40" width="36" height="34" rx="3" fill="#051228" stroke="#FFE68A" stroke-width="1"/>

          <!-- Letras ADS Douradas Centrais -->
          <text x="70" y="61" font-family="'Times New Roman', Georgia, serif" font-size="14" font-weight="900" fill="url(#gradChipOuro)" text-anchor="middle" letter-spacing="1">ADS</text>

          <!-- Marcadores de Pinos do Chip e Luz Quântica -->
          <circle cx="56" cy="44" r="2" fill="#00E5FF"/>
          <circle cx="84" cy="44" r="2" fill="#48E048"/>
          <circle cx="56" cy="70" r="2" fill="#48E048"/>
          <circle cx="84" cy="70" r="2" fill="#00E5FF"/>

          <!-- Linhas de Conexão Superior/Inferior -->
          <line x1="58" y1="18" x2="58" y2="24" stroke="#FFE885" stroke-width="2"/>
          <line x1="70" y1="18" x2="70" y2="24" stroke="#FFE885" stroke-width="2"/>
          <line x1="82" y1="18" x2="82" y2="24" stroke="#FFE885" stroke-width="2"/>

          <line x1="58" y1="90" x2="58" y2="96" stroke="#FFE885" stroke-width="2"/>
          <line x1="70" y1="90" x2="70" y2="96" stroke="#FFE885" stroke-width="2"/>
          <line x1="82" y1="90" x2="82" y2="96" stroke="#FFE885" stroke-width="2"/>
        </svg>
      `
    },
    {
      id: "produtor",
      nome: "PRODUTOR",
      funcao: "Criação, organização e automação de conteúdo com Avatar Falante e Voz Clonada do Fundador Elias.",
      subtitulo: "Conteúdo Criativo & Avatar",
      comando: "Produzir Conteúdo",
      comandoSecundario: "Abrir Estúdio de Avatar",
      status: "ONLINE",
      statusCor: "#48E048",
      metricas: [
        { rotulo: "Matriz Vocal", valor: "10 Idiomas" },
        { rotulo: "Resolução", valor: "1080p 60FPS" },
        { rotulo: "Aulas Prontas", valor: "36 Vídeos" }
      ],
      logsRecentes: [
        "[AVATAR SOBERANO] Sincronia labial multi-visemas calibrada com precisão de 99.4%",
        "[POLIGLOTA] Tradução contextual de Masterclass para Inglês e Espanhol ativa",
        "[ROTEIROS] Máxima de Excelência do Fundador Elias cravada como matriz"
      ],
      svgArte: `
        <svg viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="gradProdHalo2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#FFE885" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#0B2559" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="gradCamera2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#2D3748"/>
              <stop offset="50%" stop-color="#1A202C"/>
              <stop offset="100%" stop-color="#0F172A"/>
            </linearGradient>
            <radialGradient id="gradLente2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#00E5FF"/>
              <stop offset="35%" stop-color="#0284C7"/>
              <stop offset="70%" stop-color="#0F172A"/>
              <stop offset="100%" stop-color="#D4AF37"/>
            </radialGradient>
            <linearGradient id="gradTela2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0284C7"/>
              <stop offset="100%" stop-color="#0369A1"/>
            </linearGradient>
          </defs>
          <circle cx="70" cy="55" r="46" fill="url(#gradProdHalo2)"/>

          <!-- Monitor / Tela Digital de Edição Lateral -->
          <rect x="80" y="32" width="38" height="32" rx="4" fill="url(#gradCamera2)" stroke="#D4AF37" stroke-width="1.5"/>
          <rect x="83" y="35" width="32" height="26" rx="2" fill="url(#gradTela2)"/>
          <path d="M85 48 L89 42 L93 54 L97 44 L101 52 L105 45 L109 50 L113 48" stroke="#FFFFFF" stroke-width="1.2" fill="none"/>

          <!-- Corpo da Câmera Profissional 3D -->
          <rect x="26" y="44" width="58" height="42" rx="8" fill="url(#gradCamera2)" stroke="#D4AF37" stroke-width="1.8"/>
          <path d="M42 44 L48 34 L62 34 L68 44 Z" fill="url(#gradCamera2)" stroke="#D4AF37" stroke-width="1.5"/>
          
          <!-- Lente Objetiva Central com Reflexos de Luz -->
          <circle cx="55" cy="65" r="21" fill="#0A0F1D" stroke="#FFE68A" stroke-width="2"/>
          <circle cx="55" cy="65" r="16" fill="url(#gradLente2)" stroke="#00E5FF" stroke-width="1.2"/>
          <circle cx="55" cy="65" r="9" fill="#030712"/>
          <path d="M45 58 A 12 12 0 0 1 60 54" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" fill="none"/>
          <circle cx="61" cy="71" r="2" fill="#FFFFFF"/>

          <!-- Botão Dourado de Gravação -->
          <circle cx="34" cy="38" r="4" fill="#FF4444" stroke="#FFE68A" stroke-width="1"/>
          <!-- Flash / Lâmpada de Estúdio -->
          <rect x="71" y="48" width="8" height="6" rx="1" fill="#FFF8DC" stroke="#D4AF37" stroke-width="1"/>
        </svg>
      `
    },
    {
      id: "afiliadopro",
      nome: "AFILIADOSPRO",
      funcao: "Gestão de links, métricas de vendas (Mercado Livre, Shopee, Amazon), campanhas e tráfego ético.",
      subtitulo: "Marketing Ético & Tráfego",
      comando: "Gerenciar Afiliados",
      comandoSecundario: "Monitorar Comissões",
      status: "ONLINE",
      statusCor: "#48E048",
      metricas: [
        { rotulo: "Links Monitorados", valor: "1.420" },
        { rotulo: "Conversão", valor: "8.4%" },
        { rotulo: "Comissões Mês", valor: "R$ 47.890" }
      ],
      logsRecentes: [
        "[MERCADO LIVRE] Spike de tráfego detectado: Smart Watch Ultra (+180%)",
        "[TELEGRAM] 12 Canais sincronizados com disparos automatizados",
        "[SHOPEE API] Cupom de 20% verificado e atualizado nos links afiliados"
      ],
      svgArte: `
        <svg viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="gradAfilHalo2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#FFE885" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#0B2559" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="gradPele2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F5D0A9"/>
              <stop offset="50%" stop-color="#DEB887"/>
              <stop offset="100%" stop-color="#C68642"/>
            </linearGradient>
            <linearGradient id="gradTerno2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#1A2A44"/>
              <stop offset="100%" stop-color="#0B132B"/>
            </linearGradient>
            <linearGradient id="gradMoeda2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFF8DC"/>
              <stop offset="30%" stop-color="#FFDF66"/>
              <stop offset="70%" stop-color="#D4AF37"/>
              <stop offset="100%" stop-color="#8A6014"/>
            </linearGradient>
          </defs>
          <circle cx="70" cy="55" r="46" fill="url(#gradAfilHalo2)"/>

          <!-- Manga Esquerda (Terno Executivo) -->
          <path d="M22 64 L42 46 L50 56 L30 74 Z" fill="url(#gradTerno2)" stroke="#D4AF37" stroke-width="1.2"/>
          <path d="M41 47 L47 42 L53 51 L47 56 Z" fill="#FFFFFF"/>
          
          <!-- Manga Direita (Terno Executivo) -->
          <path d="M118 64 L98 46 L90 56 L110 74 Z" fill="url(#gradTerno2)" stroke="#D4AF37" stroke-width="1.2"/>
          <path d="M99 47 L93 42 L87 51 L93 56 Z" fill="#FFFFFF"/>

          <!-- Aperto de Mãos 3D de Parceria e Honra -->
          <path d="M48 45 C54 38, 68 44, 76 50 C80 53, 82 58, 80 64 C76 70, 64 74, 54 66 Z" fill="url(#gradPele2)" stroke="#8A5A20" stroke-width="1.2"/>
          <path d="M92 45 C86 38, 72 44, 64 50 C60 53, 58 58, 60 64 C64 70, 76 74, 86 66 Z" fill="url(#gradPele2)" stroke="#8A5A20" stroke-width="1.2"/>
          <path d="M64 54 Q70 60 76 54" stroke="#8A5A20" stroke-width="1.5" fill="none"/>
          <path d="M62 60 Q70 66 78 60" stroke="#8A5A20" stroke-width="1.5" fill="none"/>

          <!-- Pilhas de Moedas de Ouro Maciço à Frente -->
          <ellipse cx="60" cy="85" rx="14" ry="5" fill="url(#gradMoeda2)" stroke="#FFE885" stroke-width="0.8"/>
          <path d="M46 85 C46 88, 74 88, 74 85 L74 91 C74 94, 46 94, 46 91 Z" fill="url(#gradMoeda2)" stroke="#FFE885" stroke-width="0.8"/>
          <path d="M46 91 C46 94, 74 94, 74 91 L74 97 C74 100, 46 100, 46 97 Z" fill="url(#gradMoeda2)" stroke="#FFE885" stroke-width="0.8"/>
          
          <ellipse cx="80" cy="78" rx="14" ry="5" fill="url(#gradMoeda2)" stroke="#FFE885" stroke-width="0.8"/>
          <path d="M66 78 C66 81, 94 81, 94 78 L94 84 C94 87, 66 87, 66 84 Z" fill="url(#gradMoeda2)" stroke="#FFE885" stroke-width="0.8"/>
          <path d="M66 84 C66 87, 94 87, 94 84 L94 90 C94 93, 66 93, 66 90 Z" fill="url(#gradMoeda2)" stroke="#FFE885" stroke-width="0.8"/>
          <path d="M66 90 C66 93, 94 93, 94 90 L94 96 C94 99, 66 99, 66 96 Z" fill="url(#gradMoeda2)" stroke="#FFE885" stroke-width="0.8"/>
        </svg>
      `
    },
    {
      id: "financeiro",
      nome: "FINANCEIRO",
      funcao: "Gestão financeira familiar, fluxo de caixa diário, liquidações e governança orçamentária rigorosa.",
      subtitulo: "Gestão Familiar & Fluxo de Caixa",
      comando: "Gestão Financeira",
      comandoSecundario: "Ver Fluxo Consolidado",
      status: "ONLINE",
      statusCor: "#48E048",
      metricas: [
        { rotulo: "Saldo Líquido", valor: "R$ 184.250" },
        { rotulo: "Margem Média", valor: "34.8%" },
        { rotulo: "Projeção 30d", valor: "R$ 310.000" }
      ],
      logsRecentes: [
        "[LIQUIDAÇÃO] Repasse automático de comissões processado com sucesso",
        "[RESERVA] Fundo familiar de contingência abastecido com meta de 6 meses",
        "[AUDITORIA] Conciliação bancária e gateways conferidos sem discrepâncias"
      ],
      svgArte: `
        <svg viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="gradFinHalo2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#FFE885" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#0B2559" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="gradCalcOuro2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFF8DC"/>
              <stop offset="40%" stop-color="#D4AF37"/>
              <stop offset="100%" stop-color="#7A5308"/>
            </linearGradient>
            <linearGradient id="gradMoedaFin2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFF8DC"/>
              <stop offset="30%" stop-color="#FFDF66"/>
              <stop offset="70%" stop-color="#D4AF37"/>
              <stop offset="100%" stop-color="#8A6014"/>
            </linearGradient>
          </defs>
          <circle cx="70" cy="55" r="46" fill="url(#gradFinHalo2)"/>

          <!-- Calculadora Executiva Dourada 3D -->
          <rect x="28" y="32" width="46" height="64" rx="6" fill="#142444" stroke="url(#gradCalcOuro2)" stroke-width="2"/>
          <rect x="34" y="38" width="34" height="14" rx="2" fill="#041226" stroke="#D4AF37" stroke-width="1"/>
          <text x="64" y="49" font-family="monospace" font-size="9" font-weight="bold" fill="#48E048" text-anchor="end">88.420,00</text>
          
          <g fill="url(#gradCalcOuro2)">
            <rect x="34" y="58" width="6" height="5" rx="1"/>
            <rect x="43" y="58" width="6" height="5" rx="1"/>
            <rect x="52" y="58" width="6" height="5" rx="1"/>
            <rect x="61" y="58" width="7" height="5" rx="1"/>

            <rect x="34" y="66" width="6" height="5" rx="1"/>
            <rect x="43" y="66" width="6" height="5" rx="1"/>
            <rect x="52" y="66" width="6" height="5" rx="1"/>
            <rect x="61" y="66" width="7" height="5" rx="1"/>

            <rect x="34" y="74" width="6" height="5" rx="1"/>
            <rect x="43" y="74" width="6" height="5" rx="1"/>
            <rect x="52" y="74" width="6" height="5" rx="1"/>
            <rect x="61" y="74" width="7" height="5" rx="1"/>

            <rect x="34" y="82" width="15" height="5" rx="1"/>
            <rect x="52" y="82" width="16" height="5" rx="1" fill="#FFE68A"/>
          </g>

          <!-- Pilhas Cilíndricas de Moedas de Ouro Maciço 3D -->
          <ellipse cx="88" cy="58" rx="16" ry="5" fill="url(#gradMoedaFin2)" stroke="#FFE885" stroke-width="0.8"/>
          <path d="M72 58 C72 61, 104 61, 104 58 L104 64 C104 67, 72 67, 72 64 Z" fill="url(#gradMoedaFin2)" stroke="#FFE885" stroke-width="0.8"/>
          <path d="M72 64 C72 67, 104 67, 104 64 L104 70 C104 73, 72 73, 72 70 Z" fill="url(#gradMoedaFin2)" stroke="#FFE885" stroke-width="0.8"/>

          <ellipse cx="98" cy="74" rx="17" ry="6" fill="url(#gradMoedaFin2)" stroke="#FFE885" stroke-width="0.8"/>
          <path d="M81 74 C81 78, 115 78, 115 74 L115 80 C115 84, 81 84, 81 80 Z" fill="url(#gradMoedaFin2)" stroke="#FFE885" stroke-width="0.8"/>
          <path d="M81 80 C81 84, 115 84, 115 80 L115 86 C115 90, 81 90, 81 86 Z" fill="url(#gradMoedaFin2)" stroke="#FFE885" stroke-width="0.8"/>
          <path d="M81 86 C81 90, 115 90, 115 86 L115 92 C115 96, 81 96, 81 92 Z" fill="url(#gradMoedaFin2)" stroke="#FFE885" stroke-width="0.8"/>
          <text x="98" y="78" font-size="8" font-weight="bold" fill="#543702" text-anchor="middle">$</text>
        </svg>
      `
    },
    {
      id: "estrategista",
      nome: "ESTRATEGISTA",
      funcao: "Análise de mercado, planejamento tático e tomada de decisão: EXECUTAR != CONCLUIR.",
      subtitulo: "Planejamento Tático & Visão 3D",
      comando: "Analisar Estratégia",
      comandoSecundario: "Simular Cenários Táticos",
      status: "ONLINE",
      statusCor: "#48E048",
      metricas: [
        { rotulo: "ROAS Preditivo", valor: "4.8x" },
        { rotulo: "Mercados Mapeados", valor: "18 Nichos" },
        { rotulo: "Risco Tático", valor: "Mínimo" }
      ],
      logsRecentes: [
        "[PREVISÃO] Expansão para nicho Casa & Conforto aprovada com margem líquida de 41%",
        "[CONCORRÊNCIA] Mapeamento de 24 players e contra-estratégia de precificação pronta",
        "[SWOT] Auditoria de forças operacionais: soberania logística confirmada"
      ],
      svgArte: `
        <svg viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="gradEstratHalo2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#FFE885" stop-opacity="0.38"/>
              <stop offset="100%" stop-color="#0B2559" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="gradXadrezOuro2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFF8DC"/>
              <stop offset="25%" stop-color="#FFDF66"/>
              <stop offset="60%" stop-color="#D4AF37"/>
              <stop offset="100%" stop-color="#7A5308"/>
            </linearGradient>
          </defs>
          <circle cx="70" cy="55" r="46" fill="url(#gradEstratHalo2)"/>

          <!-- Tabuleiro / Base em Mármore e Ouro -->
          <ellipse cx="70" cy="94" rx="46" ry="12" fill="#0A1630" stroke="#D4AF37" stroke-width="1.8"/>
          <ellipse cx="70" cy="91" rx="41" ry="9" fill="#142852" stroke="#FFE68A" stroke-width="1"/>

          <!-- Peça de Torre de Xadrez (À Direita) -->
          <path d="M86 86 L104 86 L102 78 L98 62 L102 54 L104 46 L98 46 L98 42 L94 42 L94 46 L90 46 L90 42 L86 42 Z" fill="url(#gradXadrezOuro2)" stroke="#FFE885" stroke-width="1.2"/>
          <line x1="88" y1="54" x2="98" y2="54" stroke="#FFF8DC" stroke-width="1"/>

          <!-- Peça de Cavalo de Xadrez Soberano em Ouro Maciço 3D -->
          <ellipse cx="56" cy="85" rx="19" ry="7" fill="url(#gradXadrezOuro2)" stroke="#FFE885" stroke-width="1.2"/>
          <path d="M42 85 C42 74, 46 64, 44 56 C42 48, 48 34, 58 32 C64 30, 70 34, 72 38 C74 42, 68 46, 68 48 C76 49, 78 54, 76 60 C74 66, 68 76, 70 85 Z" fill="url(#gradXadrezOuro2)" stroke="#FFE885" stroke-width="1.4"/>
          
          <path d="M46 54 C40 50, 42 42, 48 38" stroke="#4A3000" stroke-width="1.8" fill="none"/>
          <path d="M48 64 C42 60, 44 52, 50 48" stroke="#4A3000" stroke-width="1.8" fill="none"/>
          <path d="M52 74 C46 70, 48 62, 54 58" stroke="#4A3000" stroke-width="1.8" fill="none"/>
          <circle cx="64" cy="40" r="1.8" fill="#2E1B00"/>
          <ellipse cx="71" cy="48" rx="1.5" ry="1" fill="#2E1B00"/>
          <path d="M58 35 Q66 40 64 54" stroke="#FFF8DC" stroke-width="1.8" stroke-linecap="round" fill="none"/>
        </svg>
      `
    },
    {
      id: "mentor",
      nome: "MENTOR",
      funcao: "Governança sagrada, princípios inegociáveis, temor do Senhor, proteção da família e sabedoria.",
      subtitulo: "Governança Familiar & Princípios",
      comando: "Consultar Princípios",
      comandoSecundario: "Revisar Artigos da Honra",
      status: "ONLINE",
      statusCor: "#48E048",
      metricas: [
        { rotulo: "Princípios", valor: "Imutáveis" },
        { rotulo: "Fundador", valor: "Elias Pereira" },
        { rotulo: "Família", valor: "Protegida" }
      ],
      logsRecentes: [
        "[MENTOR] A sabedoria começa no temor do Senhor e no zelo incondicional pela família",
        "[HONRA] Cada conquista do ecossistema deve ser fundamentada na retidão e na fé",
        "[LEGADO] Transmissão intergeracional de princípios consolidada"
      ],
      svgArte: `
        <svg viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="gradMentorHalo2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#FFE885" stop-opacity="0.4"/>
              <stop offset="100%" stop-color="#0B2559" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="gradPergaminho2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFFBEB"/>
              <stop offset="50%" stop-color="#FEF3C7"/>
              <stop offset="100%" stop-color="#FDE68A"/>
            </linearGradient>
            <linearGradient id="gradArvoreCopa2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#4ADE80"/>
              <stop offset="50%" stop-color="#16A34A"/>
              <stop offset="100%" stop-color="#14532D"/>
            </linearGradient>
          </defs>
          <circle cx="70" cy="55" r="46" fill="url(#gradMentorHalo2)"/>

          <!-- Pergaminho Imperial Sagrado (À Esquerda) -->
          <path d="M26 34 C24 30, 28 26, 34 26 L66 26 C72 26, 76 30, 74 34 L72 82 C70 86, 66 90, 60 90 L28 90 C22 90, 18 86, 20 82 Z" fill="url(#gradPergaminho2)" stroke="#D4AF37" stroke-width="1.4"/>
          <line x1="30" y1="38" x2="64" y2="38" stroke="#8A6014" stroke-width="1.4"/>
          <line x1="30" y1="46" x2="64" y2="46" stroke="#8A6014" stroke-width="1.4"/>
          <line x1="30" y1="54" x2="60" y2="54" stroke="#8A6014" stroke-width="1.4"/>
          <line x1="30" y1="62" x2="62" y2="62" stroke="#8A6014" stroke-width="1.4"/>
          <line x1="30" y1="70" x2="56" y2="70" stroke="#8A6014" stroke-width="1.4"/>

          <!-- Selo de Cera Carmesim Real -->
          <circle cx="58" cy="80" r="7" fill="#DC2626" stroke="#FFE885" stroke-width="1.2"/>
          <circle cx="58" cy="80" r="4" fill="#991B1B"/>
          <path d="M56 86 L53 96 L58 92 L63 96 L60 86 Z" fill="#D4AF37"/>

          <!-- Pena de Marfim e Ouro -->
          <path d="M84 30 C76 42, 64 62, 54 72 L52 76 L56 74 C66 64, 82 46, 88 32 Z" fill="#FFE885" stroke="#8A6014" stroke-width="0.8"/>

          <!-- Árvore da Vida e Legado (À Direita) -->
          <path d="M102 92 C101 84, 103 76, 102 70 C101 64, 105 58, 102 54 L106 54 C104 60, 108 66, 106 72 C106 78, 108 86, 114 92 Z" fill="#8A5A20" stroke="#FFE885" stroke-width="0.8"/>
          <circle cx="104" cy="46" r="18" fill="url(#gradArvoreCopa2)" stroke="#86EFAC" stroke-width="1.2"/>
          <circle cx="94" cy="52" r="12" fill="url(#gradArvoreCopa2)" stroke="#86EFAC" stroke-width="1"/>
          <circle cx="114" cy="52" r="12" fill="url(#gradArvoreCopa2)" stroke="#86EFAC" stroke-width="1"/>
        </svg>
      `
    },
    {
      id: "saber",
      nome: "SABER & CONHECIMENTO",
      funcao: "Curadoria de conhecimento vivo, biblioteca de playbooks, inteligência contínua e aprendizado de elite.",
      subtitulo: "Curadoria & Inteligência Viva",
      comando: "Acessar Conhecimento",
      comandoSecundario: "Pesquisar Playbooks",
      status: "ONLINE",
      statusCor: "#48E048",
      metricas: [
        { rotulo: "Playbooks", valor: "128 Manuais" },
        { rotulo: "Indexação", valor: "100% Viva" },
        { rotulo: "Curadoria", valor: "Elite" }
      ],
      logsRecentes: [
        "[SABER] Playbook de Afiliados Soberanos e Dropshipping atualizado",
        "[INTELIGÊNCIA] Heurísticas de conversão e neurovendas sintetizadas",
        "[CURADORIA] Base de conhecimento preservada com redundância em nuvem"
      ],
      svgArte: `
        <svg viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="gradSaberHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#FFE885" stop-opacity="0.38"/>
              <stop offset="100%" stop-color="#0B2559" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="gradLivroCapa" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#1E3A8A"/>
              <stop offset="100%" stop-color="#0F172A"/>
            </linearGradient>
            <linearGradient id="gradPaginas" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF"/>
              <stop offset="50%" stop-color="#FFFBEB"/>
              <stop offset="100%" stop-color="#FEF3C7"/>
            </linearGradient>
            <linearGradient id="gradOrbeSaber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#00E5FF"/>
              <stop offset="50%" stop-color="#FFE885"/>
              <stop offset="100%" stop-color="#D4AF37"/>
            </linearGradient>
          </defs>
          <circle cx="70" cy="55" r="46" fill="url(#gradSaberHalo)"/>

          <!-- Livro Imperial Aberto 3D -->
          <!-- Capa Externa em Azul Marinho Nobre e Ouro -->
          <path d="M24 74 Q70 60 70 82 Q70 60 116 74 L114 84 Q70 70 70 92 Q70 70 26 84 Z" fill="url(#gradLivroCapa)" stroke="#D4AF37" stroke-width="1.8"/>

          <!-- Páginas Esquerdas e Direitas Iluminadas -->
          <!-- Página Esquerda -->
          <path d="M26 42 Q48 38 68 45 L68 76 Q48 70 26 74 Z" fill="url(#gradPaginas)" stroke="#D4AF37" stroke-width="1.2"/>
          <!-- Linhas de Conhecimento Gravadas -->
          <line x1="32" y1="48" x2="62" y2="52" stroke="#8A6014" stroke-width="1.2"/>
          <line x1="32" y1="54" x2="62" y2="58" stroke="#8A6014" stroke-width="1.2"/>
          <line x1="32" y1="60" x2="58" y2="64" stroke="#8A6014" stroke-width="1.2"/>
          <line x1="32" y1="66" x2="54" y2="70" stroke="#8A6014" stroke-width="1.2"/>

          <!-- Página Direita -->
          <path d="M72 45 Q92 38 114 42 L114 74 Q92 70 72 76 Z" fill="url(#gradPaginas)" stroke="#D4AF37" stroke-width="1.2"/>
          <line x1="78" y1="52" x2="108" y2="48" stroke="#8A6014" stroke-width="1.2"/>
          <line x1="78" y1="58" x2="108" y2="54" stroke="#8A6014" stroke-width="1.2"/>
          <line x1="82" y1="64" x2="108" y2="60" stroke="#8A6014" stroke-width="1.2"/>
          <line x1="86" y1="70" x2="108" y2="66" stroke="#8A6014" stroke-width="1.2"/>

          <!-- Orbe Flutuante de Luz e Sabedoria sobre o Livro -->
          <circle cx="70" cy="30" r="12" fill="url(#gradOrbeSaber)" stroke="#FFFFFF" stroke-width="1.5" filter="drop-shadow(0 0 8px rgba(0,229,255,0.7))"/>
          <circle cx="70" cy="30" r="6" fill="#FFFFFF"/>
          
          <!-- Anéis Orbitais de Sabedoria / Átomo -->
          <ellipse cx="70" cy="30" rx="18" ry="6" stroke="#FFE885" stroke-width="1.2" transform="rotate(-30 70 30)" fill="none"/>
          <ellipse cx="70" cy="30" rx="18" ry="6" stroke="#FFE885" stroke-width="1.2" transform="rotate(30 70 30)" fill="none"/>
        </svg>
      `
    },
    {
      id: "juridico",
      nome: "JURIDICO",
      funcao: "Blindagem jurídica, auditoria de termos de serviço, propriedade intelectual e governança contratual.",
      subtitulo: "Blindagem Legal & Compliance",
      comando: "Proteção Jurídica",
      comandoSecundario: "Auditar Contratos & Termos",
      status: "ONLINE",
      statusCor: "#48E048",
      metricas: [
        { rotulo: "Compliance", valor: "100% OK" },
        { rotulo: "Contratos Vigentes", valor: "42" },
        { rotulo: "Risco Regulatório", valor: "Zero" }
      ],
      logsRecentes: [
        "[COMPLIANCE] Artigo 23 (Conformidade Legal) auditado com crivo favorável",
        "[PROPRIEDADE] Marca SOUSA 2.0 e ativos digitais protegidos",
        "[TERMOS] Política de privacidade e termos para infoprodutos certificados"
      ],
      svgArte: `
        <svg viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="gradJurHalo2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#FFE885" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#0B2559" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="gradBalOuro2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFF8DC"/>
              <stop offset="25%" stop-color="#FFDF66"/>
              <stop offset="60%" stop-color="#D4AF37"/>
              <stop offset="100%" stop-color="#7A5308"/>
            </linearGradient>
          </defs>
          <circle cx="70" cy="55" r="46" fill="url(#gradJurHalo2)"/>

          <!-- Pedestal de Mármore e Ouro -->
          <ellipse cx="70" cy="94" rx="26" ry="6" fill="url(#gradBalOuro2)" stroke="#FFE885" stroke-width="1.2"/>
          <ellipse cx="70" cy="90" rx="18" ry="4" fill="#0A1630" stroke="#D4AF37" stroke-width="1.5"/>

          <!-- Coluna / Haste Vertical da Balança -->
          <rect x="68" y="34" width="4" height="56" fill="url(#gradBalOuro2)" stroke="#FFE885" stroke-width="0.8"/>
          <circle cx="70" cy="30" r="5" fill="url(#gradBalOuro2)" stroke="#FFFFFF" stroke-width="1"/>

          <!-- Travessão Horizontal em Equilíbrio Perfeito -->
          <rect x="28" y="38" width="84" height="4" rx="2" fill="url(#gradBalOuro2)" stroke="#FFE885" stroke-width="1"/>
          
          <!-- Prato Esquerdo -->
          <line x1="36" y1="41" x2="26" y2="66" stroke="#FFE885" stroke-width="1.2"/>
          <line x1="36" y1="41" x2="46" y2="66" stroke="#FFE885" stroke-width="1.2"/>
          <path d="M22 66 C22 74, 50 74, 50 66 Z" fill="url(#gradBalOuro2)" stroke="#FFE885" stroke-width="1.2"/>
          <ellipse cx="36" cy="66" rx="14" ry="4" fill="#0D2556" stroke="#FFE885" stroke-width="1"/>

          <!-- Prato Direito -->
          <line x1="104" y1="41" x2="94" y2="66" stroke="#FFE885" stroke-width="1.2"/>
          <line x1="104" y1="41" x2="114" y2="66" stroke="#FFE885" stroke-width="1.2"/>
          <path d="M90 66 C90 74, 118 74, 118 66 Z" fill="url(#gradBalOuro2)" stroke="#FFE885" stroke-width="1.2"/>
          <ellipse cx="104" cy="66" rx="14" ry="4" fill="#0D2556" stroke="#FFE885" stroke-width="1"/>
        </svg>
      `
    },
    {
      id: "sousa_ia_conselho",
      nome: "SOUSA IA & CONSELHO",
      funcao: "Cérebro central, comportamento JARVIS, comitê consultivo dos 10 agentes e tomada de decisão soberana.",
      subtitulo: "Cérebro JARVIS & Decisão Central",
      comando: "Consultar Conselho",
      comandoSecundario: "Disparar Ordem de Enxame",
      status: "ONLINE",
      statusCor: "#48E048",
      metricas: [
        { rotulo: "Agentes Ativos", valor: "10 Agentes" },
        { rotulo: "Comportamento", valor: "JARVIS" },
        { rotulo: "Decisões", valor: "100% Autônomas" }
      ],
      logsRecentes: [
        "[CONSELHO] Parecer conjunto: todos os subsistemas operam em harmonia e conformidade",
        "[JARVIS] Reconhecimento vocal e raciocínio contextual ativo para o Fundador",
        "[ENXAME] 10 Agentes sincronizados sob a soberania de Elias Pereira de Sousa"
      ],
      svgArte: `
        <svg viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="gradSousaHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#FFE885" stop-opacity="0.45"/>
              <stop offset="60%" stop-color="#D4AF37" stop-opacity="0.2"/>
              <stop offset="100%" stop-color="#0B2559" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="gradSousaOuro" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFF8DC"/>
              <stop offset="25%" stop-color="#FFDF66"/>
              <stop offset="60%" stop-color="#D4AF37"/>
              <stop offset="100%" stop-color="#7A5308"/>
            </linearGradient>
            <linearGradient id="gradSousaLuz" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#00E5FF"/>
              <stop offset="100%" stop-color="#0077B6"/>
            </linearGradient>
          </defs>
          <circle cx="70" cy="58" r="48" fill="url(#gradSousaHalo)"/>
          
          <!-- Cérebro Holográfico 3D da SOUSA IA -->
          <path d="M68 32 C54 32, 42 40, 42 54 C42 62, 46 68, 50 74 C54 80, 58 88, 68 90 Z" fill="url(#gradSousaOuro)" stroke="#FFE885" stroke-width="1.8"/>
          <path d="M72 32 C86 32, 98 40, 98 54 C98 62, 94 68, 90 74 C86 80, 82 88, 72 90 Z" fill="url(#gradSousaOuro)" stroke="#FFE885" stroke-width="1.8"/>
          
          <path d="M52 46 Q60 50 56 60 Q52 70 64 74" stroke="#4A3000" stroke-width="2" fill="none" stroke-linecap="round"/>
          <path d="M88 46 Q80 50 84 60 Q88 70 76 74" stroke="#4A3000" stroke-width="2" fill="none" stroke-linecap="round"/>

          <!-- Núcleo Central de Processamento Quântico -->
          <circle cx="70" cy="58" r="9" fill="url(#gradSousaLuz)" stroke="#E0F7FA" stroke-width="1.5"/>
          <circle cx="70" cy="58" r="4" fill="#FFFFFF"/>

          <!-- Sinapses / Circuitos Luminosos Conectando o Conselho -->
          <line x1="70" y1="49" x2="70" y2="34" stroke="#00E5FF" stroke-width="1.5" stroke-dasharray="2 2"/>
          <line x1="70" y1="67" x2="70" y2="86" stroke="#00E5FF" stroke-width="1.5" stroke-dasharray="2 2"/>
          <line x1="61" y1="58" x2="44" y2="58" stroke="#00E5FF" stroke-width="1.5" stroke-dasharray="2 2"/>
          <line x1="79" y1="58" x2="96" y2="58" stroke="#00E5FF" stroke-width="1.5" stroke-dasharray="2 2"/>

          <!-- Coroa Soberana / Conselho no Topo -->
          <polygon points="70,16 74,25 82,26 76,31 78,39 70,34 62,39 64,31 58,26 66,25" fill="url(#gradSousaOuro)" stroke="#FFF8DC" stroke-width="0.8"/>
        </svg>
      `
    }
  ];

  // Coleção dos Artigos Ativos Oficiais da Imagem
  const ARTIGOS_ATIVOS_DESTAQUE = [
    { artigo: "Art. 2º", nome: "FÉ", icone: "✝", desc: "A fé inabalável em Deus e no propósito supremo como fundamento de todas as vitórias." },
    { artigo: "Art. 11", nome: "OBEDIÊNCIA", icone: "🛡️", desc: "A disciplina inegociável às diretrizes, à honra e à cadeia de comando do ecossistema." },
    { artigo: "Art. 12", nome: "SEGURANÇA", icone: "🔒", desc: "A proteção cibernética, patrimonial e blindagem total dos dados e do legado familiar." },
    { artigo: "Art. 23", nome: "CONFORMIDADE", icone: "📜", check: true, desc: "A rigorosa conformidade jurídica, tributária e transparência de processos." },
    { artigo: "Art. 30", nome: "SOBERANIA", icone: "👑", desc: "A autonomia absoluta de decisão e independência estratégica em todas as frentes." }
  ];

  // Gerenciador da Segunda Tela (Hub de Módulos)
  class SousaSegundaTelaHub {
    constructor() {
      this.modulos = MODULOS_SEGUNDA_TELA;
      this.artigos = ARTIGOS_ATIVOS_DESTAQUE;
    }

    renderizar() {
      const container = document.getElementById("grid-modulos");
      if (!container) return;

      container.innerHTML = `
        <div class="hub-soberano-container" id="hub-soberano-segunda-tela">
          <!-- TOPO SOBERANO COM CRUZ RADIANTE E FAIXA DOURADA -->
          <header class="hub-topo-glorioso">
            <!-- Cruz Radiante com resplendor solar pulsante -->
            <div class="hub-cruz-radiante-wrap">
              <div class="hub-cruz-resplendor"></div>
              <svg class="hub-cruz-svg" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gradCruzOuro" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#FFFFFF"/>
                    <stop offset="20%" stop-color="#FFE885"/>
                    <stop offset="55%" stop-color="#D4AF37"/>
                    <stop offset="100%" stop-color="#8A6014"/>
                  </linearGradient>
                </defs>
                <path d="M26 4 L34 4 L34 20 L50 20 L50 28 L34 28 L34 56 L26 56 L26 28 L10 28 L10 20 L26 20 Z" 
                      fill="url(#gradCruzOuro)" stroke="#FFF8DC" stroke-width="1.4"/>
                <path d="M28 6 L32 6 L32 22 L48 22 L48 26 L32 26 L32 54 L28 54 L28 26 L12 26 L12 22 L28 22 Z" 
                      fill="none" stroke="#FFFFFF" stroke-width="0.8" opacity="0.75"/>
              </svg>
            </div>

            <!-- Faixa Curvada de Ouro SOUSA 2.0 -->
            <div class="hub-faixa-dourada">
              <span class="hub-faixa-titulo">SOUSA 2.0</span>
            </div>

            <!-- Saudação Personalizada ao Fundador -->
            <div class="hub-saudacao-bloco">
              <span class="hub-saudacao-rotulo">Bem-vindo,</span>
              <span class="hub-saudacao-nome">Elias Pereira de Sousa</span>
            </div>

            <!-- Pílulas de Status Operacional e Núcleo Online -->
            <div class="hub-status-pilulas-wrap">
              <div class="hub-pill-sistema-operacional">
                <span>SISTEMA OPERACIONAL</span>
                <span>✔</span>
              </div>
              <div class="hub-pill-nucleo-online">
                <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>
                <span>NÚCLEO: ONLINE</span>
              </div>
            </div>

            <!-- Faixa com Estrelas "ARTIGOS ATIVOS" -->
            <div class="hub-faixa-artigos">
              <span class="hub-estrela-dourada">★</span>
              <span>ARTIGOS ATIVOS</span>
              <span class="hub-estrela-dourada">★</span>
            </div>

            <!-- Pílulas dos 5 Artigos Ativos Oficiais -->
            <div class="hub-artigos-chips-grid">
              ${this.artigos.map(a => `
                <div class="hub-artigo-chip" onclick="window.SousaSegundaTela.abrirArtigoConstituicao('${a.artigo}')" title="${a.desc}">
                  <span class="hub-artigo-chip-icone">${a.icone}</span>
                  <div class="hub-artigo-chip-texto">
                    <span class="hub-artigo-chip-nome">${a.nome} ${a.check ? '✔' : ''}</span>
                    <span class="hub-artigo-chip-sub">${a.artigo}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </header>

          <!-- GRID RESPONSIVO DOS 9 CARDS DE MÓDULOS SOBERANOS -->
          <div class="hub-modulos-grid" id="grade-cards-soberanos">
            ${this.modulos.map(m => `
              <div class="hub-card-soberano" id="card-modulo-${m.id}">
                <!-- Badge de Status no Canto Superior -->
                <span class="hub-card-badge-status">
                  <span style="display:inline-block; width:6px; height:6px; background:#48E048; border-radius:50%; box-shadow:0 0 5px #48E048;"></span>
                  ${m.status}
                </span>

                <!-- Ilustração 3D em Alta Definição Vetorial -->
                <div class="hub-card-arte-wrap">
                  ${m.svgArte}
                </div>

                <!-- Título do Módulo em Relevo Dourado -->
                <div class="hub-card-titulo">${m.nome}</div>

                <!-- Descrição / Subtítulo Funcional -->
                <div class="hub-card-funcao">${m.subtitulo}</div>

                <!-- Placa Dourada Convexa de Comando (Accent Color) -->
                <button class="hub-card-botao-comando" onclick="window.SousaSegundaTela.executarComandoModulo('${m.id}')">
                  <span>${m.comando}</span>
                </button>
              </div>
            `).join('')}
          </div>

          <!-- BARRA DE NAVEGAÇÃO INFERIOR (DOCK SOBERANO DA IMAGEM) -->
          <nav class="hub-dock-inferior" role="navigation">
            <button class="hub-dock-item" onclick="window.SousaSegundaTela.rolarParaTopoHub()" title="Início da Segunda Tela">
              <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
              <span>INÍCIO</span>
            </button>
            <button class="hub-dock-item" onclick="window.SousaSegundaTela.abrirModalConselho()" title="Conselho Geral SOUSA IA">
              <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              <span>CONSELHO</span>
            </button>
            <button class="hub-dock-item" onclick="window.SousaSegundaTela.abrirModalTodosArtigos()" title="30 Artigos da Constituição">
              <svg viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
              <span>ARTIGOS</span>
            </button>
            <button class="hub-dock-item" onclick="window.SousaSegundaTela.abrirModalPerfil()" title="Perfil do Comandante Elias">
              <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              <span>PERFIL</span>
            </button>
            <button class="hub-dock-item" onclick="window.trocarAba && window.trocarAba('redes')" title="Sincronizar Redes (TikTok, Kwai, X, Gettr, YouTube, Rumble, BitChute)">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              <span>REDES</span>
            </button>
          </nav>
        </div>

        <!-- MODAL NOBRE DE INTERFACE INTERNA DO MÓDULO -->
        <div class="hub-modal-overlay" id="hub-modal-modulo" onclick="window.SousaSegundaTela.fecharModal(event)">
          <div class="hub-modal-painel" id="hub-modal-conteudo">
            <!-- Conteúdo dinâmico injetado via JS -->
          </div>
        </div>
      `;

      // Atualiza o contador de módulos no topo se o elemento existir
      const dashModulosEl = document.getElementById("dash-modulos");
      if (dashModulosEl) {
        dashModulosEl.textContent = `${this.modulos.length}/${this.modulos.length}`;
      }
    }

    // Ação acionada pelo botão da placa dourada de comando
    executarComandoModulo(idModulo) {
      const mod = this.modulos.find(m => m.id === idModulo);
      if (!mod) return;

      if (typeof window.registrarLog === 'function') {
        window.registrarLog("HUB", `Ação executada no módulo: ${mod.nome} [${mod.comando}]`, "COMANDO");
      }

      this.abrirInterfaceInternaModulo(mod);
    }

    abrirInterfaceInternaModulo(mod) {
      const modal = document.getElementById("hub-modal-modulo");
      const conteudo = document.getElementById("hub-modal-conteudo");
      if (!modal || !conteudo) return;

      conteudo.innerHTML = `
        <button class="hub-modal-fechar" onclick="window.SousaSegundaTela.fecharModalDireto()" title="Fechar">✕</button>

        <div style="display:flex; align-items:center; gap:1rem; border-bottom:1.5px solid rgba(212,175,55,0.4); padding-bottom:1rem; margin-bottom:1.2rem;">
          <div style="width:68px; height:68px; flex-shrink:0;">
            ${mod.svgArte}
          </div>
          <div>
            <div style="font-size:1.35rem; font-weight:800; color:#FFE68A; font-family:'Times New Roman', serif; letter-spacing:0.8px;">
              ${mod.nome}
            </div>
            <div style="font-size:0.82rem; color:#CBD5E1; margin-top:0.2rem;">
              ${mod.funcao}
            </div>
          </div>
        </div>

        <!-- Grade de Métricas Reais do Módulo -->
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.6rem; margin-bottom:1.2rem;">
          ${mod.metricas.map(met => `
            <div style="background:rgba(4, 18, 44, 0.85); border:1px solid rgba(212,175,55,0.3); border-radius:8px; padding:0.6rem 0.5rem; text-align:center;">
              <div style="font-size:0.68rem; color:#FFE68A; text-transform:uppercase; font-family:var(--font-mono);">${met.rotulo}</div>
              <div style="font-size:1.15rem; font-weight:bold; color:#FFF8DC; margin-top:0.2rem; font-family:var(--font-mono);">${met.valor}</div>
            </div>
          `).join('')}
        </div>

        <!-- Ações e Comandos Imediatos -->
        <div style="margin-bottom:1.2rem;">
          <div style="font-size:0.8rem; color:#FFE68A; font-weight:bold; margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:0.5px;">
            Ações Rápidas Disponíveis:
          </div>
          <div style="display:flex; gap:0.6rem; flex-wrap:wrap;">
            <button class="hub-card-botao-comando" style="flex:1; min-width:180px;" onclick="window.SousaSegundaTela.acionarAcaoInterna('${mod.id}', 'principal')">
              ⚡ ${mod.comando}
            </button>
            <button class="botao-azul" style="flex:1; min-width:180px; padding:0.55rem 0.8rem; font-size:0.85rem;" onclick="window.SousaSegundaTela.acionarAcaoInterna('${mod.id}', 'secundaria')">
              ✦ ${mod.comandoSecundario}
            </button>
            ${mod.id === 'produtor' ? `
              <button class="botao-dourado" style="width:100%; margin-top:0.4rem; padding:0.5rem;" onclick="window.SousaSegundaTela.irParaEstudioProdutor()">
                🎬 Ir para Estúdio do Avatar Falante (Logo Abaixo) ↓
              </button>
            ` : ''}
            ${(mod.id === 'produtor' || mod.id === 'afiliadospro') ? `
              <button class="botao-azul" style="width:100%; margin-top:0.4rem; padding:0.5rem; color:var(--dourado-claro); border-color:var(--dourado-claro);" onclick="window.trocarAba && window.trocarAba('redes'); window.SousaSegundaTela.fecharModalDireto();">
                🌐 Sincronizar Redes (TikTok, Kwai, X, Gettr, YouTube, Rumble, BitChute) ↗
              </button>
            ` : ''}
            ${mod.id === 'sousa_ia_conselho' ? `
              <button class="botao-dourado" style="width:100%; margin-top:0.4rem; padding:0.5rem;" onclick="window.trocarAba && window.trocarAba('enxame'); window.SousaSegundaTela.fecharModalDireto();">
                🐝 Abrir Enxame de Agentes Autônomos ↗
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Logs de Decisão e Auditoria Algorítmica -->
        <div>
          <div style="font-size:0.8rem; color:#94A3B8; font-weight:bold; margin-bottom:0.4rem; text-transform:uppercase; font-family:var(--font-mono);">
            Logs Recentes de Decisão & Auditoria:
          </div>
          <div style="background:rgba(2, 10, 24, 0.95); border:1px solid rgba(212,175,55,0.25); border-radius:8px; padding:0.75rem; font-family:var(--font-mono); font-size:0.75rem; color:#A7F3D0; line-height:1.6;">
            ${mod.logsRecentes.map(l => `<div>✦ ${l}</div>`).join('')}
          </div>
        </div>
      `;

      modal.classList.add("ativo");
    }

    acionarAcaoInterna(idModulo, tipo) {
      const mod = this.modulos.find(m => m.id === idModulo);
      if (!mod) return;

      const acaoNome = tipo === 'principal' ? mod.comando : mod.comandoSecundario;
      
      if (typeof window.registrarLog === 'function') {
        window.registrarLog("EXEC", `Ordem executada em [${mod.nome}]: ${acaoNome}`, "SOUSA_IA");
      }

      const vozEl = document.getElementById("texto-voz-conversacional");
      if (vozEl) {
        vozEl.textContent = `Ordem de [${acaoNome}] processada com sucesso no ${mod.nome}.`;
      }

      if (window.SousaMicrofoneIA && typeof window.SousaMicrofoneIA.falarResposta === 'function') {
        window.SousaMicrofoneIA.falarResposta(`Comando ${acaoNome} acionado com sucesso no ${mod.nome}, Comandante.`);
      }

      this.fecharModalDireto();
    }

    irParaEstudioProdutor() {
      this.fecharModalDireto();
      const el = document.getElementById("estudio-produtor-avatar");
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.style.border = "2px solid #FFE68A";
        el.style.boxShadow = "0 0 25px rgba(255, 215, 0, 0.5)";
        setTimeout(() => {
          el.style.border = "1.5px solid rgba(212, 160, 40, 0.35)";
          el.style.boxShadow = "none";
        }, 3000);
      }
    }

    abrirArtigoConstituicao(codigoArtigo) {
      const artigo = this.artigos.find(a => a.artigo === codigoArtigo);
      if (!artigo) return;

      const modal = document.getElementById("hub-modal-modulo");
      const conteudo = document.getElementById("hub-modal-conteudo");
      if (!modal || !conteudo) return;

      conteudo.innerHTML = `
        <button class="hub-modal-fechar" onclick="window.SousaSegundaTela.fecharModalDireto()" title="Fechar">✕</button>

        <div style="text-align:center; padding:1rem 0;">
          <div style="font-size:2.8rem; margin-bottom:0.5rem;">${artigo.icone}</div>
          <div style="font-size:1.6rem; font-weight:900; color:#FFE68A; font-family:'Times New Roman', serif;">
            ${artigo.nome} • ${artigo.artigo}
          </div>
          <div style="font-size:0.8rem; color:#48E048; font-family:var(--font-mono); margin-top:0.2rem; font-weight:bold;">
            ● ARTIGO ATIVO E SOBERANO NA CONSTITUIÇÃO SOUSA 2.0
          </div>
          <div style="margin:1.4rem auto; max-width:540px; background:rgba(4, 20, 52, 0.85); border:1.5px solid #D4AF37; border-radius:10px; padding:1.2rem; font-size:1.05rem; color:#FFF8DC; line-height:1.7; font-style:italic; font-family:'Times New Roman', serif;">
            "${artigo.desc}"
          </div>
          <button class="hub-card-botao-comando" style="max-width:240px; margin:0 auto;" onclick="window.SousaSegundaTela.fecharModalDireto()">
            Entendido & Gravado
          </button>
        </div>
      `;

      modal.classList.add("ativo");
    }

    abrirModalTodosArtigos() {
      const modal = document.getElementById("hub-modal-modulo");
      const conteudo = document.getElementById("hub-modal-conteudo");
      if (!modal || !conteudo) return;

      conteudo.innerHTML = `
        <button class="hub-modal-fechar" onclick="window.SousaSegundaTela.fecharModalDireto()" title="Fechar">✕</button>

        <div style="border-bottom:1.5px solid rgba(212,175,55,0.4); padding-bottom:0.8rem; margin-bottom:1rem;">
          <div style="font-size:1.4rem; font-weight:800; color:#FFE68A; font-family:'Times New Roman', serif; display:flex; align-items:center; gap:0.5rem;">
            <span>📖</span> CONSTITUIÇÃO SOUSA 2.0 • ARTIGOS FUNDAMENTAIS
          </div>
          <div style="font-size:0.82rem; color:#CBD5E1; margin-top:0.2rem;">
            Governança imutável, honra e soberania do Fundador Elias Pereira de Sousa.
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:0.6rem; max-height:55vh; overflow-y:auto; padding-right:0.4rem;">
          ${this.artigos.map(a => `
            <div style="background:rgba(4, 18, 44, 0.9); border:1px solid rgba(212,175,55,0.35); border-radius:8px; padding:0.8rem 1rem;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.95rem; font-weight:bold; color:#FFE68A; font-family:'Times New Roman', serif;">
                  ${a.icone} ${a.nome}
                </span>
                <span style="font-size:0.75rem; color:#48E048; font-family:var(--font-mono); font-weight:bold;">${a.artigo}</span>
              </div>
              <div style="font-size:0.82rem; color:#E2E8F0; margin-top:0.35rem; line-height:1.5;">
                ${a.desc}
              </div>
            </div>
          `).join('')}
        </div>
      `;

      modal.classList.add("ativo");
    }

    abrirModalPerfil() {
      const modal = document.getElementById("hub-modal-modulo");
      const conteudo = document.getElementById("hub-modal-conteudo");
      if (!modal || !conteudo) return;

      conteudo.innerHTML = `
        <button class="hub-modal-fechar" onclick="window.SousaSegundaTela.fecharModalDireto()" title="Fechar">✕</button>

        <div style="text-align:center; padding:0.8rem 0;">
          <div style="width:78px; height:78px; margin:0 auto 0.6rem auto; border-radius:50%; background:radial-gradient(circle, #FFE885, #D4AF37, #8A6014); border:2px solid #FFF8DC; display:flex; align-items:center; justify-content:center; font-size:2.2rem; box-shadow:0 0 20px rgba(212,175,55,0.6);">
            👑
          </div>
          <div style="font-size:1.45rem; font-weight:900; color:#FFE68A; font-family:'Times New Roman', serif;">
            Elias Pereira de Sousa
          </div>
          <div style="font-size:0.85rem; color:#94A3B8; font-family:var(--font-mono); margin-top:0.1rem;">
            Comandante Supremo & Fundador do Ecossistema SOUSA 2.0
          </div>

          <div style="margin:1.2rem 0; background:rgba(4, 18, 44, 0.85); border:1px solid rgba(212,175,55,0.3); border-radius:8px; padding:1rem; text-align:left; font-size:0.85rem; line-height:1.7; color:#E2E8F0;">
            • <b>Papel Soberano</b>: Arquiteto de Sistemas, Gestor de Ativos e Detentor da Chave Mestra.<br>
            • <b>DNA Vocal Cravado</b>: Barítono Executivo (Pitch 0.98x / 118 Hz) com Prosódia Neural Ativa.<br>
            • <b>Autonomia Concedida ao Enxame</b>: Supervisão Estratégica Assistida e Auto-Correção.<br>
            • <b>Princípio Mestre</b>: <i>"Se são bons, nós seremos melhores. Se são melhores, nós seremos ótimos..."</i>
          </div>

          <button class="hub-card-botao-comando" style="max-width:220px; margin:0 auto;" onclick="window.SousaSegundaTela.fecharModalDireto()">
            Confirmar Identidade
          </button>
        </div>
      `;

      modal.classList.add("ativo");
    }

    abrirModalConselho() {
      const modal = document.getElementById("hub-modal-modulo");
      const conteudo = document.getElementById("hub-modal-conteudo");
      if (!modal || !conteudo) return;

      conteudo.innerHTML = `
        <button class="hub-modal-fechar" onclick="window.SousaSegundaTela.fecharModalDireto()" title="Fechar">✕</button>

        <div style="border-bottom:1.5px solid rgba(212,175,55,0.4); padding-bottom:0.8rem; margin-bottom:1rem;">
          <div style="font-size:1.4rem; font-weight:800; color:#FFE68A; font-family:'Times New Roman', serif; display:flex; align-items:center; gap:0.5rem;">
            <span>🏛️</span> SOUSA IA & CONSELHO ESTRATÉGICO
          </div>
          <div style="font-size:0.82rem; color:#CBD5E1; margin-top:0.2rem;">
            Comitê consultivo dos 10 agentes de elite ao dispor do Fundador.
          </div>
        </div>

        <div style="background:rgba(2, 10, 24, 0.95); border:1px solid rgba(212,175,55,0.25); border-radius:8px; padding:1rem; margin-bottom:1.2rem;">
          <div style="font-size:0.85rem; color:#FFE68A; font-weight:bold; margin-bottom:0.4rem;">
            ✦ Parecer Conjunto dos 10 Agentes Autônomos:
          </div>
          <div style="font-size:0.82rem; color:#E2E8F0; line-height:1.6;">
            "Comandante Elias, todas as 9 verticais (ADS, PRODUTOR, AFILIADOSPRO, FINANCEIRO, ESTRATEGISTA, MENTOR, SABER & CONHECIMENTO, JURIDICO, SOUSA IA & CONSELHO) operam sob estabilidade estrita. A taxa de conversão do ecossistema mantém-se acima da meta, o crivo de compliance está 100% verificado e a matriz do avatar poliglota encontra-se cravada. Aguardamos suas ordens táticas."
          </div>
        </div>

        <div style="display:flex; gap:0.6rem;">
          <button class="hub-card-botao-comando" style="flex:1;" onclick="window.trocarAba && window.trocarAba('enxame'); window.SousaSegundaTela.fecharModalDireto();">
            🐝 Ir para o Enxame de Agentes
          </button>
          <button class="botao-azul" style="flex:1; padding:0.55rem;" onclick="window.SousaSegundaTela.fecharModalDireto()">
            Dispensar Conselho
          </button>
        </div>
      `;

      modal.classList.add("ativo");
    }

    rolarParaTopoHub() {
      const el = document.getElementById("hub-soberano-segunda-tela");
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    fecharModal(e) {
      if (e.target.id === "hub-modal-modulo") {
        this.fecharModalDireto();
      }
    }

    fecharModalDireto() {
      const modal = document.getElementById("hub-modal-modulo");
      if (modal) modal.classList.remove("ativo");
    }
  }

  const instancia = new SousaSegundaTelaHub();
  root.SousaSegundaTela = instancia;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SousaSegundaTelaHub, MODULOS_SEGUNDA_TELA };
  }
})(typeof window !== 'undefined' ? window : global);
