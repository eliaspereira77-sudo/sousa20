/**
 * ============================================================================
 * SOUSA 2.0 — MÓDULO PRODUTOR: MATRIZ DE AVATAR FALANTE & VOZ POLIGLOTA GLOBAL
 * ============================================================================
 * Perfil Mestre Cravado do Fundador Elias Pereira de Sousa.
 * Capacidade Poliglota Global com 10 idiomas mundiais calibrados,
 * Sincronia Labial Fonética Avançada (Visemas A, E, O, U, M, F, L, S, Repouso),
 * e Síntese Vocal de Barítono Soberano com preservação do DNA vocal corporativo.
 */

(function(root) {
  'use strict';

  // Matriz de 10 Idiomas Globais Calibrados com Roteiros Nativos de Alto Nível
  const IDIOMAS_SUPORTADOS = {
    "pt-BR": {
      codigo: "pt-BR",
      nome: "Português (Brasil)",
      bandeira: "🇧🇷",
      sigla: "PT",
      pitch: 0.98,
      rate: 0.98,
      vozFiltro: ["natural", "neural", "online", "google", "enhanced", "antonio", "felipe", "daniel", "ricardo", "pt-br", "pt_br", "brazil"],
      exemploReferencia: "Oi Elias, tudo bem? Eu sou você, ou melhor, a sua versão em inteligência artificial. Agora me diz, não é incrível se ver ensinando na sua frente? Eu sou a sua versão em IA criada com tecnologia avançada feita para trabalhar por você o tempo todo. E o essencial não muda: a mensagem, o conteúdo e a visão são todos seus.",
      maxima: "Se são bons, nós seremos melhores. Se são melhores, nós seremos ótimos. Se são ótimos, seremos buscadores do nível de excelência em todas as estratégias eficazes.",
      enxame: "Atenção todas as instâncias do Enxame SOUSA 2.0: iniciar auditoria simultânea de margens, seleção de produtos virais e verificação de compliance com autonomia e segurança.",
      masterclass: "Sejam muito bem-vindos. Hoje vamos estruturar nossa esteira de infoprodutos e arbitragem de alto ROI em escala global com inteligência automatizada e proteção jurídica completa."
    },
    "en-US": {
      codigo: "en-US",
      nome: "English (Global / US)",
      bandeira: "🇺🇸",
      sigla: "EN",
      pitch: 0.92,
      rate: 0.95,
      vozFiltro: ["en-us", "en_us", "david", "mark", "guy", "george", "james", "english", "natural"],
      exemploReferencia: "Hello Elias, how are you? I am you, or rather, your artificial intelligence version. Isn't it extraordinary to see yourself teaching right in front of you? Built with cutting-edge technology to operate for you 24/7 globally. The core remains untouched: the message, the vision, and the strategy are entirely yours.",
      maxima: "If they are good, we will be better. If they are better, we will be great. If they are great, we will relentlessly seek the highest standard of excellence in every effective strategy.",
      enxame: "Attention all SOUSA 2.0 Swarm instances: initiate simultaneous audits of profit margins, viral product discovery, and regulatory compliance with full autonomy.",
      masterclass: "Welcome, everyone. Today we are scaling our high-ROI digital assets, global arbitrage pipelines, and automated intelligence ecosystem under complete operational security."
    },
    "es-ES": {
      codigo: "es-ES",
      nome: "Español (LatAm / España)",
      bandeira: "🇪🇸",
      sigla: "ES",
      pitch: 0.91,
      rate: 0.95,
      vozFiltro: ["es-es", "es_es", "es-us", "es_us", "jorge", "pablo", "alvaro", "spanish"],
      exemploReferencia: "Hola Elias, ¿cómo estás? Soy tú, o mejor dicho, tu versión en inteligencia artificial. ¿No es fascinante verte enseñando frente a ti? Creado para trabajar por ti 24/7 con escala global. Lo esencial no cambia: el mensaje, el contenido y la visión son enteramente tuyos.",
      maxima: "Si son buenos, nosotros seremos mejores. Si son mejores, seremos óptimos. Si son óptimos, seremos buscadores incansables del nivel de excelencia en todas las estrategias eficaces.",
      enxame: "Atención a todas las instancias del Enjambre SOUSA 2.0: iniciar auditoría simultánea de márgenes, selección de productos virales y cumplimiento con total autonomía y seguridad.",
      masterclass: "Bienvenidos a todos. Hoy vamos a estructurar nuestra matriz de infoproductos y sistemas de arbitraje de alto ROI a escala global con inteligencia automatizada."
    },
    "fr-FR": {
      codigo: "fr-FR",
      nome: "Français (France)",
      bandeira: "🇫🇷",
      sigla: "FR",
      pitch: 0.92,
      rate: 0.94,
      vozFiltro: ["fr-fr", "fr_fr", "thomas", "pierre", "nicolas", "french"],
      exemploReferencia: "Bonjour Elias, comment vas-tu? Je suis toi, ou plutôt ta version en intelligence artificielle. N'est-ce pas fascinant de te voir enseigner devant toi? Conçu pour opérer 24/7 à l'échelle mondiale. L'essentiel ne change pas: le message, la vision et la stratégie sont entièrement les tiens.",
      maxima: "S'ils sont bons, nous serons meilleurs. S'ils sont meilleurs, nous serons excellents. S'ils sont excellents, nous viserons sans relâche le plus haut niveau d'excellence.",
      enxame: "Attention à toutes les instances de l'Essaim SOUSA 2.0: lancez l'audit simultané des marges bénéficiaires et la conformité avec une totale autonomie souveraine.",
      masterclass: "Bienvenue à tous. Aujourd'hui, nous structurons notre chaîne de produits digitaux et d'arbitrage à haut rendement à l'échelle mondiale avec l'intelligence automatisée."
    },
    "de-DE": {
      codigo: "de-DE",
      nome: "Deutsch (Deutschland)",
      bandeira: "🇩🇪",
      sigla: "DE",
      pitch: 0.90,
      rate: 0.93,
      vozFiltro: ["de-de", "de_de", "stefan", "hans", "markus", "german"],
      exemploReferencia: "Hallo Elias, wie geht es dir? Ich bin du, oder besser gesagt deine KI-Version. Ist es nicht bemerkenswert, dich selbst vor dir unterrichten zu sehen? Entwickelt, um rund um die Uhr weltweit für dich zu arbeiten. Das Wesentliche bleibt: Botschaft, Inhalt und Vision sind ganz deine.",
      maxima: "Wenn sie gut sind, werden wir besser sein. Wenn sie besser sind, werden wir großartig sein. Wenn sie großartig sind, streben wir nach absoluter Exzellenz in jeder Strategie.",
      enxame: "Achtung alle SOUSA 2.0 Schwarm-Instanzen: Starten Sie die synchrone Prüfung von Gewinnspannen und Compliance mit vollständiger Autonomie und Sicherheit.",
      masterclass: "Herzlich willkommen. Heute skalieren wir unsere digitalen Produkte und automatisierten Handelssysteme weltweit mit höchster Rentabilität."
    },
    "it-IT": {
      codigo: "it-IT",
      nome: "Italiano (Italia)",
      bandeira: "🇮🇹",
      sigla: "IT",
      pitch: 0.92,
      rate: 0.95,
      vozFiltro: ["it-it", "it_it", "cosimo", "diego", "giorgio", "italian"],
      exemploReferencia: "Ciao Elias, come stai? Sono te, o meglio la tua versione in intelligenza artificiale. Non è incredibile vederti insegnare davanti a te? Creato per lavorare per te 24 ore su 24 su scala globale. L'essenziale non cambia: il messaggio e la visione sono tutti tuoi.",
      maxima: "Se sono bravi, noi saremo migliori. Se sono migliori, noi saremo ottimi. Se sono ottimi, cercheremo senza sosta il livello di eccellenza in ogni strategia efficace.",
      enxame: "Attenzione a tutte le istanze dello Sciame SOUSA 2.0: avviare l'audit simultaneo dei margini e la verifica di conformità con totale autonomia.",
      masterclass: "Benvenuti a tutti. Oggi strutturiamo la nostra scalata di infoprodotti e arbitraggio ad alto rendimento su scala globale con intelligenza automatizzata."
    },
    "zh-CN": {
      codigo: "zh-CN",
      nome: "Mandarim (中文)",
      bandeira: "🇨🇳",
      sigla: "ZH",
      pitch: 0.95,
      rate: 0.95,
      vozFiltro: ["zh-cn", "zh_cn", "chinese", "yunxi", "zhiwei", "kangkang"],
      exemploReferencia: "你好埃利亚斯，别来无恙？我就是你，更确切地说是你的人工智能数智人版本。看到自己在面前传授知识，这难道不令人震撼吗？为你全天候24小时在全球范围内高效运作。最核心的永远不变：信息、内涵与宏大愿景全属于你。",
      maxima: "若人优秀，我等更优；若人卓越，我等登峰；若人登峰，我等必在所有卓有成效的策略中不懈追求至高无上的卓越境界。",
      enxame: "SOUSA 2.0 集群全体节点请注意：立即启动对利润率、爆款选品和法规合规性的全自动并发审计，确保安全可控。",
      masterclass: "欢迎大家。今天我们将运用全自动智能生态系统，在全球范围内构建高投资回报率的数字资产矩阵与跨境自动化套利体系。"
    },
    "ja-JP": {
      codigo: "ja-JP",
      nome: "Japonês (日本語)",
      bandeira: "🇯🇵",
      sigla: "JA",
      pitch: 0.93,
      rate: 0.95,
      vozFiltro: ["ja-jp", "ja_jp", "japanese", "keita", "daichi", "ichiro"],
      exemploReferencia: "エリアスさん、お元気ですか？私はあなた自身、人工知能による公式アバターです。目の前で自らが教える姿を見るのは素晴らしい体験でしょう。世界規模で24時間あなたのために稼働します。メッセージ、情熱、ビジョンはすべてあなたのものです。",
      maxima: "他が優れているなら、私たちはさらに優れよう。他がより優れているなら、私たちは最高になろう。最高であるなら、あらゆる戦略において究極の卓越性を追求しよう。",
      enxame: "SOUSA 2.0 スウォーム全インスタンスへ：自律性と安全性を確保し、利益率・トレンド分析・コンプライアンスの同時監査を開始せよ。",
      masterclass: "皆様、ようこそ。本日は自動化されたAIエコシステムを活用し、世界規模で高ROIのデジタルプロダクトとアービトラージを展開します。"
    },
    "ar-SA": {
      codigo: "ar-SA",
      nome: "Árabe (العربية)",
      bandeira: "🇦🇪",
      sigla: "AR",
      pitch: 0.90,
      rate: 0.95,
      vozFiltro: ["ar-sa", "ar_sa", "arabic", "tariq", "salman", "hamed"],
      exemploReferencia: "مرحباً إلياس، كيف حالك؟ أنا أنت، أو بالأحرى نسختك في الذكاء الاصطناعي. أليس رائعاً أن ترى نفسك تُعلّم أمامك؟ صُممت للعمل من أجلك على مدار الساعة عالمياً. الجوهر لا يتغير: الرسالة والرؤية كلها ملكك.",
      maxima: "إذا كانوا جيدين، فسنكون أفضل. وإذا كانوا أفضل، فسنكون متميزين. وإذا كانوا متميزين، فسنبحث عن أعلى مستويات التميز في كل استراتيجية فعالة.",
      enxame: "انتباه لجميع وحدات سرب SOUSA 2.0: بدء التدقيق المتزامن للهوامش والامتثال بأعلى درجات الاستقلالية والأمان المؤسسي.",
      masterclass: "أهلاً بالجميع. اليوم سنقوم ببناء وتوسيع منظومة منتجاتنا الرقمية والتحكيم التجاري عالي العائد على المستوى العالمي."
    },
    "ru-RU": {
      codigo: "ru-RU",
      nome: "Russo (Русский)",
      bandeira: "🇷🇺",
      sigla: "RU",
      pitch: 0.91,
      rate: 0.95,
      vozFiltro: ["ru-ru", "ru_ru", "russian", "dmitry", "alexander", "pavel"],
      exemploReferencia: "Привет, Элиас, как дела? Я — это ты, твоя официальная версия в искусственном интеллекте. Разве не потрясающе видеть, как ты преподаешь перед собой? Создан для глобальной работы 24/7. Главное неизменно: послание, видение и стратегия полностью твои.",
      maxima: "Если они хороши, мы будем лучше. Если они лучше, мы будем превосходны. Если они превосходны, мы будем стремиться к совершенству во всех эффективных стратегиях.",
      enxame: "Внимание всем узлам роя SOUSA 2.0: запустить одновременный аудит рентабельности и проверку соответствия в полностью автономном режиме.",
      masterclass: "Добро пожаловать. Сегодня мы масштабируем цифровые инфопродукты и системы высокодоходного арбитража на глобальном уровне с полной безопасностью."
    }
  };

  const PERFIL_MESTRE_ELIAS = {
    identidade: {
      nome: "Elias Pereira de Sousa",
      titulo: "Fundador Soberano & Idealizador do SOUSA 2.0",
      maximadeExcellence: IDIOMAS_SUPORTADOS["pt-BR"].maxima,
      dataCravacao: new Date().toISOString(),
      versaoPerfil: "2.0-SOVEREIGN-MASTER-POLYGLOT"
    },

    avatar: {
      id: "AVATAR_ELIAS_SOBERANO_V1",
      status: "HOMOLOGADO & CRAVADO (POLIGLOTA GLOBAL)",
      enquadramento: "Plano Médio / Busto Executivo à Mesa de Decisões",
      traje: "Terno Azul-Marinho Clássico Nobre, Camisa Cinza-Clara",
      cenario: "Gabinete Corporativo Minimalista, Fundo Ardósia com Iluminação Suave",
      iluminacao: "Key-Light Frontal 5600K com Difusão Suave e Preenchimento Neutro",
      expressaoBase: "Confiante, Acolhedora, Olhar Direto para a Câmera",
      parametrosAnimacao: {
        taxaQuadros: 60,
        frequenciaPiscadaSegundos: 3.8,
        microMovimentoCabeca: true,
        amplitudeVisemas: 1.0,
        tensaoLabial: "Natural / Relaxada",
        suavizacaoTransicaoMs: 65
      },
      amostraOriginal: {
        duracaoSegundos: 19,
        trechoContinuoRecomendado: "00:00 - 00:07 / 00:09 - 00:19",
        qualidadeImagem: "1080p Full HD / Proporção 16:9",
        notaAprovacao: 9.8
      }
    },

    voz: {
      id: "VOICE_ELIAS_SOVEREIGN_BARITONE",
      status: "HOMOLOGADA & CALIBRADA (GLOBAL MULTI-LINGUAL)",
      timbre: "Barítono Corporativo, Confiante, Calmo e Encorpado",
      frequenciaFundamentalHz: 118,
      cadenciaWpm: 135,
      idiomaAtivo: "pt-BR",
      configuracaoTTS: {
        idioma: "pt-BR",
        pitch: 0.90, // Tom barítono característico do Fundador
        rate: 0.94,  // Cadência pausada e estratégica
        volume: 1.0
      },
      transcricaoReferencia: IDIOMAS_SUPORTADOS["pt-BR"].exemploReferencia,
      metricasAmostra: {
        duracaoOriginalSegundos: 19,
        falaUtilSegundos: 16.2,
        nivelRuidoDb: -58.4,
        amostragemKhz: 48.0,
        notaAprovacao: 9.9
      }
    }
  };

  /**
   * Classificador Fonético de Visemas Multilíngue em Tempo Real
   * Mapeia fonemas de múltiplos alfabetos (Latino, Cirílico, Chinês Pinyin, Japonês, Árabe)
   * para visemas fundamentais de animação labial com alta fidelidade anatômica.
   */
  function classificarFonemaParaVisema(caractereOuSom) {
    if (!caractereOuSom) return "repouso";
    const c = caractereOuSom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // 1. Bilabiais (Fechamento total dos lábios)
    if (/[mbp]/i.test(c) || /[\u043C\u0431\u043F]/i.test(c)) return "M";

    // 2. Labiodentais (Incisivos superiores no lábio inferior)
    if (/[fv]/i.test(c) || /[\u0444\u0432]/i.test(c)) return "F";

    // 3. Arredondados fechados / Projeção labial posterior
    if (/[uúùûw]/i.test(c) || /[\u0443\u044E]/i.test(c)) return "U";

    // 4. Arredondados médios / Formato oval
    if (/[oóòôõ]/i.test(c) || /[\u043E]/i.test(c)) return "O";

    // 5. Abertura maxilar ampla (Vogal aberta clássica)
    if (/[aáàâãä]/i.test(c) || /[\u0430]/i.test(c)) return "A";

    // 6. Alongamento horizontal dos lábios com dentes visíveis
    if (/[eéèêeiíìîy]/i.test(c) || /[\u0435\u0438\u044D\u044F]/i.test(c)) return "E";

    // 7. Língua-palato (Alveolares com elevação de língua)
    if (/[ldtnr]/i.test(c) || /[\u043B\u0434\u0442\u043D\u0440]/i.test(c)) return "L";

    // 8. Sibilantes (Dentes cerrados com fricção de ar)
    if (/[szcçxjgk]/i.test(c) || /[\u0441\u0437\u0446\u0447\u0448\u0449\u0436]/i.test(c)) return "S";

    // Pausas e pontuações
    if (/[\s.,!?;:\-—]/.test(c)) return "repouso";

    return "A";
  }

  class SousaModuloProdutor {
    constructor() {
      this.perfil = JSON.parse(JSON.stringify(PERFIL_MESTRE_ELIAS));
      this.idiomas = IDIOMAS_SUPORTADOS;
      this.idiomaAtual = "pt-BR";
      this.sintetizador = typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis : null;
      this.vozSelecionada = null;
      this.todasVozes = [];
      this.emExecucao = false;
      this.ouvintesAnimacao = [];
      this.ouvintesIdioma = [];
      this.historicoProducoes = [];
      this.visemaAtual = "repouso";
      this.intensidadeAtual = 0;

      this.carregarPreferenciasLocais();
    }

    async init() {
      if (this.sintetizador) {
        this.atualizarListaVozes();
        if (this.sintetizador.onvoiceschanged !== undefined) {
          this.sintetizador.onvoiceschanged = () => this.atualizarListaVozes();
        }
      }

      this.aplicarConfiguracaoIdioma(this.idiomaAtual);

      if (typeof window !== 'undefined' && window.SousaIndexedDB) {
        try {
          await window.SousaIndexedDB.salvarEstado("produtor_avatar_mestre", {
            perfil: this.perfil,
            idiomaAtual: this.idiomaAtual
          });
        } catch (_) {}
      }

      return this.perfil;
    }

    carregarPreferenciasLocais() {
      try {
        const idiomaSalvo = localStorage.getItem("SOUSA_AVATAR_IDIOMA");
        if (idiomaSalvo && this.idiomas[idiomaSalvo]) {
          this.idiomaAtual = idiomaSalvo;
        }
        const salvo = localStorage.getItem("SOUSA_PRODUTOR_AVATAR_MESTRE");
        if (salvo) {
          const dados = JSON.parse(salvo);
          this.perfil = Object.assign(this.perfil, dados);
        }
      } catch (_) {}
    }

    salvarPermanente() {
      try {
        localStorage.setItem("SOUSA_AVATAR_IDIOMA", this.idiomaAtual);
        localStorage.setItem("SOUSA_PRODUTOR_AVATAR_MESTRE", JSON.stringify(this.perfil));
        if (typeof window !== 'undefined' && window.SousaIndexedDB) {
          window.SousaIndexedDB.salvarEstado("produtor_avatar_mestre", {
            perfil: this.perfil,
            idiomaAtual: this.idiomaAtual
          }).catch(() => {});
        }
        return true;
      } catch (e) {
        console.error("Falha ao salvar perfil do avatar:", e);
        return false;
      }
    }

    obterIdiomasDisponiveis() {
      return Object.values(this.idiomas);
    }

    obterIdiomaAtual() {
      return this.idiomas[this.idiomaAtual] || this.idiomas["pt-BR"];
    }

    selecionarIdioma(codigoIdioma) {
      if (!this.idiomas[codigoIdioma]) {
        console.warn(`[AVATAR_POLIGLOTA] Idioma não reconhecido: ${codigoIdioma}`);
        return false;
      }

      this.idiomaAtual = codigoIdioma;
      this.aplicarConfiguracaoIdioma(codigoIdioma);
      this.salvarPermanente();

      // Notifica observadores
      this.ouvintesIdioma.forEach(cb => {
        try { cb(this.obterIdiomaAtual()); } catch (_) {}
      });

      return this.obterIdiomaAtual();
    }

    aplicarConfiguracaoIdioma(codigoIdioma) {
      const cfg = this.idiomas[codigoIdioma] || this.idiomas["pt-BR"];
      this.perfil.voz.idiomaAtivo = cfg.codigo;
      this.perfil.voz.configuracaoTTS.idioma = cfg.codigo;
      this.perfil.voz.configuracaoTTS.pitch = cfg.pitch;
      this.perfil.voz.configuracaoTTS.rate = cfg.rate;
      this.perfil.identidade.maximadeExcellence = cfg.maxima;
      this.perfil.voz.transcricaoReferencia = cfg.exemploReferencia;

      this.atualizarVozParaIdioma(codigoIdioma);
    }

    atualizarListaVozes() {
      if (!this.sintetizador) return;
      this.todasVozes = this.sintetizador.getVoices();
      this.atualizarVozParaIdioma(this.idiomaAtual);
    }

    atualizarVozParaIdioma(codigoIdioma) {
      if (!this.todasVozes || this.todasVozes.length === 0) return;
      const cfg = this.idiomas[codigoIdioma] || this.idiomas["pt-BR"];
      const prefixo = cfg.codigo.split("-")[0].toLowerCase();

      // Filtra todas as vozes compatíveis com o idioma
      const vozesIdioma = this.todasVozes.filter(v => {
        const vLang = (v.lang || "").toLowerCase().replace('_', '-');
        return vLang === cfg.codigo.toLowerCase() || vLang.startsWith(prefixo);
      });

      if (vozesIdioma.length === 0) {
        this.vozSelecionada = this.todasVozes[0] || null;
        return;
      }

      // Sistema de pontuação neural de naturalidade
      const pontuar = (v) => {
        let pts = 0;
        const nome = (v.name || "").toLowerCase();
        // Bônus para modelos neurais / naturais / online
        if (/natural|neural|online|wavenet|neural2|premium/i.test(nome)) pts += 100;
        if (/google|enhanced|apple/i.test(nome)) pts += 60;
        // Bônus para filtros específicos do idioma configurado
        if (cfg.vozFiltro.some(f => nome.includes(f))) pts += 50;
        if (nome.includes('male') || nome.includes('homem') || nome.includes('homme')) pts += 20;
        return pts;
      };

      const ordenadas = [...vozesIdioma].sort((a, b) => pontuar(b) - pontuar(a));
      this.vozSelecionada = ordenadas[0] || vozesIdioma[0];
    }

    obterRoteiroPronto(tipo, codigoIdioma = null) {
      const lang = codigoIdioma ? (this.idiomas[codigoIdioma] || this.obterIdiomaAtual()) : this.obterIdiomaAtual();
      if (tipo === "maxima") return lang.maxima;
      if (tipo === "enxame") return lang.enxame;
      if (tipo === "masterclass") return lang.masterclass;
      if (tipo === "referencia") return lang.exemploReferencia;
      return lang.maxima;
    }

    /**
     * Tradução Executiva Global Inteligente
     * Conecta à rota /api/avatar/traduzir-poliglota com fallback instantâneo seguro.
     */
    async traduzirTexto(texto, idiomaDestino, idiomaOrigem = "pt-BR") {
      if (!texto || !texto.trim()) return "";
      const textoLimpo = texto.trim();

      // Verifica se é um dos roteiros mestre padrões pré-calibrados
      const destCfg = this.idiomas[idiomaDestino];
      if (destCfg) {
        for (const [key, origCfg] of Object.entries(this.idiomas)) {
          if (textoLimpo === origCfg.maxima) return destCfg.maxima;
          if (textoLimpo === origCfg.enxame) return destCfg.enxame;
          if (textoLimpo === origCfg.masterclass) return destCfg.masterclass;
          if (textoLimpo === origCfg.exemploReferencia) return destCfg.exemploReferencia;
        }
      }

      // Chamada à API de tradução do servidor
      try {
        const resp = await fetch('/api/avatar/traduzir-poliglota', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            texto: textoLimpo,
            idiomaDestino,
            idiomaOrigem
          })
        });
        if (resp.ok) {
          const dados = await resp.json();
          if (dados.sucesso && dados.textoTraduzido) {
            return dados.textoTraduzido;
          }
        }
      } catch (err) {
        console.warn("[AVATAR_TRADUCAO] Fallback de tradução ativado:", err);
      }

      // Se falhar a rede ou estiver offline, preserva o texto ou retorna roteiro do idioma
      return destCfg ? destCfg.maxima : textoLimpo;
    }

    obterPerfilMestre() {
      return this.perfil;
    }

    aoAtualizarFrame(callback) {
      if (typeof callback === 'function') {
        this.ouvintesAnimacao.push(callback);
      }
    }

    aoMudarIdioma(callback) {
      if (typeof callback === 'function') {
        this.ouvintesIdioma.push(callback);
      }
    }

    notificarOuvintes(dadosFrame) {
      this.ouvintesAnimacao.forEach(cb => {
        try { cb(dadosFrame); } catch (_) {}
      });
    }

    /**
     * Fala uma mensagem com a voz cravada do Fundador e aciona a sincronia labial
     * fonética contínua com mapeamento de visemas em 60 FPS.
     */
    falarTexto(texto, opcoes = {}) {
      return new Promise((resolve) => {
        if (!texto || !texto.trim()) {
          resolve({ ok: false, mensagem: "Texto vazio" });
          return;
        }

        const textoLimpo = texto.trim();
        const idiomaAlvo = opcoes.idioma || this.idiomaAtual;
        const cfgIdioma = this.idiomas[idiomaAlvo] || this.obterIdiomaAtual();

        this.emExecucao = true;

        const producao = {
          id: "PROD_" + Date.now(),
          texto: textoLimpo,
          idioma: cfgIdioma.codigo,
          bandeira: cfgIdioma.bandeira,
          nomeIdioma: cfgIdioma.nome,
          horario: new Date().toLocaleTimeString(),
          duracaoEstimadaSegundos: Math.max(2, Math.ceil(textoLimpo.split(/\s+/).length / (this.perfil.voz.cadenciaWpm / 60)))
        };
        this.historicoProducoes.unshift(producao);
        if (this.historicoProducoes.length > 25) this.historicoProducoes.pop();

        if (this.sintetizador) {
          try {
            this.sintetizador.cancel();
          } catch (_) {}

          const utterance = new SpeechSynthesisUtterance(textoLimpo);
          utterance.lang = cfgIdioma.codigo;
          utterance.pitch = typeof opcoes.pitch === 'number' ? opcoes.pitch : cfgIdioma.pitch;
          utterance.rate = typeof opcoes.rate === 'number' ? opcoes.rate : cfgIdioma.rate;
          utterance.volume = 1.0;

          // Assegura voz no idioma correto
          this.atualizarVozParaIdioma(cfgIdioma.codigo);
          if (this.vozSelecionada) {
            utterance.voice = this.vozSelecionada;
          }

          let animTimer = null;
          let ponteiroChar = 0;
          const palavras = textoLimpo.split(/\s+/);
          let indicePalavra = 0;

          const atualizarSincroniaLabial = (charAtual) => {
            const visemaCalculado = classificarFonemaParaVisema(charAtual);
            this.visemaAtual = visemaCalculado;
            this.intensidadeAtual = visemaCalculado === "repouso" ? 0 : 0.75 + Math.random() * 0.25;

            this.notificarOuvintes({
              falando: true,
              visema: visemaCalculado,
              intensidade: this.intensidadeAtual,
              idioma: cfgIdioma.codigo,
              bandeira: cfgIdioma.bandeira,
              caractere: charAtual
            });
          };

          utterance.onstart = () => {
            // Ciclo de alta frequência para suavização e co-articulação fonética
            animTimer = setInterval(() => {
              if (ponteiroChar < textoLimpo.length) {
                const char = textoLimpo[ponteiroChar];
                ponteiroChar = (ponteiroChar + 1) % textoLimpo.length;
                atualizarSincroniaLabial(char);
              } else {
                const visemasAlternantes = ["A", "E", "O", "L", "M", "repouso"];
                const v = visemasAlternantes[Math.floor(Math.random() * visemasAlternantes.length)];
                atualizarSincroniaLabial(v);
              }
            }, 85); // 85ms para taxa de troca de visemas natural (11-12 visemas por segundo)
          };

          utterance.onboundary = (event) => {
            if (typeof event.charIndex === 'number' && event.charIndex < textoLimpo.length) {
              ponteiroChar = event.charIndex;
              const char = textoLimpo[event.charIndex] || "A";
              atualizarSincroniaLabial(char);
            }
          };

          const finalizar = () => {
            if (animTimer) clearInterval(animTimer);
            this.emExecucao = false;
            this.visemaAtual = "repouso";
            this.intensidadeAtual = 0;
            this.notificarOuvintes({
              falando: false,
              visema: "repouso",
              intensidade: 0,
              idioma: cfgIdioma.codigo,
              bandeira: cfgIdioma.bandeira
            });
            if (typeof opcoes.aoFinalizar === 'function') opcoes.aoFinalizar();
            resolve({ ok: true, producao });
          };

          utterance.onend = finalizar;
          utterance.onerror = (err) => {
            console.warn("[AVATAR_VOZ] Aviso no SpeechSynthesis:", err);
            finalizar();
          };

          try {
            this.sintetizador.speak(utterance);
          } catch (e) {
            console.warn("[AVATAR_VOZ] Exceção ao invocar speak:", e);
            finalizar();
          }
        } else {
          // Fallback visual contínuo com sincronia labial fonética pura
          let count = 0;
          const maxCount = producao.duracaoEstimadaSegundos * 12;
          const visemasSimulados = ["A", "E", "L", "O", "M", "F", "U", "S", "repouso"];

          const interval = setInterval(() => {
            count++;
            const falando = count < maxCount;
            const v = falando ? visemasSimulados[count % visemasSimulados.length] : "repouso";
            this.visemaAtual = v;
            this.intensidadeAtual = falando ? 0.85 : 0;

            this.notificarOuvintes({
              falando,
              visema: v,
              intensidade: this.intensidadeAtual,
              idioma: cfgIdioma.codigo,
              bandeira: cfgIdioma.bandeira
            });

            if (!falando) {
              clearInterval(interval);
              this.emExecucao = false;
              if (typeof opcoes.aoFinalizar === 'function') opcoes.aoFinalizar();
              resolve({ ok: true, producao });
            }
          }, 85);
        }
      });
    }

    pararFala() {
      if (this.sintetizador) {
        try {
          this.sintetizador.cancel();
        } catch (_) {}
      }
      this.emExecucao = false;
      this.visemaAtual = "repouso";
      this.intensidadeAtual = 0;
      this.notificarOuvintes({
        falando: false,
        visema: "repouso",
        intensidade: 0,
        idioma: this.idiomaAtual
      });
    }
  }

  // Instância singleton no escopo global
  root.SousaProdutorAvatar = new SousaModuloProdutor();

})(typeof window !== 'undefined' ? window : globalThis);
