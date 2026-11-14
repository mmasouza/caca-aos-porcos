// sniper_horizon.js - Sistema de Porcos no Horizonte e Luneta Ótica de Precisão (Sniper Scope)

// sniper_horizon.js - Sistema de Porcos e Javalis no Horizonte e Luneta Ótica de Precisão

class HorizonPig {
    constructor(x, y, label = 'Colina', type = 'PIG') {
        this.x = x;
        this.y = y;
        this.baseY = y;
        this.label = label;
        this.type = type; // 'PIG' ou 'BOAR'

        this.scale = this.type === 'BOAR' ? 0.46 : 0.42;
        this.width = 76 * this.scale;
        this.height = 58 * this.scale;

        this.maxHp = this.type === 'BOAR' ? 60 : 30;
        this.hp = this.maxHp;
        this.isDead = false;
        this.deathTimer = 0;

        // Animação de espreitar (Peek)
        this.state = 'rising'; // 'rising', 'peeking', 'ducking', 'gone'
        this.offsetY = 50; // começa escondido atrás da colina/telhado
        this.timer = 0;
        this.peekDuration = this.type === 'BOAR' ? 9.5 : 8.5;
        this.animTime = Math.random() * 10;
        this.blinkTimer = 2.0 + Math.random() * 2.0;
        this.isBlinking = false;

        // Variação de Acessório/Comportamento
        if (this.type === 'BOAR') {
            const boarActions = ['spotter', 'bandana', 'binoculars'];
            this.action = boarActions[Math.floor(Math.random() * boarActions.length)];
        } else {
            const pigActions = ['binoculars', 'camo_helmet', 'radio', 'flag'];
            this.action = pigActions[Math.floor(Math.random() * pigActions.length)];
        }

        // Sistema de vapor/fumaça de narina para o javali
        this.snortTimer = 0;
        this.snortSteam = [];
    }

    update(dt) {
        this.animTime += dt * 4;
        this.timer += dt;

        // Piscar de olhos
        this.blinkTimer -= dt;
        if (this.blinkTimer <= 0) {
            this.isBlinking = !this.isBlinking;
            this.blinkTimer = this.isBlinking ? 0.16 : (2.5 + Math.random() * 3.5);
        }

        // Vapor de narina do javali enfurecido
        if (this.type === 'BOAR' && !this.isDead && this.state === 'peeking') {
            this.snortTimer += dt;
            if (this.snortTimer > 1.6) {
                this.snortTimer = 0;
                for (let i = 0; i < 3; i++) {
                    this.snortSteam.push({
                        x: 34 + (Math.random() - 0.5) * 5,
                        y: -3 + (Math.random() - 0.5) * 4,
                        vx: 15 + Math.random() * 18,
                        vy: -5 - Math.random() * 10,
                        radius: 2.2 + Math.random() * 2,
                        alpha: 0.75,
                        life: 0.6
                    });
                }
            }
        }

        // Atualiza vapor
        for (let i = this.snortSteam.length - 1; i >= 0; i--) {
            const s = this.snortSteam[i];
            s.life -= dt;
            if (s.life <= 0) {
                this.snortSteam.splice(i, 1);
                continue;
            }
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            s.radius += dt * 6;
            s.alpha = Math.max(0, s.life / 0.6);
        }

        if (this.isDead) {
            this.deathTimer += dt;
            return;
        }

        if (this.state === 'rising') {
            this.offsetY = Math.max(0, this.offsetY - dt * 65);
            if (this.offsetY <= 0) {
                this.offsetY = 0;
                this.state = 'peeking';
                this.timer = 0;
            }
        } else if (this.state === 'peeking') {
            if (this.timer > this.peekDuration) {
                this.state = 'ducking';
            }
        } else if (this.state === 'ducking') {
            this.offsetY += dt * 55;
            if (this.offsetY >= 50) {
                this.state = 'gone';
            }
        }
    }

