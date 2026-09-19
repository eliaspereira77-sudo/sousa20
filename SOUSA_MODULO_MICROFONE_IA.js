/**
 * ============================================================================
 * SOUSA 2.0 — MÓDULO MICROFONE & VOZ INTERATIVA DA SOUSA IA (JARVIS)
 * ============================================================================
 * Captura de voz em tempo real via Web Speech API (SpeechRecognition),
 * Análise espectral de decibéis via Web Audio API, sintetização de retorno
 * vocal (TTS) e comandos orais para o ecossistema SOUSA 2.0.
 */

(function(root) {
  'use strict';

  class SousaModuloMicrofoneIA {
    constructor() {
      this.reconhecedor = null;
      this.audioCtx = null;
      this.analisador = null;
      this.streamMicrofone = null;
      this.animFrameId = null;

      this.ouvindo = false;
      this.transcricaoAtual = "";
      this.transcricaoIntermediaria = "";
      this.respostaPorVozAtiva = localStorage.getItem("SOUSA_VOZ_JARVIS_ATIVA") !== "false"; // Padrão ligado
      this.tipoVoz = localStorage.getItem("SOUSA_VOZ_TIPO") || "ELIAS"; // Padrão: "ELIAS" (Minha Voz), opção "JARVIS"
      this.autoEnviarAoPausar = localStorage.getItem("SOUSA_VOZ_AUTO_ENVIAR") === "true";

      // Calibração Acústica Independente para a Voz do JARVIS (não afeta a voz do Fundador)
      this.jarvisPitch = parseFloat(localStorage.getItem("SOUSA_JARVIS_PITCH")) || 1.08;
      this.jarvisRate = parseFloat(localStorage.getItem("SOUSA_JARVIS_RATE")) || 1.12;

      this.ouvintesEstado = [];
      this.ouvintesTranscricao = [];
      this.ouvintesVolume = [];
      this.ouvintesTipoVoz = [];

      this.suportado = typeof window !== 'undefined' && 
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

      this.inicializarReconhecedor();
    }

    inicializarReconhecedor() {
      if (!this.suportado) {
        console.warn("[SOUSA_MIC] SpeechRecognition não suportado neste navegador.");
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.reconhecedor = new SpeechRecognition();
      this.reconhecedor.lang = 'pt-BR';
      this.reconhecedor.continuous = false;
      this.reconhecedor.interimResults = true;
      this.reconhecedor.maxAlternatives = 1;

      this.reconhecedor.onstart = () => {
        this.ouvindo = true;
        this.tocarBeep("inicio");
        this.notificarEstado("ouvindo", { mensagem: "Ouvindo o Fundador... Fale sua instrução" });
      };

      this.reconhecedor.onresult = (evento) => {
        let textoIntermediario = "";
        let textoFinal = "";

        for (let i = evento.resultIndex; i < evento.results.length; ++i) {
          const item = evento.results[i];
          if (item.isFinal) {
            textoFinal += item[0].transcript;
          } else {
            textoIntermediario += item[0].transcript;
          }
        }

        this.transcricaoIntermediaria = textoIntermediario;
        if (textoFinal) {
          this.transcricaoAtual = textoFinal;
          this.notificarTranscricao({ texto: textoFinal, final: true });
        } else if (textoIntermediario) {
          this.notificarTranscricao({ texto: textoIntermediario, final: false });
        }
      };

      this.reconhecedor.onerror = (evento) => {
        console.warn("[SOUSA_MIC] Erro no microfone:", evento.error);
        let msgAmigavel = "Erro na captura de áudio";
        if (evento.error === "not-allowed" || evento.error === "service-not-allowed") {
          msgAmigavel = "Permissão do microfone negada. Autorize o acesso ao microfone no navegador.";
        } else if (evento.error === "no-speech") {
          msgAmigavel = "Nenhuma fala detectada pelo microfone.";
        } else if (evento.error === "network") {
          msgAmigavel = "Falha de rede no serviço de transcrição vocal.";
        }
        this.tocarBeep("erro");
        this.notificarEstado("erro", { erro: evento.error, mensagem: msgAmigavel });
        this.encerrarAudioStream();
      };

      this.reconhecedor.onend = () => {
        const estavaOuvindo = this.ouvindo;
        this.ouvindo = false;
        this.encerrarAudioStream();
        this.tocarBeep("fim");

        // Registra automaticamente a frase captada na Memória Sonora se houver transcrição
        if (this.transcricaoAtual && this.transcricaoAtual.trim() && window.SousaMemoriaSonora) {
          try {
            const tempoDecorrido = Math.max(1.5, ((Date.now() - (this.timestampInicioFala || (Date.now() - 3000))) / 1000));
            const wavBlob = window.SousaMemoriaSonora.gerarWavSintetizado(this.transcricaoAtual, tempoDecorrido);
            window.SousaMemoriaSonora.adicionarGravacaoExterna({
              texto: this.transcricaoAtual,
              wavBlob: wavBlob,
              duracaoSeg: tempoDecorrido.toFixed(1),
              origem: "COMANDO MICROFONE SOUSA IA"
            });
          } catch (errMem) {
            console.warn("[SOUSA_MIC] Aviso ao registrar na Memória Sonora:", errMem);
          }
        }

        this.notificarEstado("parado", { 
          mensagem: "Microfone desligado",
          textoFinal: this.transcricaoAtual,
          autoEnviar: this.autoEnviarAoPausar && !!this.transcricaoAtual.trim()
        });
      };
    }

    async iniciar() {
      if (!this.suportado) {
        this.notificarEstado("erro", {
          mensagem: "Seu navegador não possui suporte ao Web Speech API nativo. Utilize o Google Chrome, Edge ou navegador moderno compatível."
        });
        return false;
      }

      if (this.ouvindo) {
        this.parar();
        return false;
      }

      this.timestampInicioFala = Date.now();
      this.transcricaoAtual = "";
      this.transcricaoIntermediaria = "";
      this.notificarEstado("iniciando", { mensagem: "Iniciando captação do microfone..." });

      // Inicia análise de decibéis do áudio para efeito visual
      try {
        await this.iniciarAudioStream();
      } catch (errMedia) {
        console.warn("[SOUSA_MIC] Aviso ao acessar stream de áudio para visualizador:", errMedia);
      }

      try {
        this.reconhecedor.start();
        return true;
      } catch (err) {
        console.warn("[SOUSA_MIC] Falha ao iniciar recognition:", err);
        this.notificarEstado("erro", { mensagem: "Não foi possível acionar o microfone agora." });
        this.encerrarAudioStream();
        return false;
      }
    }

    parar() {
      if (this.reconhecedor && this.ouvindo) {
        try {
          this.reconhecedor.stop();
        } catch (_) {}
      }
      this.ouvindo = false;
      this.encerrarAudioStream();
      this.notificarEstado("parado", { mensagem: "Microfone parado manualmente" });
    }

    alternar() {
      if (this.ouvindo) {
        this.parar();
        return false;
      } else {
        return this.iniciar();
      }
    }

    async iniciarAudioStream() {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return;
      }

      try {
        this.streamMicrofone = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        this.audioCtx = new AudioContextClass();
        const fonte = this.audioCtx.createMediaStreamSource(this.streamMicrofone);
        this.analisador = this.audioCtx.createAnalyser();
        this.analisador.fftSize = 64;
        this.analisador.smoothingTimeConstant = 0.8;
        fonte.connect(this.analisador);

        const dadosFrequencia = new Uint8Array(this.analisador.frequencyBinCount);

        const monitorarVolume = () => {
          if (!this.ouvindo || !this.analisador) return;
          this.analisador.getByteFrequencyData(dadosFrequencia);
          let soma = 0;
          for (let i = 0; i < dadosFrequencia.length; i++) {
            soma += dadosFrequencia[i];
          }
          const media = soma / dadosFrequencia.length;
          const volumePorcentagem = Math.min(100, Math.round((media / 128) * 100));

          this.notificarVolume(volumePorcentagem, dadosFrequencia);
          this.animFrameId = requestAnimationFrame(monitorarVolume);
        };

        this.animFrameId = requestAnimationFrame(monitorarVolume);
      } catch (e) {
        // Ignora silenciosamente se o usuário já deu permissão no SpeechRecognition
      }
    }

    encerrarAudioStream() {
      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      if (this.streamMicrofone) {
        try {
          this.streamMicrofone.getTracks().forEach(t => t.stop());
        } catch (_) {}
        this.streamMicrofone = null;
      }
      if (this.audioCtx && this.audioCtx.state !== 'closed') {
        try {
          this.audioCtx.close();
        } catch (_) {}
        this.audioCtx = null;
      }
      this.analisador = null;
      this.notificarVolume(0, []);
    }

    tocarBeep(tipo) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const ganho = ctx.createGain();

        osc.connect(ganho);
        ganho.connect(ctx.destination);

        const agora = ctx.currentTime;
        if (tipo === "inicio") {
          osc.frequency.setValueAtTime(540, agora);
          osc.frequency.exponentialRampToValueAtTime(780, agora + 0.08);
          ganho.gain.setValueAtTime(0.08, agora);
          ganho.gain.exponentialRampToValueAtTime(0.001, agora + 0.12);
          osc.start(agora);
          osc.stop(agora + 0.12);
        } else if (tipo === "fim") {
          osc.frequency.setValueAtTime(740, agora);
          osc.frequency.exponentialRampToValueAtTime(440, agora + 0.08);
          ganho.gain.setValueAtTime(0.08, agora);
          ganho.gain.exponentialRampToValueAtTime(0.001, agora + 0.12);
          osc.start(agora);
          osc.stop(agora + 0.12);
        } else if (tipo === "erro") {
          osc.frequency.setValueAtTime(260, agora);
          ganho.gain.setValueAtTime(0.09, agora);
          ganho.gain.exponentialRampToValueAtTime(0.001, agora + 0.18);
          osc.start(agora);
          osc.stop(agora + 0.18);
        }
      } catch (_) {}
    }

    definirTipoVoz(tipo) {
      const tipoNormalizado = (tipo && tipo.toUpperCase() === "JARVIS") ? "JARVIS" : "ELIAS";
      this.tipoVoz = tipoNormalizado;
      localStorage.setItem("SOUSA_VOZ_TIPO", this.tipoVoz);
      this.notificarTipoVoz(this.tipoVoz);
      return this.tipoVoz;
    }

    alternarTipoVoz() {
      const novoTipo = this.tipoVoz === "ELIAS" ? "JARVIS" : "ELIAS";
      return this.definirTipoVoz(novoTipo);
    }

    obterTipoVoz() {
      return this.tipoVoz;
    }

    /**
     * Motor de Seleção Inteligente de Voz Neural / Natural
     * Prioriza vozes com modelos neurais e alta fidelidade prosódica humana
     */
    obterMelhorVozNatural(genero = "masculino") {
      if (typeof window === 'undefined' || !window.speechSynthesis) return null;
      const vozes = window.speechSynthesis.getVoices();
      if (!vozes || vozes.length === 0) return null;

      const vozesPt = vozes.filter(v => {
        const lang = (v.lang || "").toLowerCase().replace("_", "-");
        return lang === "pt-br" || lang.startsWith("pt");
      });

      if (vozesPt.length === 0) return vozes[0];

      // Sistema de pontuação acústica e neural
      const pontuarVoz = (v) => {
        let pontos = 0;
        const nome = (v.name || "").toLowerCase();
        const lang = (v.lang || "").toLowerCase().replace("_", "-");

        if (lang === "pt-br") pontos += 50;

        // Vozes Neurais / Online de alta fidelidade
        if (/natural|neural|online|wavenet|neural2|premium/i.test(nome)) pontos += 120;
        if (/google português|google pt/i.test(nome)) pontos += 90;
        if (/microsoft/i.test(nome)) pontos += 40;
        if (/apple|enhanced/i.test(nome)) pontos += 60;

        // Correspondência de gênero e expressividade
        if (genero === "masculino") {
          if (/antonio|felipe|daniel|ricardo|homem|male|mário|julio/i.test(nome)) pontos += 70;
          if (/francisca|luciana|maria|helena|female|mulher/i.test(nome)) pontos -= 30;
        } else if (genero === "feminino") {
          if (/francisca|luciana|maria|helena|female|mulher|leticia/i.test(nome)) pontos += 70;
          if (/antonio|felipe|daniel|ricardo|homem|male/i.test(nome)) pontos -= 30;
        }

        return pontos;
      };

      const ordenadas = [...vozesPt].sort((a, b) => pontuarVoz(b) - pontuarVoz(a));
      return ordenadas[0] || vozesPt[0];
    }

    /**
     * Pré-Processador Prosódico e Fonético
     * Converte siglas, acrônimos e pontuações secas em cadência conversacional
     * fluida com micro-pausas respiratórias, eliminando o tom robótico.
     */
    formatarTextoProsodiaNatural(texto) {
      if (!texto) return "";
      let t = texto
        // Remove markdown, tags e telemetria crua
        .replace(/\{.*?\}|\[.*?\]/g, "")
        .replace(/[#*`_~]/g, "")
        .trim();

      // Expansão fonética de siglas comuns no ecossistema SOUSA
      t = t.replace(/\bSOUSA 2\.0\b/gi, "Sousa dois ponto zero");
      t = t.replace(/\bSOUSA\b/g, "Sousa");
      t = t.replace(/\bIA\b/g, "inteligência artificial");
      t = t.replace(/\bSAC\b/g, "atendimento ao cliente");
      t = t.replace(/\bR\$\s*(\d+)/g, "$1 reais");
      t = t.replace(/\bWAV\b/gi, "uave");
      t = t.replace(/\bIndexedDB\b/gi, "índex de bê");
      t = t.replace(/\bDB\b/g, "banco de dados");
      t = t.replace(/\bms\b/g, "milissegundos");
      t = t.replace(/\bkHz\b/gi, "quilo-hertz");
      t = t.replace(/\bHz\b/gi, "hertz");
      t = t.replace(/\bAPI\b/g, "a p i");
      t = t.replace(/\bcfg\b/gi, "configuração");
      t = t.replace(/\bOK\b/gi, "ok");

      // Suavização prosódica para respiração humana:
      // Garante espaço após pontuações e adiciona micro-pausas respiratórias antes de conjunções
      t = t.replace(/([.?!])\s*([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ])/g, "$1, $2");
      t = t.replace(/\s*;\s*/g, ", ");
      t = t.replace(/\s*—\s*/g, ", ");
      t = t.replace(/\s*:\s*/g, ": ");

      return t.trim();
    }

    configurarVozJarvis(pitch, rate) {
      if (typeof pitch === "number" && !isNaN(pitch)) {
        this.jarvisPitch = Math.max(0.4, Math.min(2.0, parseFloat(pitch.toFixed(2))));
        localStorage.setItem("SOUSA_JARVIS_PITCH", this.jarvisPitch.toString());
      }
      if (typeof rate === "number" && !isNaN(rate)) {
        this.jarvisRate = Math.max(0.5, Math.min(2.0, parseFloat(rate.toFixed(2))));
        localStorage.setItem("SOUSA_JARVIS_RATE", this.jarvisRate.toString());
      }
      return { pitch: this.jarvisPitch, rate: this.jarvisRate };
    }

    obterConfigVozJarvis() {
      return { pitch: this.jarvisPitch, rate: this.jarvisRate };
    }

    testarVozJarvis(frase) {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
        const frasePadrao = "Sistemas operacionais online, Fundador. Entonação e prosódia humana calibradas com máxima fidelidade acústica.";
        const textoProcessado = this.formatarTextoProsodiaNatural(frase || frasePadrao);
        
        const utterance = new SpeechSynthesisUtterance(textoProcessado);
        utterance.lang = "pt-BR";
        // Em vozes naturais, pitch e rate próximos de 1.0 preservam os formantes vocais humanos
        utterance.pitch = Math.max(0.92, Math.min(1.08, this.jarvisPitch));
        utterance.rate = Math.max(0.92, Math.min(1.08, this.jarvisRate));

        const vozNatural = this.obterMelhorVozNatural("masculino");
        if (vozNatural) utterance.voice = vozNatural;

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("[SOUSA_VOZ] Erro ao testar voz Jarvis:", err);
      }
    }

    testarEntonacaoNatural(textoPersonalizado) {
      const demonstracao = textoPersonalizado || 
        "Eu sou Elias Pereira de Sousa, Fundador e Comandante do Ecossistema SOUSA 2.0. Construímos essa tecnologia sobre alicerces inabaláveis: honra, precisão analítica e soberania estratégica.";
      this.falarResposta(demonstracao);
    }

    falarResposta(texto) {
      if (!this.respostaPorVozAtiva || !texto || typeof window === 'undefined' || !window.speechSynthesis) {
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const textoProsodico = this.formatarTextoProsodiaNatural(texto);
        if (!textoProsodico) return;

        if (this.tipoVoz === "ELIAS") {
          // ===================================================================
          // VOZ DO FUNDADOR ELIAS PEREIRA DE SOUSA (PADRÃO SOBERANO HUMANIZADO)
          // ===================================================================
          // Se o módulo do Avatar falante estiver presente, aciona o avatar com sincronia labial
          if (window.SousaProdutorAvatar && typeof window.SousaProdutorAvatar.falarTexto === "function") {
            window.SousaProdutorAvatar.falarTexto(textoProsodico, { pitch: 0.98, rate: 0.98 });
            return;
          }

          // Divisão em orações/frases naturais para evitar monotonia sintética
          const sentencas = textoProsodico.match(/[^.!?:]+[.!?:]+/g) || [textoProsodico];
          const vozMasculina = this.obterMelhorVozNatural("masculino");

          sentencas.forEach((sentenca, idx) => {
            const sLimpa = sentenca.trim();
            if (!sLimpa) return;

            const utterance = new SpeechSynthesisUtterance(sLimpa);
            utterance.lang = "pt-BR";
            // 0.98x mantém a ressonância rica de peito barítono com modulação natural
            utterance.pitch = 0.98;
            utterance.rate = 0.98;
            if (vozMasculina) utterance.voice = vozMasculina;

            window.speechSynthesis.speak(utterance);
          });
        } else {
          // ===================================================================
          // VOZ DO ASSISTENTE JARVIS (ENTONAÇÃO NATURAL E DINÂMICA)
          // ===================================================================
          const sentencas = textoProsodico.match(/[^.!?:]+[.!?:]+/g) || [textoProsodico];
          const vozJarvis = this.obterMelhorVozNatural("masculino");

          sentencas.forEach((sentenca) => {
            const sLimpa = sentenca.trim();
            if (!sLimpa) return;

            const utterance = new SpeechSynthesisUtterance(sLimpa);
            utterance.lang = "pt-BR";
            utterance.pitch = Math.max(0.92, Math.min(1.10, this.jarvisPitch));
            utterance.rate = Math.max(0.94, Math.min(1.10, this.jarvisRate));
            if (vozJarvis) utterance.voice = vozJarvis;

            window.speechSynthesis.speak(utterance);
          });
        }
      } catch (err) {
        console.warn("[SOUSA_VOZ] Falha ao sintetizar resposta vocal:", err);
      }
    }

    falarRespostaJARVIS(texto) {
      return this.falarResposta(texto);
    }

    alternarRespostaPorVoz(ativar) {
      if (ativar === undefined) {
        this.respostaPorVozAtiva = !this.respostaPorVozAtiva;
      } else {
        this.respostaPorVozAtiva = !!ativar;
      }
      localStorage.setItem("SOUSA_VOZ_JARVIS_ATIVA", this.respostaPorVozAtiva ? "true" : "false");
      if (!this.respostaPorVozAtiva && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return this.respostaPorVozAtiva;
    }

    aoMudarEstado(cb) {
      if (typeof cb === 'function') this.ouvintesEstado.push(cb);
    }
    aoOuvirTranscricao(cb) {
      if (typeof cb === 'function') this.ouvintesTranscricao.push(cb);
    }
    aoMudarVolume(cb) {
      if (typeof cb === 'function') this.ouvintesVolume.push(cb);
    }
    aoMudarTipoVoz(cb) {
      if (typeof cb === 'function') this.ouvintesTipoVoz.push(cb);
    }

    notificarEstado(estado, payload) {
      this.ouvintesEstado.forEach(cb => {
        try { cb(estado, payload); } catch (_) {}
      });
    }
    notificarTranscricao(dados) {
      this.ouvintesTranscricao.forEach(cb => {
        try { cb(dados); } catch (_) {}
      });
    }
    notificarVolume(vol, rawData) {
      this.ouvintesVolume.forEach(cb => {
        try { cb(vol, rawData); } catch (_) {}
      });
    }
    notificarTipoVoz(tipo) {
      this.ouvintesTipoVoz.forEach(cb => {
        try { cb(tipo); } catch (_) {}
      });
    }
  }

  // Instância singleton global
  root.SousaMicrofoneIA = new SousaModuloMicrofoneIA();

})(typeof window !== 'undefined' ? window : globalThis);
