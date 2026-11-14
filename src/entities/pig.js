// pig.js - Modelagem 2D Avançada, Animações e Comportamentos dos Porcos
// Visual estilo Cartoon AAA com sombreamento volumétrico, squash & stretch e expressões dinâmicas

// Polyfill defensivo para roundRect caso o navegador seja mais antigo
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r = 0) {
        if (typeof r === 'number') r = [r, r, r, r];
        const [tl, tr, br, bl] = r;
        this.beginPath();
        this.moveTo(x + tl, y);
        this.lineTo(x + w - tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + tr);
        this.lineTo(x + w, y + h - br);
        this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
        this.lineTo(x + bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - bl);
        this.lineTo(x, y + tl);
        this.quadraticCurveTo(x, y, x + tl, y);
        this.closePath();
        return this;
    };
}

const PIG_TYPES = {
    CLASSIC: {
        id: 'CLASSIC',
        name: 'Porco Caipira',
        hp: 60,
        speed: 130,
        points: 100,
        baseScale: 1.05,
        bodyLight: '#ffb5cb',
        bodyBase: '#ff85a2',
        bodyDark: '#e05378',
        snoutLight: '#ff8fa9',
        snoutDark: '#d83b63',
        earLight: '#ff9ebb',
        earInner: '#f06292'
    },
    BOAR: {
        id: 'BOAR',
        name: 'Javali Selvagem',
        hp: 160,
        speed: 210,
        points: 250,
        baseScale: 1.2,
        bodyLight: '#a1887f',
        bodyBase: '#6d4c41',
        bodyDark: '#3e2723',
        snoutLight: '#5d4037',
        snoutDark: '#27120c',
        earLight: '#4e342e',
        earInner: '#2d150f'
    },
    FLYING: {
        id: 'FLYING',
        name: 'Porco Voador',
        hp: 50,
        speed: 110,
        points: 200,
        baseScale: 0.95,
        bodyLight: '#ffc1d6',
        bodyBase: '#f48fb1',
        bodyDark: '#c2185b',
        snoutLight: '#f06292',
        snoutDark: '#ad1457',
        earLight: '#f48fb1',
        earInner: '#d81b60'
    },
    TNT: {
        id: 'TNT',
        name: 'Porco Dinamite',
        hp: 45,
        speed: 155,
        points: 180,
        baseScale: 1.0,
        bodyLight: '#f8bbd0',
        bodyBase: '#e57373',
        bodyDark: '#c62828',
        snoutLight: '#ef5350',
        snoutDark: '#b71c1c',
        earLight: '#ef9a9a',
        earInner: '#c62828'
    },
    GOLDEN: {
        id: 'GOLDEN',
        name: 'Porco Dourado',
        hp: 75,
        speed: 280,
        points: 1000,
        baseScale: 0.95,
        bodyLight: '#fff9c4',
        bodyBase: '#ffd54f',
        bodyDark: '#ff8f00',
        snoutLight: '#ffe082',
        snoutDark: '#ffb300',
        earLight: '#ffca28',
        earInner: '#ff6f00'
    },
    MUD_POP: {
        id: 'MUD_POP',
        name: 'Porco Espia-Lama',
        hp: 50,
        speed: 0,
        points: 150,
        baseScale: 1.05,
        bodyLight: '#ffcdd2',
        bodyBase: '#f48fb1',
        bodyDark: '#c2185b',
        snoutLight: '#f06292',
        snoutDark: '#ad1457',
        earLight: '#f48fb1',
        earInner: '#ad1457'
    },
    BOSS: {
        id: 'BOSS',
        name: 'Rei Porcão',
        hp: 1200,
        speed: 75,
        points: 5000,
        baseScale: 2.3,
        bodyLight: '#ff8a80',
        bodyBase: '#e53935',
        bodyDark: '#8e0000',
        snoutLight: '#d32f2f',
        snoutDark: '#670000',
        earLight: '#c62828',
        earInner: '#400000'
    },
    ARMORED: {
        id: 'ARMORED',
        name: 'Porco Cavaleiro de Ferro',
        hp: 140,
        armor: 100,
        speed: 125,
        points: 350,
        baseScale: 1.12,
        bodyLight: '#ffd2dc',
        bodyBase: '#f48fb1',
        bodyDark: '#c2185b',
        snoutLight: '#f06292',
        snoutDark: '#ad1457',
        earLight: '#f48fb1',
        earInner: '#ad1457'
    },
    CYBORG: {
        id: 'CYBORG',
        name: 'Porco Mecha-Ciborgue',
        hp: 220,
        armor: 150,
        speed: 105,
        points: 600,
        baseScale: 1.15,
        bodyLight: '#d1d8e0',
        bodyBase: '#778ca3',
        bodyDark: '#4b6584',
        snoutLight: '#a5b1c2',
        snoutDark: '#2c3e50',
        earLight: '#778ca3',
        earInner: '#3867d6'
    },
    WAR_BOAR: {
        id: 'WAR_BOAR',
        name: 'Javali Gladiador com Espinhos',
        hp: 260,
        armor: 130,
        speed: 195,
        points: 500,
        baseScale: 1.25,
        bodyLight: '#8d6e63',
        bodyBase: '#5d4037',
        bodyDark: '#3e2723',
        snoutLight: '#4e342e',
        snoutDark: '#1b0000',
        earLight: '#3e2723',
        earInner: '#1b0000'
    }
};

class Pig {
    constructor(typeId, x, y, direction = 1, options = {}) {
        this.type = PIG_TYPES[typeId] || PIG_TYPES.CLASSIC;
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.groundY = y;
        this.currentY = y;
        this.direction = direction; // 1 = direita, -1 = esquerda
        this.isReindeerPig = Math.random() < 0.4;
        this.maxHp = this.type.hp * (options.hpMult || 1.0);
        this.hp = this.maxHp;
        this.scale = this.type.baseScale;
        this.width = 75 * this.scale;
        this.height = 60 * this.scale;

        this.speedX = this.type.speed * direction * (options.speedMult || 1.0);
        this.speedY = 0;

        // Animação & Física Orgânica (Squash & Stretch)
        this.animTime = Math.random() * 10;
        this.hurtTimer = 0;
        this.isDead = false;
        this.deathTimer = 0;
        this.escaped = false;

        this.hopHeight = 0;
        this.squashX = 1.0;
        this.squashY = 1.0;

        // Expressões
        this.blinkTimer = Math.random() * 3 + 2;
        this.isBlinking = false;
        this.earWiggle = 0;

        // Acessórios
        this.balloonPopped = false;
        this.balloonColor = options.balloonColor || (Math.random() > 0.5 ? '#e74c3c' : '#3498db');
        this.balloonWobble = Math.random() * 5;
        this.fuseSpark = 0;

        // Efeito Porco Dourado
        this.sparkleTimer = 0;

        // Porco da lama
        this.isMudPig = this.type.id === 'MUD_POP';
        this.mudState = 'rising';
        this.mudTimer = 0;
        this.mudOffset = 65;

        // Sistema de Armadura Metálica
        this.maxArmor = (this.type.armor || 0) * (options.armorMult || 1.0);
        this.armor = this.maxArmor;
        this.armorBroken = false;
    }