    checkHit(shotX, shotY, radius = 0, isScoping = false) {
        if (this.isDead || this.state === 'gone') return { hit: false };

        const currentY = this.baseY + this.offsetY;
        const dist = Math.hypot(shotX - this.x, shotY - currentY);

        // Se estiver com luneta, raio de acerto ampliado pela precisão ótica
        const hitRadius = (this.width * 0.95) + (isScoping ? radius + 18 : radius);

        if (dist <= hitRadius) {
            // Se atirou com luneta, tiro crítico instantâneo!
            const damage = isScoping ? 100 : 35;
            this.hp -= damage;

            if (this.hp <= 0) {
                this.isDead = true;
                this.deathTimer = 0;
                const points = this.type === 'BOAR' ? 1500 : 1000;
                const coins = this.type === 'BOAR' ? 50 : 35;
                return {
                    hit: true,
                    killed: true,
                    isHorizon: true,
                    type: this.type,
                    points,
                    coins
                };
            }
            return { hit: true, killed: false, isHorizon: true, type: this.type };
        }
        return { hit: false };
    }

    draw(ctx) {
        if (this.state === 'gone') return;

        const currentY = this.baseY + this.offsetY;

        ctx.save();
        ctx.translate(this.x, currentY);

        // Respiração suave de espreitar
        const breathe = Math.sin(this.animTime) * 1.5;
        ctx.translate(0, breathe);

        ctx.scale(this.scale, this.scale);

        if (this.isDead) {
            ctx.rotate(this.deathTimer * 9);
            ctx.scale(Math.max(0, 1 - this.deathTimer * 2), Math.max(0, 1 - this.deathTimer * 2));
        }

        // Renderiza conforme a espécie
        if (this.type === 'BOAR') {
            this.drawHorizonBoar(ctx);
        } else {
            this.drawHorizonPig(ctx);
        }

        // Acessório de Natal no horizonte
        if (window.game && window.game.isChristmasMode) {
            this.drawChristmasHat(ctx);
        }

        // Desenha vapor de narina
        this.drawSteam(ctx);

        ctx.restore();
    }

