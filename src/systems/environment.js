// environment.js - Sistema Dinâmico de Cenários, Céu, Iluminação e Clima por Fase

const SCENARIO_THEMES = {
    DAY: {
        id: 'DAY',
        name: 'Manhã na Fazenda Dourada',
        icon: '🌾',
        skyTop: '#38ada9',
        skyMid: '#78e08f',
        skyBottom: '#f8efba',
        sunColor: '#fff200',
        sunGlow: 'rgba(255, 242, 0, 0.4)',
        sunX: 200,
        sunY: 100,
        sunRadius: 46,
        isNight: false,
        hasRain: false,
        hasEmbers: false,
        hasLeaves: false,
        hasFireflies: false,
        groundTop: '#55e6c1',
        groundMid: '#38ada9',
        groundBottom: '#1e3799',
        hillsFar: '#60a3bc',
        hillsMid: '#78e08f',
        hillsNear: '#38ada9',
        mudColor: '#6d4c41',
        mudDeep: '#4e342e',
        cloudColor: 'rgba(255, 255, 255, 0.92)'
    },
    SUNSET: {
        id: 'SUNSET',
        name: 'Pôr do Sol no Pomar de Outono',
        icon: '🌅',
        skyTop: '#4a154b',
        skyMid: '#e55039',
        skyBottom: '#fa983a',
        sunColor: '#f8c291',
        sunGlow: 'rgba(235, 47, 6, 0.45)',
        sunX: 640,
        sunY: 260,
        sunRadius: 65,
        isNight: false,
        hasRain: false,
        hasEmbers: false,
        hasLeaves: true,
        hasFireflies: false,
        groundTop: '#e58e26',
        groundMid: '#b71540',
        groundBottom: '#4c1130',
        hillsFar: '#6a097d',
        hillsMid: '#b83b5e',
        hillsNear: '#e58e26',
        mudColor: '#5c2d1b',
        mudDeep: '#3a1a0f',
        cloudColor: 'rgba(255, 204, 204, 0.75)'
    },
    NIGHT: {
        id: 'NIGHT',
        name: 'Noite de Luar no Chiqueiro Assombrado',
        icon: '🌙',
        skyTop: '#0a0d1a',
        skyMid: '#162238',
        skyBottom: '#1e375a',
        moonColor: '#f5f6fa',
        moonGlow: 'rgba(245, 246, 250, 0.35)',
        moonX: 950,
        moonY: 105,
        moonRadius: 44,
        isNight: true,
        hasRain: false,
        hasEmbers: false,
        hasLeaves: false,
        hasFireflies: true,
        groundTop: '#1b3a4b',
        groundMid: '#065a60',
        groundBottom: '#0b132b',
        hillsFar: '#0e1e38',
        hillsMid: '#13315c',
        hillsNear: '#1b3a4b',
        mudColor: '#2b1e1a',
        mudDeep: '#170f0d',
        cloudColor: 'rgba(120, 140, 180, 0.45)'
    },
    STORM: {
        id: 'STORM',
        name: 'Tempestade Suína com Relâmpagos',
        icon: '⛈️',
        skyTop: '#1e272e',
        skyMid: '#2f3542',
        skyBottom: '#57606f',
        isNight: false,
        hasRain: true,
        hasEmbers: false,
        hasLeaves: false,
        hasFireflies: false,
        groundTop: '#3d5a45',
        groundMid: '#243e2e',
        groundBottom: '#111e16',
        hillsFar: '#1e272e',
        hillsMid: '#2f3542',
        hillsNear: '#3d5a45',
        mudColor: '#423229',
        mudDeep: '#231812',
        cloudColor: 'rgba(47, 53, 66, 0.88)'
    },
    VOLCANO: {
        id: 'VOLCANO',
        name: 'Fortaleza Carmesim do Rei Porco',
        icon: '🌋',
        skyTop: '#2b0908',
        skyMid: '#7a140d',
        skyBottom: '#e64c12',
        isNight: false,
        hasRain: false,
        hasEmbers: true,
        hasLeaves: false,
        hasFireflies: false,
        groundTop: '#4a1208',
        groundMid: '#240602',
        groundBottom: '#0d0201',
        hillsFar: '#330805',
        hillsMid: '#5c0f08',
        hillsNear: '#4a1208',
        mudColor: '#290603',
        mudDeep: '#140201',
        cloudColor: 'rgba(92, 15, 8, 0.75)'
    },
    XMAS: {
        id: 'XMAS',
        name: 'Nevasca Mágica de Natal na Fazenda',
        icon: '🎄',
        skyTop: '#0a192f',
        skyMid: '#162e4a',
        skyBottom: '#274b70',
        moonColor: '#fffbe6',
        moonGlow: 'rgba(255, 250, 220, 0.5)',
        moonX: 950,
        moonY: 100,
        moonRadius: 48,
        isNight: true,
        hasRain: false,
        hasEmbers: false,
        hasLeaves: false,
        hasFireflies: false,
        hasSnow: true,
        hasAurora: true,
        groundTop: '#f1f5f9',
        groundMid: '#cbd5e1',
        groundBottom: '#94a3b8',
        hillsFar: '#203a54',
        hillsMid: '#385d82',
        hillsNear: '#5783aa',
        mudColor: '#334155',
        mudDeep: '#1e293b',
        cloudColor: 'rgba(226, 232, 240, 0.65)'
    }
};