    update(dt, canvasWidth, canvasHeight, frenzyActive = false) {
        if (this.isDead) {
            this.deathTimer += dt;
            return;
        }

        const effectiveDt = frenzyActive ? dt * 0.65 : dt;
        this.animTime += effectiveDt * 7;
        if (this.hurtTimer > 0) this.hurtTimer -= dt;

        // Piscar de olhos realista
        this.blinkTimer -= dt;
        if (this.blinkTimer <= 0) {
            this.isBlinking = true;
            if (this.blinkTimer <= -0.15) {
                this.isBlinking = false;
                this.blinkTimer = Math.random() * 3.5 + 2.0;
            }
        }

        // Animação de orelhas com inércia
        this.earWiggle = Math.sin(this.animTime * 1.5) * 4;

        // Centelha da dinamite
        if (this.type.id === 'TNT') {
            this.fuseSpark = (this.fuseSpark + dt * 25) % 1;
        }

        // Porco Voador
        if (this.type.id === 'FLYING') {
            this.balloonWobble += dt * 3;
            if (!this.balloonPopped) {
                this.x += this.speedX * effectiveDt;
                this.y = this.startY + Math.sin(this.animTime * 0.45) * 22;
                this.currentY = this.y;
                this.hopHeight = 0;
                this.squashX = 1.0;
                this.squashY = 1.0;
            } else {
                // Balão estourou: cai girando
                this.speedY += 980 * dt;
                this.y += this.speedY * dt;
                this.currentY = this.y;
                this.x += (this.speedX * 0.4) * effectiveDt;
            }
        } else if (this.isMudPig) {
            this.updateMudBehavior(dt);
            this.currentY = this.y + this.mudOffset;
        } else {
            // Movimento Terrestre com Pulinhos Elásticos (Squash & Stretch)
            this.x += this.speedX * effectiveDt;
            const hopSin = Math.sin(this.animTime);
            const hopPositive = Math.max(0, hopSin);
            this.hopHeight = hopPositive * (16 * this.scale);
            this.currentY = this.groundY - this.hopHeight;

            // Deformação plástica viva
            if (hopSin < 0) {
                // Aterrissando: achata e alarga
                this.squashX = 1.08;
                this.squashY = 0.92;
            } else {
                // No topo do salto: estica sutilmente
                this.squashX = 0.96;
                this.squashY = 1.04;
            }
        }

        // Checagem de fuga das bordas
        if (this.direction > 0 && this.x > canvasWidth + 120) {
            this.escaped = true;
        } else if (this.direction < 0 && this.x < -120) {
            this.escaped = true;
        } else if (this.currentY > canvasHeight + 120) {
            this.escaped = true;
        }
    }

    updateMudBehavior(dt) {
        this.mudTimer += dt;
        if (this.mudState === 'rising') {
            this.mudOffset = Math.max(0, this.mudOffset - dt * 160);
            if (this.mudOffset <= 0) {
                this.mudOffset = 0;
                this.mudState = 'waiting';
                this.mudTimer = 0;
            }
        } else if (this.mudState === 'waiting') {
            if (this.mudTimer > 2.0) {
                this.mudState = 'diving';
            }
        } else if (this.mudState === 'diving') {
            this.mudOffset += dt * 150;
            if (this.mudOffset >= 65) {
                this.escaped = true;
            }
        }
    }

    checkHit(shotX, shotY, radius = 0) {
        if (this.isDead || this.escaped) return { hit: false };

        const renderY = this.currentY;

        // Se for voador com balão, checa o balão primeiro
        if (this.type.id === 'FLYING' && !this.balloonPopped) {
            const balloonX = this.x;
            const balloonY = renderY - 50 * this.scale;
            const distB = Math.hypot(shotX - balloonX, shotY - balloonY);
            if (distB <= (24 * this.scale + radius)) {
                this.balloonPopped = true;
                return { hit: true, balloonPop: true, isHeadshot: false, points: 50 };
            }
        }

        // Hitbox Cabeça (frente do porco)
        const headOffset = (this.direction > 0 ? 20 : -20) * this.scale;
        const headX = this.x + headOffset;
        const headY = renderY - 6 * this.scale;
        const headRadius = 24 * this.scale;

        const distHead = Math.hypot(shotX - headX, shotY - headY);
        if (distHead <= headRadius + radius) {
            return { hit: true, isHeadshot: true, distance: distHead };
        }

        // Hitbox Corpo
        const bodyX = this.x - headOffset * 0.4;
        const bodyY = renderY;
        const bodyRadius = 34 * this.scale;

        const distBody = Math.hypot(shotX - bodyX, shotY - bodyY);
        if (distBody <= bodyRadius + radius) {
            return { hit: true, isHeadshot: false, distance: distBody };
        }

        return { hit: false };
    }