    drawChristmasHat(ctx) {
        ctx.save();
        const hatX = this.type === 'BOAR' ? 16 : 14;
        const hatY = this.type === 'BOAR' ? -26 : -22;

        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(hatX - 10, hatY);
        ctx.quadraticCurveTo(hatX + 4, hatY - 26, hatX + 22, hatY - 18);
        ctx.quadraticCurveTo(hatX + 8, hatY - 10, hatX + 10, hatY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(hatX + 22, hatY - 18, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(hatX - 12, hatY - 2, 24, 5.5, 2.5);
        ctx.fill();
        ctx.restore();
    }

    // 1. PORCO ESPIÃO DO HORIZONTE (Modelagem AAA em Camadas)
    drawHorizonPig(ctx) {
        // Rabinho enrolado fofo
        ctx.strokeStyle = '#d83b63';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const tailWag = Math.sin(this.animTime * 3) * 3;
        ctx.moveTo(-32, 2);
        ctx.quadraticCurveTo(-42 + tailWag, -4, -38, -12);
        ctx.quadraticCurveTo(-34, -16, -30, -10);
        ctx.stroke();

        // Corpo com gradiente radial 3D
        const bodyGrad = ctx.createRadialGradient(8, -6, 5, 0, 0, 36);
        bodyGrad.addColorStop(0, '#ffc2d4');
        bodyGrad.addColorStop(0.5, '#ff85a2');
        bodyGrad.addColorStop(1, '#d83b63');

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, 2, 34, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2d151e';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Brilho especular sutil no lombo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-10, -12, 14, 5, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Cabeça volumosa 3D
        const headGrad = ctx.createRadialGradient(18, -12, 4, 14, -6, 24);
        headGrad.addColorStop(0, '#ffd1df');
        headGrad.addColorStop(0.6, '#ff9ebb');
        headGrad.addColorStop(1, '#e05378');

        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(14, -6, 19, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2d151e';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Bochecha corada fofa (Blush)
        ctx.fillStyle = 'rgba(255, 71, 87, 0.4)';
        ctx.beginPath();
        ctx.ellipse(12, 1, 5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Focinho com chanfro 3D
        const snoutGrad = ctx.createLinearGradient(18, -10, 34, 2);
        snoutGrad.addColorStop(0, '#ffa8be');
        snoutGrad.addColorStop(1, '#d83b63');

        ctx.fillStyle = snoutGrad;
        ctx.beginPath();
        ctx.ellipse(28, -4, 10, 7.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2d151e';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Narinas profundas ovais com highlight
        const drawNostril = (nx, ny) => {
            ctx.fillStyle = '#1e0810';
            ctx.beginPath();
            ctx.ellipse(nx, ny, 2.2, 3.5, 0.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.beginPath();
            ctx.arc(nx, ny + 2.5, 0.9, 0, Math.PI * 2);
            ctx.fill();
        };
        drawNostril(25, -4);
        drawNostril(31, -4);

        // Olhos espiando com reflexo vivo
        this.drawEyes(ctx, 16, -13, false);

        // Orelhas 3D
        this.drawEars(ctx, false);

        // Acessório específico do Porco Espião
        this.drawPigAccessories(ctx);
    }

    // 2. JAVALI SELVAGEM DO HORIZONTE (Modelagem Feroz e Imponente)
    drawHorizonBoar(ctx) {
        // Crista de pelos espetados no dorso (Mane)
        ctx.fillStyle = '#1f0a04';
        ctx.strokeStyle = '#120401';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-28, -10);
        ctx.lineTo(-24, -26);
        ctx.lineTo(-18, -14);
        ctx.lineTo(-12, -28);
        ctx.lineTo(-6, -15);
        ctx.lineTo(0, -25);
        ctx.lineTo(8, -14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Corpo pesado de javali com gradiente café
        const bodyGrad = ctx.createRadialGradient(8, -6, 5, 0, 0, 40);
        bodyGrad.addColorStop(0, '#8d6e63');
        bodyGrad.addColorStop(0.5, '#5d4037');
        bodyGrad.addColorStop(1, '#27120c');

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, 3, 37, 27, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#150602';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Cabeça robusta
        const headGrad = ctx.createRadialGradient(18, -12, 4, 15, -6, 26);
        headGrad.addColorStop(0, '#6d4c41');
        headGrad.addColorStop(0.6, '#4e342e');
        headGrad.addColorStop(1, '#200c06');

        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(15, -6, 21, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#150602';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Pintura de guerra tribal nas bochechas
        ctx.fillStyle = 'rgba(245, 246, 250, 0.85)';
        ctx.beginPath();
        ctx.moveTo(8, 0); ctx.lineTo(16, 5); ctx.lineTo(14, 7); ctx.lineTo(6, 2); ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(11, -3); ctx.lineTo(19, 2); ctx.lineTo(17, 4); ctx.lineTo(9, -1); ctx.closePath();
        ctx.fill();

        // Crista punk de pelos no topo da cabeça
        ctx.fillStyle = '#1f0a04';
        ctx.beginPath();
        ctx.moveTo(10, -24);
        ctx.lineTo(16, -37);
        ctx.lineTo(20, -25);
        ctx.lineTo(25, -34);
        ctx.lineTo(28, -22);
        ctx.closePath();
        ctx.fill();

        // Focinho rude e escuro
        const snoutGrad = ctx.createLinearGradient(20, -10, 36, 4);
        snoutGrad.addColorStop(0, '#5d4037');
        snoutGrad.addColorStop(1, '#27120c');

        ctx.fillStyle = snoutGrad;
        ctx.beginPath();
        ctx.ellipse(30, -3, 11, 8.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#150602';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Narinas dilatadas profundas
        ctx.fillStyle = '#0f0402';
        ctx.beginPath();
        ctx.ellipse(27, -3, 2.5, 4, 0.1, 0, Math.PI * 2);
        ctx.ellipse(33, -3, 2.5, 4, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Presas de marfim curvas e afiadas (Tusks)
        const drawTusk = (tx, ty, rot) => {
            ctx.save();
            ctx.translate(tx, ty);
            ctx.rotate(rot);

            const tuskGrad = ctx.createLinearGradient(0, 0, 12, -14);
            tuskGrad.addColorStop(0, '#ffffff');
            tuskGrad.addColorStop(0.7, '#dcdde1');
            tuskGrad.addColorStop(1, '#718093');

            ctx.fillStyle = tuskGrad;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(10, 2, 13, -16);
            ctx.quadraticCurveTo(5, -6, 0, -4);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#150602';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        };
        drawTusk(24, 4, 0.15);
        drawTusk(33, 4, 0.35);

        // Olhos ferozes vermelhos
        this.drawEyes(ctx, 17, -13, true);

        // Orelhas de javali
        this.drawEars(ctx, true);

        // Acessórios do Javali
        this.drawBoarAccessories(ctx);
    }

    drawEyes(ctx, eyeX, eyeY, isBoar = false) {
        if (this.isBlinking) {
            ctx.strokeStyle = isBoar ? '#150602' : '#2d151e';
            ctx.lineWidth = isBoar ? 3 : 2.5;
            ctx.beginPath();
            ctx.arc(eyeX, eyeY, 5, 0.2, Math.PI - 0.2);
            ctx.stroke();
            return;
        }

        // Esclera
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isBoar ? '#150602' : '#2d151e';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Íris (castanha brilhante para porco, vermelha fogo para javali)
        ctx.fillStyle = isBoar ? '#e74c3c' : '#3d2010';
        ctx.beginPath();
        ctx.arc(eyeX + 1.2, eyeY, 3.2, 0, Math.PI * 2);
        ctx.fill();

        // Pupila
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(eyeX + 1.4, eyeY, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Brilho de luz nos olhos
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX + 2.2, eyeY - 1.5, 1.3, 0, Math.PI * 2);
        ctx.fill();

        // Sobrancelha
        ctx.strokeStyle = isBoar ? '#150602' : '#3d121c';
        ctx.lineWidth = isBoar ? 3.5 : 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (isBoar) {
            // Sobrancelha cerrada em V de fúria
            ctx.moveTo(eyeX - 4, eyeY - 7);
            ctx.lineTo(eyeX + 5, eyeY - 5);
        } else {
            // Curiosa e atenta
            ctx.moveTo(eyeX - 3, eyeY - 7);
            ctx.quadraticCurveTo(eyeX + 1, eyeY - 9, eyeX + 5, eyeY - 6);
        }
        ctx.stroke();
    }

    drawEars(ctx, isBoar = false) {
        ctx.save();
        ctx.fillStyle = isBoar ? '#4e342e' : '#f06292';
        ctx.strokeStyle = isBoar ? '#150602' : '#2d151e';
        ctx.lineWidth = 2.5;

        // Orelha Esquerda
        ctx.beginPath();
        ctx.moveTo(6, -18);
        ctx.lineTo(14, -30);
        ctx.lineTo(19, -17);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Interior da orelha
        ctx.fillStyle = isBoar ? '#27120c' : '#ff9ebb';
        ctx.beginPath();
        ctx.moveTo(8, -19);
        ctx.lineTo(14, -27);
        ctx.lineTo(17, -18);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    drawPigAccessories(ctx) {
        if (this.action === 'binoculars') {
            // Binóculos táticos pretos com anéis de bronze e lentes azuis
            ctx.save();
            // Corpo duplo dos binóculos
            ctx.fillStyle = '#2d3436';
            ctx.fillRect(18, -17, 16, 9);
            ctx.strokeStyle = '#1e272e';
            ctx.lineWidth = 2;
            ctx.strokeRect(18, -17, 16, 9);

            // Anéis de bronze
            ctx.fillStyle = '#d35400';
            ctx.fillRect(24, -18, 3, 11);

            // Lentes azuis cristalinas reflexivas
            const drawLens = (lx, ly) => {
                const lensGrad = ctx.createLinearGradient(lx - 4, ly - 4, lx + 4, ly + 4);
                lensGrad.addColorStop(0, '#74b9ff');
                lensGrad.addColorStop(0.5, '#0984e3');
                lensGrad.addColorStop(1, '#0c2461');
                ctx.fillStyle = lensGrad;
                ctx.beginPath();
                ctx.arc(lx, ly, 4.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Reflexo diagonal de luz
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.beginPath();
                ctx.ellipse(lx - 1, ly - 1, 2, 1, -0.6, 0, Math.PI * 2);
                ctx.fill();
            };
            drawLens(34, -13);
            ctx.restore();

        } else if (this.action === 'camo_helmet') {
            // Capacete militar verde camuflado com galhos e óculos de piloto
            ctx.save();
            ctx.fillStyle = '#2d3d36';
            ctx.beginPath();
            ctx.arc(15, -15, 17, Math.PI * 0.9, Math.PI * 2.1);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#1b2420';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Galhinhos e folhas de camuflagem
            ctx.strokeStyle = '#44bd32';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(12, -26); ctx.lineTo(8, -34);
            ctx.moveTo(18, -28); ctx.lineTo(24, -36);
            ctx.stroke();

            // Óculos de combate puxados para o capacete
            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.roundRect(8, -22, 16, 6, 2);
            ctx.fill();
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();

        } else if (this.action === 'radio') {
            // Rádio tático com antena oscilante e LED vermelho piscando
            ctx.save();
            ctx.fillStyle = '#2f3640';
            ctx.fillRect(-22, -18, 12, 16);
            ctx.strokeStyle = '#1e272e';
            ctx.lineWidth = 2;
            ctx.strokeRect(-22, -18, 12, 16);

            // Antena longa com vento
            const wind = Math.sin(this.animTime * 3) * 5;
            ctx.strokeStyle = '#718093';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-16, -18);
            ctx.quadraticCurveTo(-18, -35, -20 + wind, -52);
            ctx.stroke();

            // LED vermelho pulsante na ponta da antena
            const ledAlpha = 0.5 + Math.sin(this.animTime * 8) * 0.5;
            ctx.fillStyle = `rgba(255, 71, 87, ${ledAlpha})`;
            ctx.shadowColor = '#ff4757';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(-20 + wind, -53, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();

        } else if (this.action === 'flag') {
            // Bandeira vermelha rebelde provocando com bacon desenhado
            ctx.save();
            const wave = Math.sin(this.animTime * 4) * 4;
            ctx.strokeStyle = '#795548';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-16, 4);
            ctx.lineTo(-16, -38);
            ctx.stroke();

            // Tecido da bandeira ondulando
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.moveTo(-16, -38);
            ctx.quadraticCurveTo(-26 + wave, -32, -38 + wave, -30);
            ctx.quadraticCurveTo(-28 + wave, -22, -16, -20);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#c0392b';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Símbolo de bacon na bandeira
            ctx.strokeStyle = '#ffd32a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-22 + wave * 0.7, -31);
            ctx.lineTo(-32 + wave * 0.7, -27);
            ctx.stroke();
            ctx.restore();
        }
    }

    drawBoarAccessories(ctx) {
        if (this.action === 'spotter') {
            // Luneta tática de franco-atirador em metal escuro com lente verde
            ctx.save();
            ctx.fillStyle = '#1e272e';
            ctx.fillRect(20, -16, 18, 8);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeRect(20, -16, 18, 8);

            // Lente verde militar reflexiva
            ctx.fillStyle = '#2ed573';
            ctx.beginPath();
            ctx.arc(38, -12, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();

        } else if (this.action === 'bandana') {
            // Bandana vermelha de guerrilheiro com pontas rasgadas voando ao vento
            ctx.save();
            ctx.fillStyle = '#c0392b';
            ctx.beginPath();
            ctx.roundRect(8, -20, 20, 7, 2);
            ctx.fill();

            // Pontas da bandana esvoaçando para trás
            const flap = Math.sin(this.animTime * 5) * 4;
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.moveTo(8, -18);
            ctx.lineTo(-8 + flap, -24);
            ctx.lineTo(-4 + flap, -17);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(8, -16);
            ctx.lineTo(-12 + flap, -19);
            ctx.lineTo(-6 + flap, -14);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

        } else if (this.action === 'binoculars') {
            // Binóculos táticos com empunhadura preta reforçada
            ctx.save();
            ctx.fillStyle = '#111827';
            ctx.fillRect(20, -16, 17, 9);
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2;
            ctx.strokeRect(20, -16, 17, 9);

            // Lente rubi / infravermelho
            ctx.fillStyle = '#ff4757';
            ctx.beginPath();
            ctx.arc(37, -11.5, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        }
    }

    drawSteam(ctx) {
        if (!this.snortSteam || this.snortSteam.length === 0) return;

        ctx.save();
        for (const s of this.snortSteam) {
            ctx.fillStyle = `rgba(240, 240, 245, ${s.alpha * 0.8})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

class SniperScopeSystem {
    constructor(virtualWidth = 1280, virtualHeight = 720) {
        this.w = virtualWidth;
        this.h = virtualHeight;
        this.isScoping = false;
        this.scopeAlpha = 0;
        this.breathOffset = 0;
        this.time = 0;
    }

    toggle() {
        this.isScoping = !this.isScoping;
        if (window.sounds && window.sounds.init) {
            window.sounds.init();
            // Som tático de clique ótico
            if (window.sounds.playReloadFinish) {
                window.sounds.playReloadFinish();
            }
        }
        return this.isScoping;
    }

    setScoping(active) {
        if (this.isScoping !== active) {
            this.isScoping = active;
        }
    }

    update(dt) {
        this.time += dt;

        // Transição suave de abertura da luneta
        if (this.isScoping) {
            this.scopeAlpha = Math.min(1.0, this.scopeAlpha + dt * 6.5);
            // Respiração lenta do atirador de elite
            this.breathOffset = Math.sin(this.time * 2.2) * 2.5;
        } else {
            this.scopeAlpha = Math.max(0, this.scopeAlpha - dt * 7.5);
        }
    }

    draw(ctx, mouseX, mouseY, color = '#2ed573') {
        if (this.scopeAlpha <= 0.01) return;

        ctx.save();
        ctx.globalAlpha = this.scopeAlpha;

        const scopeX = mouseX;
        const scopeY = mouseY + this.breathOffset;
        const scopeRadius = 240;

        // 1. Escurecimento do campo periférico (Vinheta de borracha preta)
        ctx.fillStyle = 'rgba(5, 7, 10, 0.94)';
        ctx.beginPath();
        ctx.rect(0, 0, this.w, this.h);
        ctx.arc(scopeX, scopeY, scopeRadius, 0, Math.PI * 2, true); // corta a lente no centro
        ctx.fill();

        // 2. Anel metálico externo da ocular
        ctx.strokeStyle = '#1e272e';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(scopeX, scopeY, scopeRadius + 7, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#485460';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(scopeX, scopeY, scopeRadius, 0, Math.PI * 2);
        ctx.stroke();

        // 3. Tonalidade da lente de vidro tratada (Anti-Reflective Coating)
        const lensGrad = ctx.createRadialGradient(scopeX, scopeY, 20, scopeX, scopeY, scopeRadius);
        lensGrad.addColorStop(0, 'rgba(15, 30, 50, 0.05)');
        lensGrad.addColorStop(0.7, 'rgba(20, 60, 90, 0.12)');
        lensGrad.addColorStop(1, 'rgba(5, 15, 25, 0.35)');
        ctx.fillStyle = lensGrad;
        ctx.beginPath();
        ctx.arc(scopeX, scopeY, scopeRadius, 0, Math.PI * 2);
        ctx.fill();

        // 4. Retículo Mil-Dot de Franco-Atirador
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;

        // Linhas cruzadas principais
        ctx.beginPath();
        ctx.moveTo(scopeX - scopeRadius + 20, scopeY);
        ctx.lineTo(scopeX + scopeRadius - 20, scopeY);
        ctx.moveTo(scopeX, scopeY - scopeRadius + 20);
        ctx.lineTo(scopeX, scopeY + scopeRadius - 20);
        ctx.stroke();

        // Marcadores Mil-Dot
        ctx.fillStyle = color;
        for (let i = -4; i <= 4; i++) {
            if (i === 0) continue;
            const dist = i * 36;
            // Pontos horizontais
            ctx.beginPath();
            ctx.arc(scopeX + dist, scopeY, 2.2, 0, Math.PI * 2);
            ctx.fill();
            // Traços verticais com compensação balística
            ctx.beginPath();
            ctx.moveTo(scopeX - 5, scopeY + dist);
            ctx.lineTo(scopeX + 5, scopeY + dist);
            ctx.stroke();
        }

        // Círculo central fino de visada
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(scopeX, scopeY, 18, 0, Math.PI * 2);
        ctx.stroke();

        // Ponto central vermelho de impacto
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.arc(scopeX, scopeY, 3, 0, Math.PI * 2);
        ctx.fill();

        // 5. Dados Táticos Digitais (Telêmetro Militar)
        ctx.font = "bold 13px 'Courier New', monospace";
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.fillText(`DIST: 380m`, scopeX - scopeRadius + 35, scopeY + scopeRadius - 55);
        ctx.fillText(`VENTO: 1.4 m/s ↗`, scopeX - scopeRadius + 35, scopeY + scopeRadius - 38);
        ctx.textAlign = 'right';
        ctx.fillText(`ZOOM: 4.0X`, scopeX + scopeRadius - 35, scopeY + scopeRadius - 55);
        ctx.fillText(`MODO: ELITE 🎯`, scopeX + scopeRadius - 35, scopeY + scopeRadius - 38);

        ctx.restore();
    }
}

window.HorizonPig = HorizonPig;
window.SniperScopeSystem = SniperScopeSystem;