class EnvironmentManager {
    constructor(virtualWidth = 1280, virtualHeight = 720) {
        this.w = virtualWidth;
        this.h = virtualHeight;

        this.currentThemeKey = 'DAY';
        this.theme = SCENARIO_THEMES.DAY;

        this.windmillAngle = 0;
        this.timeOfDay = 0;

        // Efeito de Relâmpago (Tempestade)
        this.lightningAlpha = 0;
        this.nextLightning = 3 + Math.random() * 4;

        // Estrelas fixas para a noite
        this.stars = Array.from({ length: 65 }, () => ({
            x: Math.random() * this.w,
            y: Math.random() * 320,
            radius: Math.random() * 1.8 + 0.6,
            twinkleSpeed: Math.random() * 3 + 1,
            phase: Math.random() * Math.PI * 2
        }));

        // Nuvens em camadas
        this.clouds = [
            { x: 50, y: 70, speed: 10, scale: 1.3, alpha: 0.9 },
            { x: 380, y: 110, speed: 7, scale: 0.95, alpha: 0.8 },
            { x: 720, y: 60, speed: 14, scale: 1.4, alpha: 0.95 },
            { x: 1050, y: 120, speed: 9, scale: 1.1, alpha: 0.85 },
            { x: 1320, y: 80, speed: 11, scale: 1.25, alpha: 0.88 }
        ];

        // Partículas atmosféricas
        this.rainDrops = Array.from({ length: 140 }, () => ({
            x: Math.random() * this.w,
            y: Math.random() * this.h,
            speedY: 700 + Math.random() * 350,
            speedX: -120,
            len: 16 + Math.random() * 12
        }));

        this.embers = Array.from({ length: 50 }, () => ({
            x: Math.random() * this.w,
            y: this.h + Math.random() * 100,
            speedY: -(60 + Math.random() * 90),
            speedX: (Math.random() - 0.5) * 40,
            size: Math.random() * 3 + 1.5,
            alpha: Math.random() * 0.8 + 0.2,
            pulse: Math.random() * 5
        }));

        this.fireflies = Array.from({ length: 25 }, () => ({
            x: Math.random() * this.w,
            y: 350 + Math.random() * 300,
            baseX: Math.random() * this.w,
            baseY: 350 + Math.random() * 300,
            speed: Math.random() * 1.5 + 0.5,
            radius: Math.random() * 2.5 + 1.5,
            phase: Math.random() * Math.PI * 2
        }));

        this.autumnLeaves = Array.from({ length: 30 }, () => ({
            x: Math.random() * this.w,
            y: Math.random() * this.h,
            speedX: 90 + Math.random() * 70,
            speedY: 40 + Math.random() * 40,
            rot: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 4,
            size: Math.random() * 8 + 7,
            color: Math.random() > 0.5 ? '#e55039' : '#f6b93b'
        }));

        // Flocos de neve natalinos
        this.snowFlakes = Array.from({ length: 90 }, () => ({
            x: Math.random() * this.w,
            y: Math.random() * this.h,
            speedY: 45 + Math.random() * 65,
            speedX: -15 + Math.random() * 30,
            radius: Math.random() * 2.8 + 1.2,
            alpha: Math.random() * 0.5 + 0.5,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 2 + 1
        }));

        // Trenó do Papai Noel cortando o céu noturno
        this.santaSleigh = {
            x: -250,
            y: 95,
            speed: 65,
            active: true
        };

        // Segredos & Easter Eggs
        this.moonHits = 0;
        this.moonBandages = [];
        this.wifeShoutTimer = 0;
        this.wifeShoutText = '';
        this.wifeSlideX = -450;
        this.roosterSpin = 0;
        this.snowmanHatOff = false;
    }

    setThemeByWave(waveNumber) {
        const sequence = ['DAY', 'SUNSET', 'NIGHT', 'XMAS', 'STORM', 'VOLCANO'];
        const index = (waveNumber - 1) % sequence.length;
        const newKey = sequence[index];
        if (newKey !== this.currentThemeKey) {
            this.currentThemeKey = newKey;
            this.theme = SCENARIO_THEMES[newKey];
            return { changed: true, theme: this.theme };
        }
        return { changed: false, theme: this.theme };
    }

    setThemeByArcadeTime(timeLeft, totalTime = 90) {
        const elapsed = totalTime - timeLeft;
        const ratio = Math.max(0, Math.min(1, elapsed / totalTime));

        let newKey = 'DAY';
        if (ratio > 0.78) newKey = 'VOLCANO';
        else if (ratio > 0.55) newKey = 'STORM';
        else if (ratio > 0.32) newKey = 'NIGHT';
        else if (ratio > 0.12) newKey = 'SUNSET';

        if (newKey !== this.currentThemeKey) {
            this.currentThemeKey = newKey;
            this.theme = SCENARIO_THEMES[newKey];
            return { changed: true, theme: this.theme };
        }
        return { changed: false, theme: this.theme };
    }

    update(dt) {
        this.timeOfDay += dt;

        // Vento gira o moinho (mais rápido na tempestade)
        const windMult = this.theme.id === 'STORM' ? 3.5 : 1.0;
        this.windmillAngle += dt * 0.9 * windMult;

        // Atualiza nuvens
        for (const c of this.clouds) {
            c.x += c.speed * dt * (this.theme.id === 'STORM' ? 2.2 : 1.0);
            if (c.x > this.w + 180) {
                c.x = -180;
                c.y = 50 + Math.random() * 110;
            }
        }

        // Relâmpagos dinâmicos
        if (this.theme.id === 'STORM') {
            this.nextLightning -= dt;
            if (this.nextLightning <= 0) {
                this.lightningAlpha = 0.85;
                this.nextLightning = 4 + Math.random() * 5;
                if (window.sounds && window.sounds.playExplosion) {
                    setTimeout(() => window.sounds.playExplosion(), 120);
                }
            }
            if (this.lightningAlpha > 0) {
                this.lightningAlpha = Math.max(0, this.lightningAlpha - dt * 2.8);
            }

            // Chuva caindo
            for (const r of this.rainDrops) {
                r.y += r.speedY * dt;
                r.x += r.speedX * dt;
                if (r.y > this.h) {
                    r.y = -20;
                    r.x = Math.random() * (this.w + 200);
                }
            }
        }

        // Cinzas vulcânicas subindo
        if (this.theme.id === 'VOLCANO') {
            for (const em of this.embers) {
                em.y += em.speedY * dt;
                em.x += em.speedX * dt + Math.sin(this.timeOfDay * 3 + em.pulse) * 1.5;
                if (em.y < -10) {
                    em.y = this.h + 20;
                    em.x = Math.random() * this.w;
                }
            }
        }

        // Vaga-lumes na noite
        if (this.theme.id === 'NIGHT') {
            for (const f of this.fireflies) {
                f.x = f.baseX + Math.sin(this.timeOfDay * f.speed + f.phase) * 35;
                f.y = f.baseY + Math.cos(this.timeOfDay * f.speed * 0.8 + f.phase) * 20;
            }
        }

        // Folhas de outono voando no Pôr do Sol
        if (this.theme.id === 'SUNSET') {
            for (const l of this.autumnLeaves) {
                l.x += l.speedX * dt;
                l.y += l.speedY * dt + Math.sin(this.timeOfDay * 2 + l.rot) * 1.2;
                l.rot += l.rotSpeed * dt;
                if (l.x > this.w + 40 || l.y > this.h + 40) {
                    l.x = -30;
                    l.y = Math.random() * (this.h - 150);
                }
            }
        }

        // Nevasca mágica de Natal e Trenó do Papai Noel
        if (this.theme.hasSnow) {
            for (const s of this.snowFlakes) {
                s.wobble += s.wobbleSpeed * dt;
                s.y += s.speedY * dt;
                s.x += (s.speedX + Math.sin(s.wobble) * 20) * dt;
                if (s.y > this.h) {
                    s.y = -10;
                    s.x = Math.random() * (this.w + 100);
                }
            }

            this.santaSleigh.x += this.santaSleigh.speed * dt;
            if (this.santaSleigh.x > this.w + 250) {
                this.santaSleigh.x = -250;
                this.santaSleigh.y = 70 + Math.random() * 50;
            }
        }

        // Atualiza Dona Benta (Bronca da Mulher do Fazendeiro ao atirar na lua)
        if (this.wifeShoutTimer > 0) {
            this.wifeShoutTimer -= dt;
            this.wifeSlideX = Math.min(25, this.wifeSlideX + dt * 1400);
        } else {
            this.wifeSlideX = Math.max(-500, this.wifeSlideX - dt * 900);
        }

        // Desacelera giro do cata-vento do moinho
        if (this.roosterSpin > 0) {
            this.roosterSpin = Math.max(0, this.roosterSpin - dt * 12);
        }
    }