    takeDamage(amount, isHeadshot = false, headshotMultiplier = 1.8, weaponKey = '') {
        if (this.isDead) return false;

        this.hurtTimer = 0.16;

        // Se o porco possui armadura ativa
        if (this.armor > 0) {
            const isArmorPiercing = weaponKey === 'launcher' || (weaponKey === 'sniper' && isHeadshot);

            if (isArmorPiercing) {
                // Tiro perfurante / explosão estilhaça a armadura de vez!
                this.armor = 0;
                this.armorBroken = true;
                if (window.sounds && window.sounds.playMetalClang) {
                    window.sounds.playMetalClang();
                }
                const finalDamage = isHeadshot ? (amount * headshotMultiplier) : amount;
                this.hp -= finalDamage;
            } else {
                // A armadura metálica absorve 70% do dano, apenas 30% atinge a vida
                const absorbed = amount * 0.70;
                const hpDamage = isHeadshot ? (amount * 0.45 * headshotMultiplier) : (amount * 0.30);
                this.armor -= absorbed;
                this.hp -= hpDamage;

                if (window.sounds && window.sounds.playMetalClang) {
                    window.sounds.playMetalClang();
                }

                if (this.armor <= 0) {
                    this.armor = 0;
                    this.armorBroken = true;
                }
            }
        } else {
            const finalDamage = isHeadshot ? (amount * headshotMultiplier) : amount;
            this.hp -= finalDamage;
        }

        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
            this.deathTimer = 0;
            return true;
        }
        return false;
    }

    draw(ctx) {
        if (this.escaped && !this.isDead) return;

        const renderY = this.currentY;

        // 1. Sombra Suave no Chão (Perspectiva 2.5D Realista)
        if (!this.isDead && !this.isMudPig) {
            this.drawDropShadow(ctx);
        }

        ctx.save();
        ctx.translate(this.x, renderY);

        if (this.isDead) {
            // Animação cômica de eliminação
            ctx.rotate(this.deathTimer * 9 * this.direction);
            const fade = Math.max(0, 1 - this.deathTimer * 1.8);
            ctx.scale(fade, fade);
        }

        // Espelha para a direção correta
        if (this.direction < 0) {
            ctx.scale(-1, 1);
        }

        // Escala e Squash & Stretch
        ctx.scale(this.scale * this.squashX, this.scale * this.squashY);

        // Flash de Dano (Brilho intenso ao levar tiro)
        if (this.hurtTimer > 0) {
            ctx.filter = 'brightness(2.2) saturate(0.3)';
        }

        // Aura Dourada Mágica se for Porco Dourado
        if (this.type.id === 'GOLDEN') {
            this.drawGoldenAura(ctx);
        }

        // 2. Balão de Voo
        if (this.type.id === 'FLYING' && !this.balloonPopped) {
            this.drawBalloon(ctx);
        }

        // 3. Dinamite nas costas
        if (this.type.id === 'TNT') {
            this.drawTNT(ctx);
        }

        // 4. Pernas traseiras (em sombra para profundidade)
        this.drawBackLegs(ctx);

        // 5. Rabinho em espiral
        this.drawTail(ctx);

        // 6. Manto Real (se for o Rei)
        if (this.type.id === 'BOSS') {
            this.drawRoyalCape(ctx);
        }

        // 7. Corpo volumoso com iluminação esférica
        this.drawBody(ctx);

        // 8. Pernas dianteiras
        this.drawFrontLegs(ctx);

        // 9. Cabeça, Expressões Faciais, Bochechas e Focinho
        this.drawHeadAndFace(ctx);

        // 10. Acessórios especiais
        if (this.type.id === 'BOSS') {
            this.drawImperialCrown(ctx);
            this.drawMustacheAndMonocle(ctx);
        } else if (this.type.id === 'BOAR') {
            this.drawTusksAndScar(ctx);
        } else if (this.type.id === 'FLYING') {
            this.drawAviatorGoggles(ctx);
        } else if (this.type.id === 'GOLDEN') {
            this.drawGoldenShine(ctx);
        } else if (this.type.id === 'ARMORED') {
            this.drawArmoredKnight(ctx);
        } else if (this.type.id === 'CYBORG') {
            this.drawCyborgArmor(ctx);
        } else if (this.type.id === 'WAR_BOAR') {
            this.drawWarBoarArmor(ctx);
        }

        // Acessórios temáticos da Edição Especial de Natal
        if (window.game && window.game.isChristmasMode) {
            this.drawChristmasAccessories(ctx);
        }

        ctx.restore();

        // Barra de Escudo de Armadura Metálica
        if (this.maxArmor > 0 && !this.isDead) {
            this.drawArmorShieldBar(ctx, renderY);
        }

        // Barra de Vida para o Chefão Rei Porcão
        if (this.type.id === 'BOSS' && !this.isDead) {
            this.drawBossHpBar(ctx, renderY);
        }
    }

    // Sombra projetada no pasto
    drawDropShadow(ctx) {
        ctx.save();
        const shadowY = this.groundY + 22 * this.scale;
        const altitude = Math.max(0, this.groundY - this.currentY);
        const shrink = Math.max(0.4, 1.0 - (altitude / 160));

        ctx.translate(this.x, shadowY);
        ctx.scale(this.scale * shrink, (this.scale * shrink) * 0.35);

        const shadowGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 36);
        shadowGrad.addColorStop(0, 'rgba(10, 30, 15, 0.45)');
        shadowGrad.addColorStop(0.7, 'rgba(10, 30, 15, 0.20)');
        shadowGrad.addColorStop(1, 'rgba(10, 30, 15, 0)');

        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawBody(ctx) {
        // Corpo principal com gradiente esférico 3D
        const bodyGrad = ctx.createRadialGradient(-10, -12, 6, 0, 0, 42);
        bodyGrad.addColorStop(0, this.type.bodyLight);
        bodyGrad.addColorStop(0.65, this.type.bodyBase);
        bodyGrad.addColorStop(1, this.type.bodyDark);

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 38, 28, 0, 0, Math.PI * 2);
        ctx.fill();

        // Contorno cartoon estilizado
        ctx.strokeStyle = '#2d151e';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Barriga fofa iluminada
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.beginPath();
        ctx.ellipse(-2, 8, 24, 14, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Manchas ou crista de pelos no dorso do Javali
        if (this.type.id === 'BOAR') {
            this.drawBoarMane(ctx);
        }

        // Brilho especular suave nas costas
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-14, -16, 16, 6, -0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawBoarMane(ctx) {
        // Crista de pelos espetados no dorso
        ctx.fillStyle = '#27120c';
        ctx.strokeStyle = '#150805';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-28, -20);
        ctx.lineTo(-24, -34);
        ctx.lineTo(-18, -24);
        ctx.lineTo(-12, -36);
        ctx.lineTo(-6, -25);
        ctx.lineTo(2, -33);
        ctx.lineTo(10, -22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    drawBackLegs(ctx) {
        const anim = Math.sin(this.animTime) * 7;

        // Pata Traseira Direita (mais ao fundo, tom mais escuro)
        ctx.save();
        ctx.fillStyle = this.type.bodyDark;
        ctx.strokeStyle = '#2d151e';
        ctx.lineWidth = 2.5;

        // Traseira
        ctx.beginPath();
        ctx.roundRect(-24 - anim, 12, 11, 20, [3, 3, 5, 5]);
        ctx.fill();
        ctx.stroke();

        // Casco escuro bipartido
        ctx.fillStyle = '#1e1014';
        ctx.fillRect(-24 - anim, 26, 11, 6);
        ctx.restore();
    }

    drawFrontLegs(ctx) {
        const anim = Math.sin(this.animTime) * 7;

        ctx.save();
        ctx.fillStyle = this.type.snoutLight;
        ctx.strokeStyle = '#2d151e';
        ctx.lineWidth = 2.5;

        // Pata Dianteira Esquerda
        ctx.beginPath();
        ctx.roundRect(12 - anim, 14, 11, 20, [3, 3, 5, 5]);
        ctx.fill();
        ctx.stroke();

        // Casco dianteiro
        ctx.fillStyle = '#1e1014';
        ctx.fillRect(12 - anim, 28, 11, 6);
        // Fenda do casco bipartido
        ctx.fillStyle = '#e8437a';
        ctx.fillRect(17 - anim, 30, 1.5, 4);

        // Pata Traseira Esquerda
        ctx.fillStyle = this.type.snoutLight;
        ctx.beginPath();
        ctx.roundRect(-20 + anim, 14, 11, 20, [3, 3, 5, 5]);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1e1014';
        ctx.fillRect(-20 + anim, 28, 11, 6);
        ctx.fillStyle = '#e8437a';
        ctx.fillRect(-15 + anim, 30, 1.5, 4);
        ctx.restore();
    }

    drawTail(ctx) {
        const wag = Math.sin(this.animTime * 1.8) * 5;
        ctx.save();
        ctx.strokeStyle = this.type.snoutDark;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(-36, -2);
        ctx.bezierCurveTo(-46 + wag, -14, -54, 2, -45, -12);
        ctx.stroke();

        // Pontinha charmosa do rabo
        ctx.fillStyle = this.type.snoutDark;
        ctx.beginPath();
        ctx.arc(-45, -12, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawHeadAndFace(ctx) {
        ctx.save();

        // 1. Cabeça volumosa com gradiente 3D
        const headGrad = ctx.createRadialGradient(20, -14, 4, 24, -6, 26);
        headGrad.addColorStop(0, this.type.bodyLight);
        headGrad.addColorStop(0.7, this.type.bodyBase);
        headGrad.addColorStop(1, this.type.bodyDark);

        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(24, -6, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2d151e';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 2. Bochecha rosada difusa (blush de cartoon)
        const blushGrad = ctx.createRadialGradient(22, 2, 2, 22, 2, 10);
        blushGrad.addColorStop(0, 'rgba(255, 60, 110, 0.45)');
        blushGrad.addColorStop(1, 'rgba(255, 60, 110, 0)');
        ctx.fillStyle = blushGrad;
        ctx.beginPath();
        ctx.arc(22, 2, 10, 0, Math.PI * 2);
        ctx.fill();

        // 3. Orelhinha animada com dobra interna
        this.drawEar(ctx);

        // 4. Olhos grandes expressivos
        this.drawEyes(ctx);

        // 5. Focinho 3D com narinas detalhadas
        this.drawSnout(ctx);

        // 6. Boquinha expressiva
        this.drawMouth(ctx);

        ctx.restore();
    }

    drawEar(ctx) {
        ctx.save();
        ctx.translate(16, -22);
        ctx.rotate((this.earWiggle * Math.PI) / 180);

        // Orelha externa
        const earGrad = ctx.createLinearGradient(0, 0, 12, -18);
        earGrad.addColorStop(0, this.type.bodyBase);
        earGrad.addColorStop(1, this.type.earLight);

        ctx.fillStyle = earGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(8, -24, 16, -18);
        ctx.quadraticCurveTo(18, -6, 8, 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#2d151e';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Interior da orelha (rosado/escuro)
        ctx.fillStyle = this.type.earInner;
        ctx.beginPath();
        ctx.moveTo(3, -2);
        ctx.quadraticCurveTo(8, -18, 13, -14);
        ctx.quadraticCurveTo(14, -6, 7, 1);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    drawEyes(ctx) {
        ctx.save();
        const eyeX = 26;
        const eyeY = -14;
        const eyeRadius = 6.5;

        // Se estiver piscando: risquinho fechado
        if (this.isBlinking) {
            ctx.strokeStyle = '#1e1014';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(eyeX, eyeY, eyeRadius, 0.2, Math.PI - 0.2);
            ctx.stroke();
            ctx.restore();
            return;
        }

        // Esclera branca perolada com sombra superior
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2d151e';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Sombra da pálpebra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeRadius, Math.PI, 0);
        ctx.fill();

        // Íris (castanha, azulada ou vermelha no Javali)
        let irisColor = '#4a2810';
        if (this.type.id === 'BOAR') irisColor = '#d63031';
        else if (this.type.id === 'GOLDEN') irisColor = '#e67e22';

        ctx.fillStyle = irisColor;
        ctx.beginPath();
        ctx.arc(eyeX + 1.2, eyeY, 3.8, 0, Math.PI * 2);
        ctx.fill();

        // Pupila preta viva
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(eyeX + 1.4, eyeY, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Destaque de luz especular primário (brilho grande)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX + 2.5, eyeY - 1.8, 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Destaque secundário (brilho pequeno fofo)
        ctx.beginPath();
        ctx.arc(eyeX + 0.5, eyeY + 1.5, 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Sobrancelha expressiva
        ctx.strokeStyle = this.type.id === 'BOAR' ? '#150805' : '#4a1525';
        ctx.lineWidth = this.type.id === 'BOAR' ? 3 : 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (this.type.id === 'BOAR') {
            // Sobrancelha furiosa em V
            ctx.moveTo(eyeX - 4, eyeY - 8);
            ctx.lineTo(eyeX + 5, eyeY - 6);
        } else if (this.type.id === 'TNT') {
            // Sobrancelha arqueada de medo cômico
            ctx.moveTo(eyeX - 4, eyeY - 9);
            ctx.quadraticCurveTo(eyeX, eyeY - 13, eyeX + 5, eyeY - 8);
        } else {
            // Curiosa e simpática
            ctx.moveTo(eyeX - 4, eyeY - 8);
            ctx.quadraticCurveTo(eyeX + 1, eyeY - 11, eyeX + 6, eyeY - 8);
        }
        ctx.stroke();

        ctx.restore();
    }

    drawSnout(ctx) {
        ctx.save();
        const snoutX = 38;
        const snoutY = -3;

        // Focinho volumoso chanfrado com gradiente
        const snoutGrad = ctx.createLinearGradient(snoutX - 12, snoutY - 10, snoutX + 12, snoutY + 10);
        snoutGrad.addColorStop(0, this.type.snoutLight);
        snoutGrad.addColorStop(1, this.type.snoutDark);

        ctx.fillStyle = snoutGrad;
        ctx.beginPath();
        ctx.ellipse(snoutX, snoutY, 13, 9.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2d151e';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Borda superior iluminada (highlight)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.ellipse(snoutX - 1, snoutY - 4, 8, 3, -0.1, 0, Math.PI * 2);
        ctx.fill();

        // Narinas profundas ovais com sombra interna
        const drawNostril = (nx, ny) => {
            ctx.fillStyle = '#1e0810';
            ctx.beginPath();
            ctx.ellipse(nx, ny, 2.5, 4, 0.15, 0, Math.PI * 2);
            ctx.fill();

            // Ponto de luz na borda inferior da narina
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(nx, ny + 3, 1, 0, Math.PI * 2);
            ctx.fill();
        };

        drawNostril(snoutX - 4.5, snoutY);
        drawNostril(snoutX + 2.5, snoutY);

        ctx.restore();
    }

    drawMouth(ctx) {
        ctx.save();
        ctx.strokeStyle = '#3e0c1b';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.arc(31, 7, 6, 0.3, Math.PI * 0.85);
        ctx.stroke();

        // Dente saliente fofo
        if (this.type.id !== 'BOAR') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(32, 7.5, 2.5, 3);
            ctx.strokeStyle = '#3e0c1b';
            ctx.lineWidth = 1;
            ctx.strokeRect(32, 7.5, 2.5, 3);
        }
        ctx.restore();
    }

    drawTusksAndScar(ctx) {
        ctx.save();
        // Presas de marfim curvadas com brilho
        const drawTusk = (tx, ty, rot) => {
            ctx.save();
            ctx.translate(tx, ty);
            ctx.rotate(rot);

            const tuskGrad = ctx.createLinearGradient(0, 0, 14, -10);
            tuskGrad.addColorStop(0, '#f5f6fa');
            tuskGrad.addColorStop(0.7, '#dcdde1');
            tuskGrad.addColorStop(1, '#718093');

            ctx.fillStyle = tuskGrad;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(12, 4, 15, -12);
            ctx.quadraticCurveTo(6, -4, 0, -4);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#1e1014';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        };

        drawTusk(35, 5, 0.1);
        drawTusk(42, 6, 0.25);

        // Cicatriz de guerra no olho
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(23, -22);
        ctx.lineTo(29, -7);
        ctx.stroke();

        // Pequenos pontos cruzados na cicatriz
        ctx.beginPath();
        ctx.moveTo(24, -16); ctx.lineTo(28, -14);
        ctx.moveTo(25, -12); ctx.lineTo(29, -10);
        ctx.stroke();

        // Vapor de narina do javali enfurecido ao correr
        const snortCycle = (this.animTime * 2.5) % (Math.PI * 2);
        if (Math.sin(snortCycle) > 0.3) {
            const steamAlpha = Math.sin(snortCycle) * 0.65;
            ctx.fillStyle = `rgba(245, 245, 250, ${steamAlpha})`;
            ctx.beginPath();
            ctx.arc(46 + Math.sin(snortCycle) * 4, -4, 3, 0, Math.PI * 2);
            ctx.arc(53 + Math.sin(snortCycle) * 8, -6, 4.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawImperialCrown(ctx) {
        ctx.save();
        ctx.translate(22, -26);

        // Coroa de Ouro Polido
        const crownGrad = ctx.createLinearGradient(-16, -20, 16, 0);
        crownGrad.addColorStop(0, '#fff59d');
        crownGrad.addColorStop(0.5, '#fbc02d');
        crownGrad.addColorStop(1, '#f57f17');

        ctx.fillStyle = crownGrad;
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(-20, -18);
        ctx.lineTo(-10, -9);
        ctx.lineTo(0, -26);
        ctx.lineTo(10, -9);
        ctx.lineTo(20, -18);
        ctx.lineTo(18, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#4a2800';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Pérolas nas 3 pontas
        const drawPearl = (px, py) => {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#d39e00';
            ctx.lineWidth = 1;
            ctx.stroke();
        };

        drawPearl(-20, -18);
        drawPearl(0, -26);
        drawPearl(20, -18);

        // Grande Rubi Central Facetado
        ctx.fillStyle = '#d63031';
        ctx.beginPath();
        ctx.arc(0, -8, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#630000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Brilho do rubi
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-1.5, -9.5, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawRoyalCape(ctx) {
        ctx.save();
        // Manto de veludo carmesim drapeado nas costas
        ctx.fillStyle = '#8e0000';
        ctx.strokeStyle = '#380000';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(-10, -18);
        ctx.quadraticCurveTo(-38, 2, -34, 28);
        ctx.quadraticCurveTo(-20, 26, -6, 26);
        ctx.quadraticCurveTo(-14, 4, -10, -18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Gola de arminho branca fofa com pintas reais
        ctx.fillStyle = '#f5f6fa';
        ctx.beginPath();
        ctx.ellipse(-10, -14, 8, 14, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#2f3542';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Pintas pretas na gola
        ctx.fillStyle = '#1e1014';
        ctx.beginPath();
        ctx.arc(-11, -18, 1.8, 0, Math.PI * 2);
        ctx.arc(-7, -13, 1.8, 0, Math.PI * 2);
        ctx.arc(-12, -8, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawMustacheAndMonocle(ctx) {
        ctx.save();
        // Bigode aristocrático enrolado
        ctx.fillStyle = '#2c140e';
        ctx.strokeStyle = '#150805';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(32, 4);
        ctx.quadraticCurveTo(40, 2, 46, 7);
        ctx.quadraticCurveTo(42, 10, 36, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Monóculo dourado no olho
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(26, -14, 8, 0, Math.PI * 2);
        ctx.stroke();
        // Correntinha do monóculo
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(33, -11);
        ctx.quadraticCurveTo(36, -2, 28, 6);
        ctx.stroke();

        ctx.restore();
    }

    drawChristmasAccessories(ctx) {
        ctx.save();

        if (this.type.id === 'BOSS') {
            // Papai Noel Gigante: Barba branca farta e Gorro Natalino
            // Barba branca volumosa
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(36, 12, 12, 0, Math.PI * 2);
            ctx.arc(46, 14, 10, 0, Math.PI * 2);
            ctx.arc(28, 14, 10, 0, Math.PI * 2);
            ctx.arc(38, 22, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#dcdde1';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Gorro de Papai Noel no topo da coroa
            ctx.fillStyle = '#c0392b';
            ctx.beginPath();
            ctx.moveTo(10, -32);
            ctx.quadraticCurveTo(24, -58, 48, -44);
            ctx.quadraticCurveTo(28, -36, 32, -30);
            ctx.closePath();
            ctx.fill();

            // Pom-pom branco do gorro
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(48, -44, 6, 0, Math.PI * 2);
            ctx.fill();

            // Borda de pelo branco
            ctx.fillStyle = '#f5f6fa';
            ctx.beginPath();
            ctx.roundRect(10, -35, 26, 7, 3);
            ctx.fill();

        } else if (this.isReindeerPig) {
            // Chifres de Rena e Nariz Vermelho da Rudolph
            ctx.strokeStyle = '#5d4037';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            // Chifre Esquerdo
            ctx.beginPath();
            ctx.moveTo(18, -18); ctx.lineTo(14, -34);
            ctx.moveTo(16, -26); ctx.lineTo(10, -28);
            ctx.moveTo(15, -31); ctx.lineTo(11, -34);
            ctx.stroke();
            // Chifre Direito
            ctx.beginPath();
            ctx.moveTo(26, -18); ctx.lineTo(30, -35);
            ctx.moveTo(28, -26); ctx.lineTo(35, -28);
            ctx.moveTo(29, -31); ctx.lineTo(36, -33);
            ctx.stroke();

            // Nariz de Rudolph brilhante
            ctx.fillStyle = '#ff3838';
            ctx.shadowColor = '#ff3838';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(44, -3, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

        } else if (this.type.id === 'FLYING') {
            // Gorro de Elfo verde com sino dourado
            ctx.fillStyle = '#27ae60';
            ctx.beginPath();
            ctx.moveTo(12, -18);
            ctx.quadraticCurveTo(22, -38, 38, -32);
            ctx.quadraticCurveTo(24, -22, 28, -17);
            ctx.closePath();
            ctx.fill();

            // Sino dourado
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(38, -32, 4.5, 0, Math.PI * 2);
            ctx.fill();

            // Borda de pelo vermelha
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.roundRect(12, -21, 18, 5, 2);
            ctx.fill();

        } else {
            // Gorro clássico de Papai Noel vermelho
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.moveTo(14, -18);
            ctx.quadraticCurveTo(24, -42, 42, -32);
            ctx.quadraticCurveTo(26, -24, 28, -17);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#c0392b';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Pom-pom branco macio
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(42, -32, 5, 0, Math.PI * 2);
            ctx.fill();

            // Faixa de pele branca
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.roundRect(13, -21, 18, 6, 3);
            ctx.fill();
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.restore();
    }

    drawAviatorGoggles(ctx) {
        ctx.save();
        // Óculos de aviador retrô levantados na testa
        ctx.translate(22, -22);

        // Faixa elástica marrom
        ctx.strokeStyle = '#4a2810';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-16, 2);
        ctx.lineTo(12, 0);
        ctx.stroke();

        // Aro de couro/bronze das lentes
        const drawLens = (lx) => {
            ctx.fillStyle = '#78909c';
            ctx.beginPath();
            ctx.arc(lx, 0, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#d35400';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Reflexo diagonal azul celeste
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.ellipse(lx - 1.5, -2, 3, 1.5, 0.7, 0, Math.PI * 2);
            ctx.fill();
        };

        drawLens(-4);
        drawLens(6);
        ctx.restore();
    }

    drawBalloon(ctx) {
        ctx.save();
        const wobble = Math.sin(this.balloonWobble) * 3;

        // Cordinha trêmula
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.quadraticCurveTo(wobble * 2, -45, wobble, -60);
        ctx.stroke();

        // Nó do balão
        ctx.fillStyle = this.balloonColor;
        ctx.beginPath();
        ctx.moveTo(wobble - 3, -60);
        ctx.lineTo(wobble + 3, -60);
        ctx.lineTo(wobble, -56);
        ctx.closePath();
        ctx.fill();

        // Balão 3D translúcido com brilho
        const bx = wobble;
        const by = -82;
        const bGrad = ctx.createRadialGradient(bx - 6, by - 8, 4, bx, by, 26);
        bGrad.addColorStop(0, '#ffffff');
        bGrad.addColorStop(0.35, this.balloonColor);
        bGrad.addColorStop(1, '#1b1b1b');

        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.ellipse(bx, by, 20, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1e1014';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Reflexo de luz na curvatura do balão
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.ellipse(bx - 7, by - 10, 5, 10, -0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawTNT(ctx) {
        ctx.save();
        ctx.translate(-2, -26);

        // Cinta preta reforçada
        ctx.fillStyle = '#1e272e';
        ctx.fillRect(-18, -4, 36, 18);

        // 3 cartuchos de dinamite vermelha com efeito 3D
        const drawStick = (sx, sy) => {
            const tntGrad = ctx.createLinearGradient(sx, sy, sx, sy + 7);
            tntGrad.addColorStop(0, '#ff7675');
            tntGrad.addColorStop(0.5, '#d63031');
            tntGrad.addColorStop(1, '#630000');

            ctx.fillStyle = tntGrad;
            ctx.fillRect(sx, sy, 32, 6.5);
            ctx.strokeStyle = '#2d151e';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(sx, sy, 32, 6.5);
        };

        drawStick(-16, -3);
        drawStick(-16, 4);

        // Texto "TNT" em estêncil
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 7px sans-serif';
        ctx.fillText('TNT', -8, 2);

        // Pavio torcido saindo
        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.quadraticCurveTo(24, -8, 22, -18);
        ctx.stroke();

        // Faísca cintilante animada
        const fx = 22;
        const fy = -18;
        ctx.fillStyle = this.fuseSpark > 0.5 ? '#ffff00' : '#ff3838';
        ctx.shadowColor = '#fffa65';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(fx, fy, 4, 0, Math.PI * 2);
        ctx.fill();

        // Pequenos raios de faísca
        ctx.strokeStyle = '#ff9f43';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
            const a = (this.fuseSpark * 10) + (i * Math.PI / 2);
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(fx + Math.cos(a) * 7, fy + Math.sin(a) * 7);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;

        ctx.restore();
    }

    drawGoldenAura(ctx) {
        // Halo de raios solares dourados
        ctx.save();
        const spin = Date.now() * 0.002;
        ctx.strokeStyle = 'rgba(255, 234, 167, 0.45)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
            const ang = spin + (i * Math.PI / 4);
            ctx.beginPath();
            ctx.moveTo(Math.cos(ang) * 36, Math.sin(ang) * 26);
            ctx.lineTo(Math.cos(ang) * 54, Math.sin(ang) * 40);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawGoldenShine(ctx) {
        // Óculos escuros "Deal with it" no Porco Dourado
        ctx.save();
        ctx.translate(26, -15);
        ctx.fillStyle = '#111';
        ctx.fillRect(-6, -2, 14, 6);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.moveTo(-4, -1); ctx.lineTo(-1, 3);
        ctx.moveTo(2, -1); ctx.lineTo(5, 3);
        ctx.stroke();
        ctx.restore();
    }

    drawBossHpBar(ctx, renderY) {
        const barWidth = 160;
        const barHeight = 14;
        const barX = this.x - barWidth / 2;
        const barY = renderY - 95;

        ctx.save();
        // Fundo com sombra
        ctx.fillStyle = 'rgba(15, 20, 25, 0.85)';
        ctx.fillRect(barX - 4, barY - 4, barWidth + 8, barHeight + 8);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX - 4, barY - 4, barWidth + 8, barHeight + 8);

        const hpRatio = Math.max(0, this.hp / this.maxHp);
        const hpGrad = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
        hpGrad.addColorStop(0, '#2ed573');
        hpGrad.addColorStop(0.5, '#ffa502');
        hpGrad.addColorStop(1, '#ff4757');

        ctx.fillStyle = hpGrad;
        ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

        // Texto do Boss
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`👑 REI PORCÃO: ${Math.ceil(this.hp)} / ${this.maxHp}`, this.x, barY + barHeight / 2);
        ctx.restore();
    }

    drawArmoredKnight(ctx) {
        ctx.save();

        // 1. Placa de Peito de Ferro Medieval (Couraça com rebites)
        const chestGrad = ctx.createLinearGradient(-15, -15, 15, 20);
        chestGrad.addColorStop(0, '#dfe4ea');
        chestGrad.addColorStop(0.5, '#747d8c');
        chestGrad.addColorStop(1, '#2f3542');

        ctx.fillStyle = chestGrad;
        ctx.strokeStyle = '#1e272e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-18, -10, 36, 28, 6);
        ctx.fill();
        ctx.stroke();

        // Rebites de ferro na couraça
        ctx.fillStyle = '#f1f2f6';
        const drawRivet = (rx, ry) => {
            ctx.beginPath();
            ctx.arc(rx, ry, 1.8, 0, Math.PI * 2);
            ctx.fill();
        };
        drawRivet(-14, -6);
        drawRivet(14, -6);
        drawRivet(-14, 14);
        drawRivet(14, 14);

        // Ombreira de aço chanfrada
        ctx.fillStyle = '#a4b0be';
        ctx.beginPath();
        ctx.ellipse(-6, -14, 10, 6, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 2. Grande Elmo Medieval de Balde (Greathelm) cobrindo a cabeça
        ctx.save();
        ctx.translate(22, -10);

        if (this.armorBroken) {
            // Elmo torto amassado e trincado quando armadura quebra
            ctx.rotate(0.35);
            ctx.translate(4, -8);
        }

        const helmGrad = ctx.createLinearGradient(-16, -26, 16, 16);
        helmGrad.addColorStop(0, '#f1f2f6');
        helmGrad.addColorStop(0.4, '#a4b0be');
        helmGrad.addColorStop(0.8, '#57606f');
        helmGrad.addColorStop(1, '#2f3542');

        ctx.fillStyle = helmGrad;
        ctx.strokeStyle = '#1e272e';
        ctx.lineWidth = 2.5;

        // Formato de elmo de balde cilíndrico medieval
        ctx.beginPath();
        ctx.moveTo(-16, -24);
        ctx.lineTo(16, -24);
        ctx.lineTo(18, 12);
        ctx.lineTo(4, 16);
        ctx.lineTo(-18, 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Reforço em cruz de latão no elmo
        ctx.strokeStyle = '#eccc68';
        ctx.lineWidth = 3;
        // Visor horizontal
        ctx.beginPath();
        ctx.moveTo(-16, -4); ctx.lineTo(17, -4);
        ctx.stroke();
        // Reforço vertical
        ctx.beginPath();
        ctx.moveTo(0, -22); ctx.lineTo(0, 14);
        ctx.stroke();

        // Fenda de visão (visor slit)
        ctx.fillStyle = '#111111';
        ctx.fillRect(-14, -6, 28, 4);

        // Olhos espiando pela fenda
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-9, -5, 4, 2.5);
        ctx.fillRect(5, -5, 4, 2.5);
        ctx.fillStyle = '#000000';
        ctx.fillRect(-7, -5, 2, 2.5);
        ctx.fillRect(7, -5, 2, 2.5);

        // Furos de respiração na frente do elmo
        ctx.fillStyle = '#1e272e';
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath(); ctx.arc(i * 6, 4, 1.2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(i * 6, 9, 1.2, 0, Math.PI * 2); ctx.fill();
        }

        // Plumagem de cavaleiro (penas azul/vermelho ondulando no topo)
        ctx.strokeStyle = '#3742fa';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, -24);
        ctx.quadraticCurveTo(-14, -38, -26 + Math.sin(this.animTime * 1.5) * 4, -40);
        ctx.stroke();

        ctx.strokeStyle = '#ff4757';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -24);
        ctx.quadraticCurveTo(-10, -36, -20 + Math.sin(this.animTime * 1.5 + 0.5) * 4, -44);
        ctx.stroke();

        // Rachaduras se a armadura foi avariada
        if (this.armorBroken) {
            ctx.strokeStyle = '#ffa502';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-10, -18); ctx.lineTo(-4, -10); ctx.lineTo(-8, 2);
            ctx.stroke();
        }

        ctx.restore();
        ctx.restore();
    }

    drawCyborgArmor(ctx) {
        ctx.save();

        // 1. Chapa de Titânio no Peito e Costas
        const cyberGrad = ctx.createLinearGradient(-20, -15, 20, 20);
        cyberGrad.addColorStop(0, '#a5b1c2');
        cyberGrad.addColorStop(0.5, '#4b6584');
        cyberGrad.addColorStop(1, '#2c3e50');

        ctx.fillStyle = cyberGrad;
        ctx.strokeStyle = '#1e272e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-22, -12, 28, 26, 4);
        ctx.fill();
        ctx.stroke();

        // Circuitos cibernéticos azuis luminosos na armadura
        ctx.strokeStyle = '#00d2d3';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-18, -4); ctx.lineTo(-8, -4); ctx.lineTo(-4, 4); ctx.lineTo(4, 4);
        ctx.stroke();

        // Micro-escapamento fumegante nas costas
        ctx.fillStyle = '#2f3542';
        ctx.fillRect(-16, -22, 6, 12);
        ctx.strokeStyle = '#1e272e';
        ctx.strokeRect(-16, -22, 6, 12);

        // Fumacinha saindo do escapamento
        ctx.fillStyle = 'rgba(200, 214, 229, 0.45)';
        const smokePulse = (this.animTime * 2) % 3;
        ctx.beginPath();
        ctx.arc(-13 - smokePulse * 4, -26 - smokePulse * 7, 3 + smokePulse * 2, 0, Math.PI * 2);
        ctx.fill();

        // 2. Mandíbula de Aço Cromado (Chrome Jaw)
        ctx.save();
        ctx.translate(22, -4);

        ctx.fillStyle = '#dfe4ea';
        ctx.strokeStyle = '#2f3542';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(0, 8, 22, 12, [2, 6, 6, 2]);
        ctx.fill();
        ctx.stroke();

        // Dentes de metal afiados
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(4 + i * 4, 6, 2.5, 4);
        }

        // Pistão hidráulico na bochecha
        ctx.fillStyle = '#747d8c';
        ctx.fillRect(-6, 2, 8, 5);
        ctx.fillStyle = '#f1f2f6';
        ctx.fillRect(0, 3, 6, 3);

        // 3. Meia-Placa Facial de Titânio (Estilo Exterminador)
        ctx.fillStyle = '#778ca3';
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(18, -18);
        ctx.lineTo(16, 2);
        ctx.lineTo(-2, 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Olho Laser Robótico Vermelho Cintilante
        const eyeX = 8;
        const eyeY = -8;
        const laserGlow = 0.7 + Math.sin(this.animTime * 4) * 0.3;

        ctx.fillStyle = `rgba(255, 71, 87, ${laserGlow})`;
        ctx.shadowColor = '#ff4757';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Ponto central super brilhante
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Linha de mira laser vermelha projetada para a frente
        ctx.strokeStyle = 'rgba(255, 71, 87, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(eyeX + 5, eyeY);
        ctx.lineTo(eyeX + 45, eyeY + Math.sin(this.animTime) * 3);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.restore();

        ctx.restore();
    }

    drawWarBoarArmor(ctx) {
        ctx.save();

        // 1. Peitoral e Coleira com Espinhos de Gladiador
        ctx.fillStyle = '#2f3542';
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-24, -14, 46, 30, 8);
        ctx.fill();
        ctx.stroke();

        // Espinhos de ferro pontiagudos saindo da couraça
        const drawSpike = (sx, sy, angle) => {
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(angle);
            ctx.fillStyle = '#ced6e0';
            ctx.strokeStyle = '#2f3542';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-3, 0);
            ctx.lineTo(0, -11);
            ctx.lineTo(3, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        };

        drawSpike(-16, -14, -0.4);
        drawSpike(-4, -15, 0);
        drawSpike(8, -14, 0.4);

        // 2. Capacete de Gladiador com Crista Vermelha
        ctx.save();
        ctx.translate(20, -12);

        // Placa frontal de ferro
        ctx.fillStyle = '#57606f';
        ctx.strokeStyle = '#1e272e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-12, -18);
        ctx.lineTo(14, -18);
        ctx.lineTo(16, 6);
        ctx.lineTo(-4, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Crista de cavalo de centurião romano (vermelha intensa)
        ctx.fillStyle = '#eb2f06';
        ctx.strokeStyle = '#b71540';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, -18);
        ctx.quadraticCurveTo(0, -36, 16, -18);
        ctx.lineTo(12, -14);
        ctx.quadraticCurveTo(0, -28, -12, -14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Textura de pelos na crista
        ctx.strokeStyle = '#ff6b81';
        ctx.lineWidth = 1.5;
        for (let i = -10; i <= 10; i += 4) {
            ctx.beginPath();
            ctx.moveTo(i, -18);
            ctx.lineTo(i * 1.1, -26);
            ctx.stroke();
        }

        // Pintura de guerra tribal vermelha nas bochechas
        ctx.fillStyle = 'rgba(235, 47, 6, 0.75)';
        ctx.fillRect(2, -2, 12, 3);
        ctx.fillRect(4, 3, 10, 3);

        // Pontas de aço laminado reforçando as presas
        ctx.fillStyle = '#f1f2f6';
        ctx.strokeStyle = '#2f3542';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(12, 10);
        ctx.lineTo(24, 2);
        ctx.lineTo(20, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
        ctx.restore();
    }

    drawArmorShieldBar(ctx, renderY) {
        const barWidth = 60 * this.scale;
        const barHeight = 6;
        const barX = this.x - barWidth / 2;
        const barY = renderY - 48 * this.scale;

        ctx.save();
        // Fundo escuro com borda metálica
        ctx.fillStyle = 'rgba(20, 25, 35, 0.85)';
        ctx.strokeStyle = '#747d8c';
        ctx.lineWidth = 1.5;
        ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        ctx.strokeRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

        if (this.armor > 0) {
            const armorRatio = Math.max(0, Math.min(1, this.armor / this.maxArmor));
            const barGrad = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
            barGrad.addColorStop(0, '#00d2d3');
            barGrad.addColorStop(0.5, '#54a0ff');
            barGrad.addColorStop(1, '#dfe4ea');

            ctx.fillStyle = barGrad;
            ctx.fillRect(barX, barY, barWidth * armorRatio, barHeight);

            // Ícone de escudo
            ctx.font = 'bold 9px sans-serif';
            ctx.fillText('🛡️', barX - 14, barY + 6);
        } else {
            // Armadura Quebrada
            ctx.fillStyle = '#ff4757';
            ctx.font = 'bold 8px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('💥 QUEBRADA', this.x, barY + 5);
        }
        ctx.restore();
    }
}

window.Pig = Pig;
window.PIG_TYPES = PIG_TYPES;
