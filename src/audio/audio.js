// audio.js - Sintetizador de Áudio Procedural usando Web Audio API
// 100% livre de dependências externas e sem falhas de carregamento

class SoundController {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.bgmPlaying = false;
        this.bgmTimer = null;
        this.bgmStep = 0;
        this.masterVolume = 0.8;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted && this.bgmPlaying) {
            this.stopBGM();
        } else if (!this.muted && !this.bgmPlaying) {
            this.startBGM();
        }
        return this.muted;
    }

    // Gerador de ruído branco para explosões e tiros
    createNoiseBuffer(duration = 0.5) {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    playShot(weaponType = 'shotgun') {
        if (this.muted) return;
        this.init();
        const t = this.ctx.currentTime;

        if (weaponType === 'shotgun') {
            // Estrondo encorpado de calibre 12
            const osc = this.ctx.createOscillator();
            const oscGain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(190, t);
            osc.frequency.exponentialRampToValueAtTime(30, t + 0.22);

            oscGain.gain.setValueAtTime(0.7 * this.masterVolume, t);
            oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

            osc.connect(oscGain);
            oscGain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.22);

            // Explosão de ruído com filtro passa-baixa
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.createNoiseBuffer(0.35);
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1400, t);
            filter.frequency.exponentialRampToValueAtTime(150, t + 0.35);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.9 * this.masterVolume, t);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);
            noise.start(t);

        } else if (weaponType === 'sniper') {
            // Tiro estridente e preciso de rifle
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(550, t);
            osc.frequency.exponentialRampToValueAtTime(70, t + 0.25);

            gain.gain.setValueAtTime(0.8 * this.masterVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.25);

            const noise = this.ctx.createBufferSource();
            noise.buffer = this.createNoiseBuffer(0.28);
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(2400, t);
            filter.Q.value = 3;

            const nGain = this.ctx.createGain();
            nGain.gain.setValueAtTime(0.8 * this.masterVolume, t);
            nGain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

            noise.connect(filter);
            filter.connect(nGain);
            nGain.connect(this.ctx.destination);
            noise.start(t);

        } else if (weaponType === 'machinegun') {
            // Rajada rápida e estalada
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(260, t);
            osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);

            gain.gain.setValueAtTime(0.5 * this.masterVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.08);

            const noise = this.ctx.createBufferSource();
            noise.buffer = this.createNoiseBuffer(0.08);
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 1600;

            const nGain = this.ctx.createGain();
            nGain.gain.setValueAtTime(0.5 * this.masterVolume, t);
            nGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

            noise.connect(filter);
            filter.connect(nGain);
            nGain.connect(this.ctx.destination);
            noise.start(t);

        } else if (weaponType === 'launcher') {
            // Disparo de canhão / foguete
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, t);
            osc.frequency.linearRampToValueAtTime(350, t + 0.15);
            osc.frequency.exponentialRampToValueAtTime(50, t + 0.4);

            gain.gain.setValueAtTime(0.8 * this.masterVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.4);
        }
    }

    // Guinho cômico de porco ("Oink / Wheee!")
    playPigOink() {
        if (this.muted) return;
        this.init();
        const t = this.ctx.currentTime;

        const carrier = this.ctx.createOscillator();
        const mod = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const gain = this.ctx.createGain();

        // Modulação em frequência (FM) cria o som anasalado de porco
        carrier.type = 'sawtooth';
        carrier.frequency.setValueAtTime(450, t);
        carrier.frequency.linearRampToValueAtTime(750, t + 0.08);
        carrier.frequency.exponentialRampToValueAtTime(320, t + 0.28);

        mod.type = 'sine';
        mod.frequency.setValueAtTime(45, t); // Tremolo rápido
        modGain.gain.setValueAtTime(140, t);

        mod.connect(carrier.frequency);

        gain.gain.setValueAtTime(0.4 * this.masterVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

        carrier.connect(gain);
        gain.connect(this.ctx.destination);

        mod.start(t);
        carrier.start(t);
        mod.stop(t + 0.28);
        carrier.stop(t + 0.28);
    }

    // Som de dano / grunhido
    playPigHit() {
        if (this.muted) return;
        this.init();
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(110, t + 0.14);

        gain.gain.setValueAtTime(0.5 * this.masterVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.14);
    }

    // Ricochete metálico em armadura
    playMetalClang() {
        if (this.muted) return;
        this.init();
        const t = this.ctx.currentTime;
        const freqs = [1800, 2400, 3100];
        freqs.forEach((f) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, t);
            osc.frequency.exponentialRampToValueAtTime(f * 0.7, t + 0.18);
            gain.gain.setValueAtTime(0.35 * this.masterVolume, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.18);
        });
    }

    // Grito cômico da Mulher do Fazendeiro (Dona Benta)
    playWifeYell() {
        if (this.muted) return;
        this.init();
        const t = this.ctx.currentTime;
        const pitches = [550, 680, 520, 720, 600];
        pitches.forEach((p, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = t + idx * 0.12;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(p, startTime);
            osc.frequency.exponentialRampToValueAtTime(p * 1.15, startTime + 0.1);
            gain.gain.setValueAtTime(0.35 * this.masterVolume, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.11);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.11);
        });
    }

    // Canto cômico do galo do moinho
    playRoosterCrow() {
        if (this.muted) return;
        this.init();
        const t = this.ctx.currentTime;
        const notes = [380, 480, 620, 850];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const st = t + idx * 0.15;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, st);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.1, st + 0.2);
            gain.gain.setValueAtTime(0.3 * this.masterVolume, st);
            gain.gain.exponentialRampToValueAtTime(0.01, st + 0.22);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(st);
            osc.stop(st + 0.22);
        });
    }

    // Grande explosão (TNT ou Chefão derrotado)
    playExplosion() {
        if (this.muted) return;
        this.init();
        const t = this.ctx.currentTime;

        // Sub grave
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(130, t);
        osc.frequency.exponentialRampToValueAtTime(25, t + 0.6);

        oscGain.gain.setValueAtTime(0.8 * this.masterVolume, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.6);

        // Estrondo de ruído
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.7);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, t);
        filter.frequency.exponentialRampToValueAtTime(80, t + 0.7);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.9 * this.masterVolume, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.7);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(t);
    }

    // Barulho de recarregamento metálico (clique-clack)
    playReload() {
        if (this.muted) return;
        this.init();
        const t = this.ctx.currentTime;

        const playClick = (time, freq) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(0.4 * this.masterVolume, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + 0.05);
        };

        playClick(t, 900);
        playClick(t + 0.12, 1300);
        playClick(t + 0.28, 750);
    }

    // Barulho satisfatório de trancamento de culatra / recarga concluída
    playReloadFinish() {
        if (this.muted) return;
        this.init();
        const t = this.ctx.currentTime;
        const playSnap = (time, freq) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, time);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.5, time + 0.06);
            gain.gain.setValueAtTime(0.5 * this.masterVolume, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + 0.06);
        };
        playSnap(t, 1400);
        playSnap(t + 0.08, 950);
    }

    // Clique seco ao tentar atirar sem munição
    playEmpty() {
        if (this.muted) return;
        this.init();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, t);
        gain.gain.setValueAtTime(0.3 * this.masterVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.03);
    }

    // Moeda de bônus / Porco Dourado
    playCoin() {
        if (this.muted) return;
        this.init();
        const t = this.ctx.currentTime;
        const notes = [987.77, 1318.51]; // B5 -> E6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = t + idx * 0.08;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.35 * this.masterVolume, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.22);
        });
    }

    // Modo Febre do Bacon / Ativação Especial
    playFrenzy() {
        if (this.muted) return;
        this.init();
        const t = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = t + idx * 0.07;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.4 * this.masterVolume, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.2);
        });
    }

    // Som de Sinos Natalinos (Jingle Bells)
    playJingleBells() {
        if (this.muted) return;
        this.init();
        const t = this.ctx.currentTime;
        const notes = [659.25, 659.25, 659.25, 659.25, 659.25, 659.25, 659.25, 783.99, 523.25, 587.33, 659.25];
        const times = [0, 0.14, 0.28, 0.50, 0.64, 0.78, 1.0, 1.14, 1.28, 1.42, 1.6];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = t + times[idx];
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.35 * this.masterVolume, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.22);
        });
    }

    // Risada de Papai Noel ("Ho! Ho! Ho!")
    playHoHoHo() {
        if (this.muted) return;
        this.init();
        const t = this.ctx.currentTime;
        const freqs = [140, 120, 100];
        freqs.forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = t + idx * 0.25;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, startTime);
            osc.frequency.exponentialRampToValueAtTime(f * 0.8, startTime + 0.18);
            gain.gain.setValueAtTime(0.35 * this.masterVolume, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.18);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.18);
        });
    }

    // Fim de jogo cômico
    playGameOver() {
        if (this.muted) return;
        this.init();
        const t = this.ctx.currentTime;
        const notes = [392, 370, 349, 311];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = t + idx * 0.22;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, startTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.9, startTime + 0.2);
            gain.gain.setValueAtTime(0.3 * this.masterVolume, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.2);
        });
    }

    // Trilha sonora procedural estilo arcade campestre / caipira alegre
    startBGM() {
        if (this.bgmPlaying || this.muted) return;
        this.init();
        this.bgmPlaying = true;
        this.bgmStep = 0;

        // Escala alegre caipira (Pentatônica Maior)
        const bassLine = [130.81, 196.00, 146.83, 196.00]; // C3, G3, D3, G3
        const leadScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];

        const tempoMs = 180; // ~130 BPM
        this.bgmTimer = setInterval(() => {
            if (!this.bgmPlaying || this.muted) return;
            const t = this.ctx.currentTime;

            // Baixo rítmico estilo banjo/country arcade
            const bassFreq = bassLine[this.bgmStep % bassLine.length];
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bassOsc.type = 'triangle';
            bassOsc.frequency.setValueAtTime(bassFreq, t);
            bassGain.gain.setValueAtTime(0.12 * this.masterVolume, t);
            bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
            bassOsc.connect(bassGain);
            bassGain.connect(this.ctx.destination);
            bassOsc.start(t);
            bassOsc.stop(t + 0.16);

            // Melodia alegre em síncope
            if (this.bgmStep % 2 === 0 || Math.random() > 0.4) {
                const leadFreq = leadScale[(this.bgmStep * 3 + Math.floor(Math.random() * 3)) % leadScale.length];
                const leadOsc = this.ctx.createOscillator();
                const leadGain = this.ctx.createGain();
                leadOsc.type = 'sine';
                leadOsc.frequency.setValueAtTime(leadFreq, t);
                leadGain.gain.setValueAtTime(0.08 * this.masterVolume, t);
                leadGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
                leadOsc.connect(leadGain);
                leadGain.connect(this.ctx.destination);
                leadOsc.start(t);
                leadOsc.stop(t + 0.14);
            }

            this.bgmStep = (this.bgmStep + 1) % 16;
        }, tempoMs);
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}

window.sounds = new SoundController();