    drawBackground(ctx) {
        ctx.save();

        // 1. Céu com Gradiente Rico
        this.drawSky(ctx);

        // 2. Estrelas Cintilantes (se for noite)
        if (this.theme.isNight) {
            this.drawStars(ctx);
        }

        // 3. Sol ou Lua
        this.drawCelestialBody(ctx);

        // 4. Nuvens em camadas
        this.drawClouds(ctx);

        // 5. Montanhas e Colinas em Parallax (3 Camadas)
        this.drawMountainsAndHills(ctx);

        // 6. Estruturas do Cenário (Celeiro, Moinho, Árvores ou Castelo)
        this.drawStructures(ctx);

        // 7. Chão / Pasto com Iluminação e Poça de Lama
        this.drawGround(ctx);

        // 8. Efeitos Climáticos Atmosféricos
        this.drawAtmosphere(ctx);

        ctx.restore();
    }

    drawSky(ctx) {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, 480);
        skyGrad.addColorStop(0, this.theme.skyTop);
        skyGrad.addColorStop(0.55, this.theme.skyMid);
        skyGrad.addColorStop(1, this.theme.skyBottom);

        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, this.w, 480);

        // Clarão de Relâmpago na Tempestade
        if (this.lightningAlpha > 0) {
            ctx.fillStyle = `rgba(235, 245, 255, ${this.lightningAlpha})`;
            ctx.fillRect(0, 0, this.w, 480);
        }
    }

    drawStars(ctx) {
        ctx.save();
        for (const s of this.stars) {
            const alpha = 0.35 + Math.sin(this.timeOfDay * s.twinkleSpeed + s.phase) * 0.45;
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, alpha)})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawCelestialBody(ctx) {
        ctx.save();
        if (this.theme.isNight) {
            // Lua Cheia Gigante com Halo e Crateras
            const mx = this.theme.moonX;
            const my = this.theme.moonY;
            const mr = this.theme.moonRadius;

            // Halo suave
            const glow = ctx.createRadialGradient(mx, my, mr * 0.8, mx, my, mr * 2.8);
            glow.addColorStop(0, this.theme.moonGlow);
            glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(mx, my, mr * 2.8, 0, Math.PI * 2);
            ctx.fill();

            // Disco lunar perolizado
            const moonGrad = ctx.createRadialGradient(mx - 10, my - 10, 6, mx, my, mr);
            moonGrad.addColorStop(0, '#ffffff');
            moonGrad.addColorStop(0.7, '#e4e7eb');
            moonGrad.addColorStop(1, '#b0b8c4');
            ctx.fillStyle = moonGrad;
            ctx.beginPath();
            ctx.arc(mx, my, mr, 0, Math.PI * 2);
            ctx.fill();

            // Crateras lunares suaves
            ctx.fillStyle = 'rgba(120, 130, 150, 0.28)';
            const drawCrater = (cx, cy, r) => {
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.fill();
            };
            drawCrater(mx - 14, my - 8, 8);
            drawCrater(mx + 10, my - 12, 6);
            drawCrater(mx + 6, my + 14, 11);
            drawCrater(mx - 8, my + 16, 5);

            // Curativos e band-aids na Lua se o jogador acertou tiros nela
            if (this.moonHits > 0) {
                for (const b of this.moonBandages) {
                    ctx.save();
                    ctx.translate(mx + b.x, my + b.y);
                    ctx.rotate(b.rot);
                    // Esparadrapo bege
                    ctx.fillStyle = '#f5cd79';
                    ctx.strokeStyle = '#e1b12c';
                    ctx.lineWidth = 1.2;
                    ctx.fillRect(-12, -5, 24, 10);
                    ctx.strokeRect(-12, -5, 24, 10);
                    // Cruzinha médica branca
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(-6, -2, 12, 4);
                    ctx.fillRect(-2, -6, 4, 12);
                    ctx.restore();
                }

                // Olhos zangados e gota de suor se tomou muitos tiros
                if (this.moonHits >= 2) {
                    ctx.strokeStyle = 'rgba(70, 80, 100, 0.7)';
                    ctx.lineWidth = 2.5;
                    // Sobrancelhas franzidas
                    ctx.beginPath();
                    ctx.moveTo(mx - 16, my - 16); ctx.lineTo(mx - 6, my - 12);
                    ctx.moveTo(mx + 16, my - 16); ctx.lineTo(mx + 6, my - 12);
                    ctx.stroke();

                    // Olhos fechados fazendo força
                    ctx.beginPath();
                    ctx.moveTo(mx - 14, my - 8); ctx.lineTo(mx - 6, my - 8);
                    ctx.moveTo(mx + 6, my - 8); ctx.lineTo(mx + 14, my - 8);
                    ctx.stroke();

                    // Boca emburrada
                    ctx.beginPath();
                    ctx.arc(mx, my + 16, 8, Math.PI + 0.5, -0.5);
                    ctx.stroke();

                    // Gota de suor cômica
                    ctx.fillStyle = '#00d2d3';
                    ctx.beginPath();
                    ctx.moveTo(mx + 26, my - 14);
                    ctx.lineTo(mx + 30, my - 4);
                    ctx.lineTo(mx + 22, my - 4);
                    ctx.closePath();
                    ctx.fill();
                }
            }

        } else if (this.theme.sunColor) {
            // Sol com Flare e Raio Solar
            const sx = this.theme.sunX;
            const sy = this.theme.sunY;
            const sr = this.theme.sunRadius;

            // Halo dourado brilhante
            const glow = ctx.createRadialGradient(sx, sy, sr * 0.7, sx, sy, sr * 2.4);
            glow.addColorStop(0, this.theme.sunGlow);
            glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(sx, sy, sr * 2.4, 0, Math.PI * 2);
            ctx.fill();

            // Disco solar
            const sunGrad = ctx.createRadialGradient(sx - 8, sy - 8, 4, sx, sy, sr);
            sunGrad.addColorStop(0, '#ffffff');
            sunGrad.addColorStop(0.5, this.theme.sunColor);
            sunGrad.addColorStop(1, this.theme.id === 'SUNSET' ? '#eb2f06' : '#f39c12');
            ctx.fillStyle = sunGrad;
            ctx.beginPath();
            ctx.arc(sx, sy, sr, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawClouds(ctx) {
        ctx.save();
        for (const c of this.clouds) {
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.scale(c.scale, c.scale);
            ctx.fillStyle = this.theme.cloudColor;
            ctx.beginPath();
            ctx.arc(0, 0, 24, 0, Math.PI * 2);
            ctx.arc(22, -10, 28, 0, Math.PI * 2);
            ctx.arc(48, -4, 22, 0, Math.PI * 2);
            ctx.arc(68, 6, 18, 0, Math.PI * 2);
            ctx.arc(26, 12, 22, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }

    drawMountainsAndHills(ctx) {
        ctx.save();

        // 1. Montanhas Distantes (Camada 1)
        ctx.fillStyle = this.theme.hillsFar;
        ctx.beginPath();
        ctx.moveTo(0, 470);
        ctx.lineTo(0, 370);
        ctx.lineTo(180, 290);
        ctx.lineTo(390, 380);
        ctx.lineTo(580, 270);
        ctx.lineTo(820, 390);
        ctx.lineTo(1040, 260);
        ctx.lineTo(this.w, 360);
        ctx.lineTo(this.w, 480);
        ctx.closePath();
        ctx.fill();

        // Se for Vulcão: desenha rio de lava descendo da montanha
        if (this.theme.id === 'VOLCANO') {
            ctx.strokeStyle = '#ff9f1a';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(580, 270);
            ctx.quadraticCurveTo(600, 330, 570, 390);
            ctx.stroke();
            ctx.strokeStyle = '#ff3838';
            ctx.lineWidth = 2.5;
            ctx.stroke();
        }

        // 2. Colinas Médias (Camada 2)
        ctx.fillStyle = this.theme.hillsMid;
        ctx.beginPath();
        ctx.moveTo(0, 460);
        ctx.quadraticCurveTo(280, 330, 620, 420);
        ctx.quadraticCurveTo(940, 310, this.w, 430);
        ctx.lineTo(this.w, 480);
        ctx.lineTo(0, 480);
        ctx.closePath();
        ctx.fill();

        // 3. Colinas Próximas (Camada 3)
        ctx.fillStyle = this.theme.hillsNear;
        ctx.beginPath();
        ctx.moveTo(0, 450);
        ctx.quadraticCurveTo(340, 410, 700, 460);
        ctx.quadraticCurveTo(1050, 420, this.w, 465);
        ctx.lineTo(this.w, 480);
        ctx.lineTo(0, 480);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    drawStructures(ctx) {
        if (this.theme.id === 'VOLCANO') {
            // Castelo de Pedra Vulcânico do Rei Porco
            this.drawCastle(ctx, 960, 270);
        } else if (this.theme.id === 'XMAS') {
            // Edição Mágica de Natal: Celeiro com Neve e Guirlanda, Moinho Iluminado, Pinheiro e Boneco de Neve
            this.drawChristmasBarn(ctx, 980, 310);
            this.drawChristmasWindmill(ctx, 220, 340);
            this.drawPineTree(ctx, 740, 470);
            this.drawSnowman(ctx, 580, 520);
        } else if (this.theme.id === 'SUNSET') {
            // Moinho + Macieira de Outono
            this.drawWindmill(ctx, 220, 340);
            this.drawAppleTree(ctx, 980, 310);
            this.drawPumpkinPatch(ctx, 740, 520);
        } else if (this.theme.id === 'NIGHT') {
            // Celeiro Assombrado com Luzes Aconchegantes e Abóboras Esculpidas
            this.drawBarnNight(ctx, 980, 310);
            this.drawWindmill(ctx, 220, 340);
            this.drawJackOLantern(ctx, 780, 520);
        } else {
            // Fazenda Clássica Ensolarada ou Chuvosa
            this.drawWindmill(ctx, 220, 340);
            this.drawBarn(ctx, 980, 310);
            this.drawHayBale(ctx, 750, 520);
            this.drawHayBale(ctx, 810, 530);
        }
    }

    drawGround(ctx) {
        ctx.save();
        // Gradiente rico de profundidade no pasto
        const groundGrad = ctx.createLinearGradient(0, 440, 0, this.h);
        groundGrad.addColorStop(0, this.theme.groundTop);
        groundGrad.addColorStop(0.35, this.theme.groundMid);
        groundGrad.addColorStop(1, this.theme.groundBottom);

        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, 440, this.w, this.h - 440);

        // Poça de Lama (onde os porcos de lama aparecem)
        ctx.fillStyle = this.theme.mudColor;
        ctx.beginPath();
        ctx.ellipse(450, 560, 115, 36, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.theme.mudDeep;
        ctx.beginPath();
        ctx.ellipse(446, 562, 90, 26, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ondinhas líquidas na lama
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(440, 558, 45, 12, 0, 0, Math.PI);
        ctx.stroke();

        ctx.restore();
    }

    drawWindmill(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        // Torre do Moinho com textura chanfrada
        ctx.fillStyle = '#ecf0f1';
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-18, 95);
        ctx.lineTo(-11, 0);
        ctx.lineTo(11, 0);
        ctx.lineTo(18, 95);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Telhado cônico
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(0, -24);
        ctx.lineTo(15, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cata-vento com Galo no topo (Easter Egg atirável)
        this.drawRoosterWeatherVane(ctx);

        // Pás rotativas
        ctx.translate(0, -6);
        ctx.rotate(this.windmillAngle);
        ctx.strokeStyle = '#6c5ce7';
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.strokeRect(0, -6, 48, 12);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(48, 0);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawBarn(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        // Parede frontal de tábuas de celeiro
        ctx.fillStyle = '#c0392b';
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 3;
        ctx.fillRect(0, 50, 185, 115);
        ctx.strokeRect(0, 50, 185, 115);

        // Telhado clássico de celeiro americano
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.moveTo(-12, 50);
        ctx.lineTo(25, 0);
        ctx.lineTo(92, -26);
        ctx.lineTo(160, 0);
        ctx.lineTo(196, 50);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Porta branca com travessa em 'X'
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(62, 85, 62, 80);
        ctx.strokeRect(62, 85, 62, 80);
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(62, 85); ctx.lineTo(124, 165);
        ctx.moveTo(124, 85); ctx.lineTo(62, 165);
        ctx.stroke();

        // Janela do sótão
        ctx.fillStyle = '#f9ca24';
        ctx.fillRect(82, 12, 22, 22);
        ctx.strokeRect(82, 12, 22, 22);

        ctx.restore();
    }

    drawBarnNight(ctx, x, y) {
        this.drawBarn(ctx, x, y);
        ctx.save();
        ctx.translate(x, y);

        // Luz dourada acesa projetada da janela do celeiro
        const lightGrad = ctx.createRadialGradient(93, 23, 2, 93, 23, 70);
        lightGrad.addColorStop(0, 'rgba(249, 202, 36, 0.7)');
        lightGrad.addColorStop(1, 'rgba(249, 202, 36, 0)');
        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.arc(93, 23, 70, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawAppleTree(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        // Tronco robusto
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(50, 40, 24, 100);

        // Copa de outono dourada e avermelhada
        ctx.fillStyle = '#e67e22';
        ctx.beginPath();
        ctx.arc(40, 20, 45, 0, Math.PI * 2);
        ctx.arc(80, 0, 50, 0, Math.PI * 2);
        ctx.arc(60, -30, 48, 0, Math.PI * 2);
        ctx.fill();

        // Maçãs vermelhas penduradas
        ctx.fillStyle = '#e74c3c';
        const drawApple = (ax, ay) => {
            ctx.beginPath();
            ctx.arc(ax, ay, 5, 0, Math.PI * 2);
            ctx.fill();
        };
        drawApple(30, 15);
        drawApple(75, 10);
        drawApple(55, -20);
        drawApple(85, -15);
        ctx.restore();
    }

    drawCastle(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        // Muralha de Pedra Escura
        ctx.fillStyle = '#2d3436';
        ctx.strokeStyle = '#1e272e';
        ctx.lineWidth = 3;
        ctx.fillRect(0, 30, 210, 140);
        ctx.strokeRect(0, 30, 210, 140);

        // Ameias / Torres do Castelo
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(i * 44 + 6, 6, 26, 24);
            ctx.strokeRect(i * 44 + 6, 6, 26, 24);
        }

        // Portão com grade levadiça de ferro
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(105, 110, 35, Math.PI, 0);
        ctx.lineTo(140, 170);
        ctx.lineTo(70, 170);
        ctx.closePath();
        ctx.fill();

        // Tochas de fogo acesas nas paredes
        const drawTorch = (tx, ty) => {
            ctx.fillStyle = '#8b572a';
            ctx.fillRect(tx, ty, 8, 18);
            // Fogo animado
            ctx.fillStyle = Math.random() > 0.5 ? '#f39c12' : '#e74c3c';
            ctx.beginPath();
            ctx.arc(tx + 4, ty - 6, 9, 0, Math.PI * 2);
            ctx.fill();
        };
        drawTorch(40, 80);
        drawTorch(160, 80);

        // Estandarte Real Vermelho com insígnia de Coroa
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(92, 45, 26, 40);
        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('👑', 97, 70);

        ctx.restore();
    }

    drawHayBale(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#f1c40f';
        ctx.strokeStyle = '#d35400';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(0, 0, 56, 36, 8);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 2;
        ctx.strokeRect(14, 0, 8, 36);
        ctx.strokeRect(34, 0, 8, 36);
        ctx.restore();
    }

    drawPumpkinPatch(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#e67e22';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
        ctx.ellipse(28, 4, 22, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d35400';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Cabinho verde
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(-2, -18, 4, 7);
        ctx.fillRect(26, -14, 4, 7);
        ctx.restore();
    }

    drawJackOLantern(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        // Abóbora esculpida
        ctx.fillStyle = '#d35400';
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 17, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1e1014';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Olhos e boca iluminados com vela amarela brilhante
        ctx.fillStyle = '#fff200';
        ctx.shadowColor = '#fffa65';
        ctx.shadowBlur = 12;
        // Olho esquerdo
        ctx.beginPath();
        ctx.moveTo(-10, -5); ctx.lineTo(-4, -5); ctx.lineTo(-7, 0); ctx.closePath(); ctx.fill();
        // Olho direito
        ctx.beginPath();
        ctx.moveTo(4, -5); ctx.lineTo(10, -5); ctx.lineTo(7, 0); ctx.closePath(); ctx.fill();
        // Sorriso dentado
        ctx.beginPath();
        ctx.arc(0, 4, 9, 0.2, Math.PI - 0.2);
        ctx.lineTo(0, 6);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawChristmasBarn(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        // Parede frontal de tábuas de celeiro
        ctx.fillStyle = '#9e1c1c';
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 3;
        ctx.fillRect(0, 50, 185, 115);
        ctx.strokeRect(0, 50, 185, 115);

        // Telhado clássico de celeiro americano
        ctx.fillStyle = '#6b1313';
        ctx.beginPath();
        ctx.moveTo(-12, 50);
        ctx.lineTo(25, 0);
        ctx.lineTo(92, -26);
        ctx.lineTo(160, 0);
        ctx.lineTo(196, 50);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Manto espesso de neve fofa sobre o telhado
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-16, 50);
        ctx.quadraticCurveTo(20, -5, 92, -32);
        ctx.quadraticCurveTo(165, -5, 200, 50);
        ctx.quadraticCurveTo(160, 38, 92, 10);
        ctx.quadraticCurveTo(25, 38, -16, 50);
        ctx.closePath();
        ctx.fill();

        // Estalactites de gelo pendendo do telhado
        ctx.fillStyle = 'rgba(215, 235, 255, 0.85)';
        for (let i = 0; i < 9; i++) {
            const ix = 10 + i * 20;
            const len = 8 + (i % 3) * 6;
            ctx.beginPath();
            ctx.moveTo(ix, 48);
            ctx.lineTo(ix + 3, 48 + len);
            ctx.lineTo(ix + 6, 48);
            ctx.closePath();
            ctx.fill();
        }

        // Porta com travessa em 'X'
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(62, 85, 62, 80);
        ctx.strokeRect(62, 85, 62, 80);
        ctx.strokeStyle = '#9e1c1c';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(62, 85); ctx.lineTo(124, 165);
        ctx.moveTo(124, 85); ctx.lineTo(62, 165);
        ctx.stroke();

        // Guirlanda de Natal na porta
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(93, 115, 14, 0, Math.PI * 2);
        ctx.stroke();

        // Laço vermelho na guirlanda
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(93, 101, 4, 0, Math.PI * 2);
        ctx.fill();

        // Luzinhas pisca-pisca de Natal no beiral do celeiro
        const lightColors = ['#ff4757', '#2ed573', '#ffd32a', '#1e90ff', '#ff9ff3'];
        for (let i = 0; i < 11; i++) {
            const lx = -4 + i * 19;
            const ly = 52 + Math.sin(i * 0.8) * 3;
            const color = lightColors[(i + Math.floor(this.timeOfDay * 3)) % lightColors.length];
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Janela do sótão com luz dourada acolhedora
        ctx.fillStyle = '#f9ca24';
        ctx.fillRect(82, 12, 22, 22);
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.strokeRect(82, 12, 22, 22);

        ctx.restore();
    }

    drawChristmasWindmill(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        // Torre do Moinho
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-18, 95);
        ctx.lineTo(-11, 0);
        ctx.lineTo(11, 0);
        ctx.lineTo(18, 95);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Telhado cônico com neve
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(0, -24);
        ctx.lineTo(15, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Capuz de neve no topo do moinho
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-8, -12);
        ctx.lineTo(0, -26);
        ctx.lineTo(8, -12);
        ctx.closePath();
        ctx.fill();

        // Cata-vento natalino com Galo no topo
        this.drawRoosterWeatherVane(ctx);

        // Pás rotativas com luzes natalinas nas pontas
        ctx.translate(0, -6);
        ctx.rotate(this.windmillAngle);
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 3;

        const lightColors = ['#ff4757', '#ffd32a', '#2ed573', '#0984e3'];
        for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.strokeRect(0, -6, 48, 12);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(48, 0);
            ctx.stroke();

            // Luz pisca-pisca na ponta de cada pá
            ctx.fillStyle = lightColors[i];
            ctx.shadowColor = lightColors[i];
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(48, 0, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawRoosterWeatherVane(ctx) {
        ctx.save();
        ctx.translate(0, -24);
        // Haste de ferro
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(0, -18);
        ctx.stroke();

        // Cruzeta da rosa dos ventos
        ctx.beginPath();
        ctx.moveTo(-8, -11); ctx.lineTo(8, -11);
        ctx.stroke();

        // Galo giratório animado pelo tiro
        ctx.translate(0, -18);
        ctx.rotate(this.roosterSpin);
        ctx.fillStyle = '#f39c12';
        ctx.strokeStyle = '#d35400';
        ctx.lineWidth = 1.2;
        // Corpo do galo
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 5, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        // Crista vermelha
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(-2, -6, 4, 3);
        // Bico
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.moveTo(6, 0); ctx.lineTo(10, 1); ctx.lineTo(6, 3); ctx.closePath(); ctx.fill();
        // Cauda de penas
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-5, 0); ctx.quadraticCurveTo(-11, -6, -8, -10); ctx.stroke();
        ctx.restore();
    }

    drawPineTree(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        // Tronco de madeira
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(-8, 30, 16, 25);

        // 3 Camadas de folhagem verde de pinheiro natalino
        const drawLayer = (baseY, w, h) => {
            ctx.fillStyle = '#14532d';
            ctx.beginPath();
            ctx.moveTo(-w, baseY);
            ctx.lineTo(0, baseY - h);
            ctx.lineTo(w, baseY);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#052e16';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Neve cobrindo os galhos
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(-w, baseY);
            ctx.quadraticCurveTo(-w * 0.5, baseY - 6, 0, baseY - 8);
            ctx.quadraticCurveTo(w * 0.5, baseY - 6, w, baseY);
            ctx.quadraticCurveTo(0, baseY + 6, -w, baseY);
            ctx.closePath();
            ctx.fill();
        };

        drawLayer(35, 38, 32);
        drawLayer(12, 30, 28);
        drawLayer(-10, 22, 24);

        // Bolas de Natal coloridas decorativas
        const ornaments = [
            { x: -16, y: 22, c: '#ff4757' },
            { x: 14, y: 24, c: '#fed330' },
            { x: -8, y: 0, c: '#2ed573' },
            { x: 10, y: 2, c: '#1e90ff' },
            { x: 0, y: -18, c: '#ff4757' }
        ];
        for (const o of ornaments) {
            ctx.fillStyle = o.c;
            ctx.beginPath();
            ctx.arc(o.x, o.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(o.x - 1, o.y - 1, 1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Estrela dourada no topo
        ctx.save();
        ctx.translate(0, -36);
        ctx.fillStyle = '#f1c40f';
        ctx.shadowColor = '#f1c40f';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 9, -Math.sin((18 + i * 72) * Math.PI / 180) * 9);
            ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 4, -Math.sin((54 + i * 72) * Math.PI / 180) * 4);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }

    drawSnowman(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        // 3 bolas de neve
        const drawSnowBall = (bx, by, r) => {
            const grad = ctx.createRadialGradient(bx - r * 0.3, by - r * 0.3, r * 0.2, bx, by, r);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.7, '#f1f5f9');
            grad.addColorStop(1, '#cbd5e1');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(bx, by, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        };

        drawSnowBall(0, 22, 22);  // corpo inferior
        drawSnowBall(0, -5, 16);  // meio
        drawSnowBall(0, -28, 12); // cabeça

        // Botões de carvão
        ctx.fillStyle = '#0f172a';
        ctx.beginPath(); ctx.arc(0, -8, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(0, -1, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(0, 6, 2, 0, Math.PI * 2); ctx.fill();

        // Olhos
        ctx.beginPath(); ctx.arc(-4, -30, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(4, -30, 1.8, 0, Math.PI * 2); ctx.fill();

        // Nariz de cenoura
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(0, -27);
        ctx.lineTo(14, -25);
        ctx.lineTo(0, -23);
        ctx.closePath();
        ctx.fill();

        // Cachecol vermelho
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-10, -18, 20, 6);
        ctx.fillRect(4, -14, 6, 14);

        // Cartola preta (pode ser derrubada com tiro certeiro!)
        if (this.snowmanHatOff) {
            // Cartola caída no chão torta
            ctx.save();
            ctx.translate(34, 36);
            ctx.rotate(0.55);
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(-14, -4, 28, 4);
            ctx.fillRect(-9, -18, 18, 14);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(-9, -7, 18, 3);
            ctx.restore();
            // Penugem de neve no topo da cabeça
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, -38, 4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(-14, -40, 28, 4); // aba
            ctx.fillRect(-9, -54, 18, 14); // topo
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(-9, -43, 18, 3);  // fita vermelha
        }

        // Braços de galho
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-14, -6); ctx.lineTo(-30, -14);
        ctx.moveTo(14, -6); ctx.lineTo(30, -14);
        ctx.stroke();

        ctx.restore();
    }

    drawAuroraBorealis(ctx) {
        ctx.save();
        const t = this.timeOfDay * 0.8;
        const auroraGrad = ctx.createLinearGradient(0, 20, 0, 260);
        auroraGrad.addColorStop(0, 'rgba(46, 213, 115, 0)');
        auroraGrad.addColorStop(0.5, 'rgba(46, 213, 115, 0.22)');
        auroraGrad.addColorStop(0.8, 'rgba(155, 89, 182, 0.18)');
        auroraGrad.addColorStop(1, 'rgba(155, 89, 182, 0)');

        ctx.fillStyle = auroraGrad;
        ctx.beginPath();
        ctx.moveTo(0, 120);
        for (let x = 0; x <= this.w; x += 60) {
            const wave1 = Math.sin(x * 0.005 + t) * 35;
            const wave2 = Math.cos(x * 0.008 - t * 0.5) * 20;
            ctx.lineTo(x, 100 + wave1 + wave2);
        }
        ctx.lineTo(this.w, 240);
        ctx.lineTo(0, 240);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    drawSantaSleigh(ctx) {
        if (!this.santaSleigh || !this.santaSleigh.active) return;
        ctx.save();
        ctx.translate(this.santaSleigh.x, this.santaSleigh.y);

        // Silhueta do trenó vermelho
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(25, -5, 38, -15);
        ctx.lineTo(34, 4);
        ctx.quadraticCurveTo(15, 8, -6, 6);
        ctx.closePath();
        ctx.fill();

        // Patins dourados do trenó
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, 8);
        ctx.lineTo(38, 8);
        ctx.quadraticCurveTo(46, 6, 44, -2);
        ctx.stroke();

        // Papai Noel e saco de presentes
        ctx.fillStyle = '#b33939';
        ctx.beginPath();
        ctx.arc(8, -10, 8, 0, Math.PI * 2); // saco de presentes
        ctx.fill();

        // Papai Noel silhueta
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(22, -10, 5.5, 0, Math.PI * 2); // corpo
        ctx.fill();
        ctx.beginPath();
        ctx.arc(23, -16, 4, 0, Math.PI * 2); // cabeça
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(24, -14, 2.5, 0, Math.PI); // barba branca
        ctx.fill();

        // 3 Renas mágicas na frente
        const reindeerY = Math.sin(this.timeOfDay * 4) * 4;
        ctx.fillStyle = '#5d4037';
        for (let i = 1; i <= 3; i++) {
            const rx = 40 + i * 28;
            const ry = -4 + reindeerY * (i % 2 === 0 ? 1 : -1);

            // Corpo da rena
            ctx.beginPath();
            ctx.ellipse(rx, ry, 7, 4.5, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cabeça
            ctx.beginPath();
            ctx.arc(rx + 7, ry - 4, 3, 0, Math.PI * 2);
            ctx.fill();
            // Chifrinhos
            ctx.strokeStyle = '#3e2723';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(rx + 7, ry - 6); ctx.lineTo(rx + 9, ry - 11);
            ctx.stroke();

            // Nariz vermelho brilhante da Rudolph (primeira rena)
            if (i === 3) {
                ctx.fillStyle = '#ff4757';
                ctx.shadowColor = '#ff4757';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(rx + 10, ry - 4, 1.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // Rédeas douradas
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(34, -5);
            ctx.lineTo(rx, ry);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawSnowFall(ctx) {
        ctx.save();
        for (const s of this.snowFlakes) {
            ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawAtmosphere(ctx) {
        // Nevasca mágica, Aurora Boreal e Trenó do Papai Noel
        if (this.theme.hasSnow) {
            this.drawAuroraBorealis(ctx);
            this.drawSantaSleigh(ctx);
            this.drawSnowFall(ctx);
        }

        // Chuva estilizada
        if (this.theme.hasRain) {
            ctx.save();
            ctx.strokeStyle = 'rgba(200, 225, 255, 0.45)';
            ctx.lineWidth = 1.8;
            for (const r of this.rainDrops) {
                ctx.beginPath();
                ctx.moveTo(r.x, r.y);
                ctx.lineTo(r.x - 6, r.y + r.len);
                ctx.stroke();
            }
            ctx.restore();
        }

        // Fagulhas e cinzas incandescentes no vulcão
        if (this.theme.hasEmbers) {
            ctx.save();
            for (const em of this.embers) {
                ctx.fillStyle = `rgba(255, ${Math.floor(100 + em.alpha * 120)}, 0, ${em.alpha})`;
                ctx.shadowColor = '#ff3838';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(em.x, em.y, em.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
            ctx.restore();
        }

        // Vaga-lumes luminosos na noite
        if (this.theme.hasFireflies) {
            ctx.save();
            for (const f of this.fireflies) {
                const glow = 0.4 + Math.sin(this.timeOfDay * 4 + f.phase) * 0.4;
                ctx.fillStyle = `rgba(168, 255, 77, ${Math.max(0.1, glow)})`;
                ctx.shadowColor = '#a8ff4d';
                ctx.shadowBlur = 14;
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
            ctx.restore();
        }

        // Folhas de outono flutuando
        if (this.theme.hasLeaves) {
            ctx.save();
            for (const l of this.autumnLeaves) {
                ctx.save();
                ctx.translate(l.x, l.y);
                ctx.rotate(l.rot);
                ctx.fillStyle = l.color;
                ctx.beginPath();
                ctx.ellipse(0, 0, l.size, l.size * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            ctx.restore();
        }
    }

    checkSecretHit(shotX, shotY, weaponKey, isScoping) {
        // 1. Checagem de tiro na LUA (Noite ou Natal)
        if (this.theme.isNight && this.theme.moonX) {
            const mx = this.theme.moonX;
            const my = this.theme.moonY;
            const mr = this.theme.moonRadius || 44;
            const distMoon = Math.hypot(shotX - mx, shotY - my);
            if (distMoon <= mr + 10) {
                this.moonHits++;
                this.moonBandages.push({
                    x: (shotX - mx) * 0.85,
                    y: (shotY - my) * 0.85,
                    rot: (Math.random() - 0.5) * 0.9
                });

                const wifeQuotes = [
                    "ZEEECO! PARA DE DAR TIRO NA LUA QUE EU QUERO DORMIR, HOMEM! 👵🍳",
                    "ZECO! A LUA NÃO É PORCO NÃO, SEU DESASTRADO! VAI ACORDAR O VILAREJO! 👵💢",
                    "LARGA ESSA ESPINGARDA E VAI CARPIR O LOTE, HOMEM DE DEUS! 👵🧹",
                    "MAIS UM TIRO NA LUA E HOJE VOCÊ DORME NO CHIQUEIRO COM OS PORCOS! 👵💥",
                    "Ô ZÉ! SE ACERTAR SÃO JORGE NA LUA O DRAGÃO VEM ATRÁS D'OCÊ! 👵🐉"
                ];
                const quote = wifeQuotes[(this.moonHits - 1) % wifeQuotes.length];
                this.wifeShoutTimer = 4.5;
                this.wifeShoutText = quote;

                if (window.sounds && window.sounds.playWifeYell) {
                    window.sounds.playWifeYell();
                }

                return {
                    hit: true,
                    secret: 'MOON',
                    title: '👵 BRONCA DA MULHER DO FAZENDEIRO!',
                    msg: quote,
                    points: 350,
                    coins: 25
                };
            }
        }

        // 2. Checagem de tiro no Galo / Catavento do Moinho
        if (this.theme.id !== 'VOLCANO') {
            const roosterX = 220;
            const roosterY = 298;
            const distRooster = Math.hypot(shotX - roosterX, shotY - roosterY);
            if (distRooster <= 30) {
                this.roosterSpin += 40;
                if (window.sounds && window.sounds.playRoosterCrow) {
                    window.sounds.playRoosterCrow();
                }
                return {
                    hit: true,
                    secret: 'ROOSTER',
                    title: '🐓 CO-CO-RI-CÓ! O GALO DO MOINHO ENLOUQUECEU!',
                    msg: 'O cata-vento girou como louco! +250 PTS',
                    points: 250,
                    coins: 15
                };
            }
        }

        // 3. Checagem de tiro no Trenó do Papai Noel (Edição de Natal)
        if (this.theme.hasSnow && this.santaSleigh.x > -60 && this.santaSleigh.x < this.w + 60) {
            const sx = this.santaSleigh.x + 35;
            const sy = this.santaSleigh.y;
            const distSanta = Math.hypot(shotX - sx, shotY - sy);
            if (distSanta <= 50) {
                if (window.sounds && window.sounds.playHoHoHo) {
                    window.sounds.playHoHoHo();
                }
                return {
                    hit: true,
                    secret: 'SANTA',
                    title: '🎅 HO-HO-HO! TIRO NO TRENÓ DO PAPAI NOEL!',
                    msg: 'Papai Noel deixou cair uma chuva de presentes! 🎁✨',
                    points: 1000,
                    coins: 50,
                    dropGifts: true
                };
            }
        }

        // 4. Checagem de tiro no Boneco de Neve (XMAS)
        if (this.theme.hasSnow && !this.snowmanHatOff) {
            const hatX = 280;
            const hatY = 530 - 45;
            const distHat = Math.hypot(shotX - hatX, shotY - hatY);
            if (distHat <= 25) {
                this.snowmanHatOff = true;
                return {
                    hit: true,
                    secret: 'SNOWMAN',
                    title: '⛄ CHAPÉU DO BONECO DE NEVE VOOU!',
                    msg: 'O boneco de neve perdeu a cartola! +150 PTS',
                    points: 150,
                    coins: 10
                };
            }
        }

        return { hit: false };
    }

    drawWifeSpeechBubble(ctx) {
        if (this.wifeSlideX <= -400) return;

        ctx.save();
        ctx.translate(this.wifeSlideX, 520);

        // Sombra de caixa de diálogo estilizada
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;

        // Fundo do quadro da Dona Benta
        ctx.fillStyle = '#fffdf7';
        ctx.strokeStyle = '#b33939';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(0, 0, 480, 110, 14);
        ctx.fill();
        ctx.stroke();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Borda decorativa interna vintage
        ctx.strokeStyle = '#e17055';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(6, 6, 468, 98);

        // Retrato circular de Dona Benta furiosa
        ctx.save();
        ctx.translate(56, 55);

        // Rosto de velhinha fofa e brava
        ctx.fillStyle = '#f8c291';
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#3d1c06';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Cabelo grisalho com coque alto
        ctx.fillStyle = '#dcdde1';
        ctx.beginPath();
        ctx.arc(0, -28, 15, 0, Math.PI * 2);
        ctx.arc(-22, -10, 14, 0, Math.PI * 2);
        ctx.arc(22, -10, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Grampo no coque
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-16, -30); ctx.lineTo(16, -26);
        ctx.stroke();

        // Óculos redondos de vovó
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-10, -3, 8, 0, Math.PI * 2);
        ctx.arc(10, -3, 8, 0, Math.PI * 2);
        ctx.moveTo(-2, -3); ctx.lineTo(2, -3);
        ctx.stroke();

        // Olhos bravos atrás dos óculos
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.arc(-10, -3, 2.5, 0, Math.PI * 2);
        ctx.arc(10, -3, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Sobrancelhas franzidas de bronca
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-17, -12); ctx.lineTo(-4, -8);
        ctx.moveTo(17, -12); ctx.lineTo(4, -8);
        ctx.stroke();

        // Boca berrando (aberta oval)
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.ellipse(0, 16, 7, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Dente único
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-2, 8, 4, 3.5);

        // Avental florido
        ctx.fillStyle = '#fd79a8';
        ctx.beginPath();
        ctx.moveTo(-24, 26); ctx.lineTo(24, 26); ctx.lineTo(30, 48); ctx.lineTo(-30, 48);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#3d1c06';
        ctx.stroke();

        // Rolo de massa balançando na mão com raiva
        ctx.save();
        ctx.translate(34, 4);
        ctx.rotate(Math.sin(Date.now() * 0.018) * 0.45 - 0.25);
        ctx.fillStyle = '#e67e22';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.fillRect(-4, -28, 8, 28);
        ctx.strokeRect(-4, -28, 8, 28);
        // Cabos
        ctx.fillStyle = '#b53471';
        ctx.fillRect(-2.5, -34, 5, 6);
        ctx.fillRect(-2.5, 0, 5, 6);
        ctx.restore();

        ctx.restore(); // Fecha avatar Dona Benta

        // Balão de fala e texto
        ctx.fillStyle = '#b33939';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('👵 DONA BENTA (MULHER DO FAZENDEIRO):', 115, 14);

        // Texto da bronca
        ctx.fillStyle = '#1e272e';
        ctx.font = 'bold 15px sans-serif';
        const maxWidth = 345;
        const words = (this.wifeShoutText || 'ZEEECO! PARA DE DAR TIRO NA LUA!').split(' ');
        let line = '';
        let lineY = 38;
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, 115, lineY);
                line = words[n] + ' ';
                lineY += 21;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 115, lineY);

        ctx.restore();
    }
}

window.EnvironmentManager = EnvironmentManager;
window.SCENARIO_THEMES = SCENARIO_THEMES;
