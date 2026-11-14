// gun_render.js - Modelagem 2D do Cano das Armas em Perspectiva FPS Acompanhando a Mira

class GunRenderer {
    constructor(virtualWidth = 1280, virtualHeight = 720) {
        this.w = virtualWidth;
        this.h = virtualHeight;
        this.barrelSpin = 0;
        this.smokeParticles = [];
    }

    update(dt, isShootingMachineGun = false) {
        if (isShootingMachineGun) {
            this.barrelSpin += dt * 35;
        } else {
            this.barrelSpin += dt * 2;
        }

        // Fumaça saindo do cano
        for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
            const p = this.smokeParticles[i];
            p.life -= dt;
            if (p.life <= 0) {
                this.smokeParticles.splice(i, 1);
                continue;
            }
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.radius += dt * 18;
            p.alpha = Math.max(0, p.life / p.maxLife);
        }
    }

    addMuzzleSmoke(x, y, angle) {
        for (let i = 0; i < 4; i++) {
            this.smokeParticles.push({
                x,
                y,
                vx: Math.cos(angle) * (60 + Math.random() * 80) + (Math.random() - 0.5) * 30,
                vy: Math.sin(angle) * (60 + Math.random() * 80) - 25,
                radius: 6 + Math.random() * 8,
                alpha: 0.6,
                life: 0.6 + Math.random() * 0.4,
                maxLife: 0.8
            });
        }
    }

    draw(ctx, weaponKey, mouseX, mouseY, recoilAnim = 0, isReloading = false, reloadProgress = 1.0) {
        ctx.save();

        // Ponto de origem do cano (canto inferior direito / centro-direito da tela)
        const baseX = this.w * 0.58;
        let baseY = this.h + 8;

        // Efeito de recarga: a arma abaixa levemente e retorna
        if (isReloading) {
            const dip = Math.sin(reloadProgress * Math.PI) * 45;
            baseY += dip;
        }

        // Ângulo de mira em direção ao retículo
        let targetAngle = Math.atan2(mouseY - (baseY - 25), mouseX - baseX);
        // Limita o ângulo de rotação para manter naturalidade física
        targetAngle = Math.max(-Math.PI * 0.85, Math.min(-Math.PI * 0.15, targetAngle));

        // Efeito de coice / recuo do disparo (empurrão para trás proporcional ao tamanho reduzido)
        const kickback = recoilAnim * 16;
        const drawBaseX = baseX - Math.cos(targetAngle) * kickback;
        const drawBaseY = baseY - Math.sin(targetAngle) * kickback;

        // Armazena a ponta estimada do cano para emissão de fumaça e efeitos
        this.lastMuzzleTip = {
            x: drawBaseX + Math.cos(targetAngle) * 160,
            y: drawBaseY + Math.sin(targetAngle) * 160,
            angle: targetAngle
        };

        ctx.translate(drawBaseX, drawBaseY);
        ctx.rotate(targetAngle + Math.PI / 2); // alinha verticalmente para girar até a mira

        // Redução do cano das armas em 50%
        ctx.scale(0.5, 0.5);

        // Renderiza a arma específica equipada
        if (weaponKey === 'shotgun') {
            this.drawShotgun(ctx, recoilAnim);
        } else if (weaponKey === 'sniper') {
            this.drawSniperRifle(ctx, recoilAnim);
        } else if (weaponKey === 'machinegun') {
            this.drawVulcanMinigun(ctx, recoilAnim);
        } else if (weaponKey === 'launcher') {
            this.drawRocketLauncher(ctx, recoilAnim);
        }

        ctx.restore();

        // Desenha fumaça residual do cano
        this.drawSmoke(ctx);
    }

    // 1. ESPINGARDA CALIBRE 12 (Canos duplos de aço com telha de nogueira)
    drawShotgun(ctx, recoil) {
        ctx.save();
        // Telha / Guarda-mão de madeira de nogueira
        const woodGrad = ctx.createLinearGradient(-26, 0, 26, 0);
        woodGrad.addColorStop(0, '#5c2d13');
        woodGrad.addColorStop(0.5, '#8b4513');
        woodGrad.addColorStop(1, '#3e1d08');

        ctx.fillStyle = woodGrad;
        ctx.beginPath();
        ctx.roundRect(-24, -140, 48, 120, [8, 8, 4, 4]);
        ctx.fill();
        ctx.strokeStyle = '#230e04';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Textura da madeira
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-18, -120); ctx.lineTo(-18, -40);
        ctx.moveTo(18, -120); ctx.lineTo(18, -40);
        ctx.stroke();

        // Canos duplos cilíndricos paralelos
        const drawBarrel = (offsetX) => {
            const steelGrad = ctx.createLinearGradient(offsetX - 10, 0, offsetX + 10, 0);
            steelGrad.addColorStop(0, '#1e272e');
            steelGrad.addColorStop(0.35, '#747d8c');
            steelGrad.addColorStop(0.7, '#2f3542');
            steelGrad.addColorStop(1, '#0f1418');

            ctx.fillStyle = steelGrad;
            ctx.fillRect(offsetX - 9, -290, 18, 190);
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 2;
            ctx.strokeRect(offsetX - 9, -290, 18, 190);

            // Boca do cano escura
            ctx.fillStyle = '#0a0a0c';
            ctx.beginPath();
            ctx.ellipse(offsetX, -290, 8, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#57606f';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        };

        drawBarrel(-11);
        drawBarrel(11);

        // Fita de ventilação central (Ribbed bridge)
        ctx.fillStyle = '#2f3542';
        ctx.fillRect(-3, -285, 6, 175);

        // Mira de ponta (gota de latão dourado)
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(0, -289, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b7791f';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Muzzle Flash na boca ao disparar
        if (recoil > 0.6) {
            this.drawMuzzleFlash(ctx, 0, -305, 38);
        }

        ctx.restore();
    }

    // 2. RIFLE DE PRECISÃO SNIPER (Cano longo estriado, freio de boca e luneta)
    drawSniperRifle(ctx, recoil) {
        ctx.save();

        // Corpo / Receptor militar cinza fosco
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(-18, -120, 36, 120);
        ctx.strokeStyle = '#1a252f';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-18, -120, 36, 120);

        // Cano estriado de alta precisão
        const barrelGrad = ctx.createLinearGradient(-8, 0, 8, 0);
        barrelGrad.addColorStop(0, '#111827');
        barrelGrad.addColorStop(0.4, '#6b7280');
        barrelGrad.addColorStop(1, '#030712');

        ctx.fillStyle = barrelGrad;
        ctx.fillRect(-7, -350, 14, 240);
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 2;
        ctx.strokeRect(-7, -350, 14, 240);

        // Freio de boca tático (Muzzle Brake)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-12, -366, 24, 18);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-12, -366, 24, 18);

        // Fendas de alívio do freio de boca
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-10, -363, 5, 12);
        ctx.fillRect(5, -363, 5, 12);

        // Luneta Ótica montada no topo (Scope)
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-14, -180, 28, 70, 6);
        ctx.fill();
        ctx.strokeStyle = '#38ada9';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Lente reflexiva da luneta
        const lensGrad = ctx.createLinearGradient(-10, -180, 10, -180);
        lensGrad.addColorStop(0, '#0984e3');
        lensGrad.addColorStop(0.5, '#74b9ff');
        lensGrad.addColorStop(1, '#0984e3');
        ctx.fillStyle = lensGrad;
        ctx.beginPath();
        ctx.ellipse(0, -180, 11, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Destaque de flash do tiro
        if (recoil > 0.5) {
            this.drawMuzzleFlash(ctx, 0, -380, 42);
        }

        ctx.restore();
    }

    // 3. METRALHADORA VULCAN MINIGUN (Tambor giratório de 6 canos)
    drawVulcanMinigun(ctx, recoil) {
        ctx.save();

        // Carcaça circular do tambor
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(-28, -90, 56, 100);
        ctx.strokeStyle = '#1e272e';
        ctx.lineWidth = 3;
        ctx.strokeRect(-28, -90, 56, 100);

        // Anel de contenção dos canos rotativos
        ctx.fillStyle = '#636e72';
        ctx.beginPath();
        ctx.ellipse(0, -170, 26, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(0, -290, 24, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 6 canos giratórios estilo Gatling
        const barrelRadius = 16;
        for (let i = 0; i < 6; i++) {
            const angle = this.barrelSpin + (i * Math.PI / 3);
            const bx = Math.cos(angle) * barrelRadius;

            // Cada cano com gradiente cilíndrico
            ctx.fillStyle = '#1e272e';
            ctx.fillRect(bx - 4, -315, 8, 225);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(bx - 4, -315, 8, 225);

            // Boca de saída com calor incandescente
            ctx.fillStyle = recoil > 0.3 ? '#e67e22' : '#050505';
            ctx.beginPath();
            ctx.arc(bx, -315, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Eixo central
        ctx.fillStyle = '#0984e3';
        ctx.fillRect(-3, -318, 6, 228);

        // Flash e faíscas contínuas ao disparar
        if (recoil > 0.1) {
            this.drawMuzzleFlash(ctx, (Math.random() - 0.5) * 14, -325, 36);
        }

        ctx.restore();
    }

    // 4. SUPER BAZUCA RPG (Tubo verde militar e ogiva de foguete)
    drawRocketLauncher(ctx, recoil) {
        ctx.save();

        // Tubo de lançamento militar verde-oliva
        const tubeGrad = ctx.createLinearGradient(-25, 0, 25, 0);
        tubeGrad.addColorStop(0, '#2b472e');
        tubeGrad.addColorStop(0.4, '#4f774e');
        tubeGrad.addColorStop(1, '#1b2d1d');

        ctx.fillStyle = tubeGrad;
        ctx.fillRect(-22, -260, 44, 270);
        ctx.strokeStyle = '#132115';
        ctx.lineWidth = 3;
        ctx.strokeRect(-22, -260, 44, 270);

        // Faixa de advertência de perigo (Hazard stripes amarelo/preto)
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(-22, -180, 44, 18);
        ctx.fillStyle = '#111';
        for (let i = -20; i < 20; i += 10) {
            ctx.beginPath();
            ctx.moveTo(i, -180);
            ctx.lineTo(i + 6, -180);
            ctx.lineTo(i, -162);
            ctx.lineTo(i - 6, -162);
            ctx.closePath();
            ctx.fill();
        }

        // Anel de reforço da boca
        ctx.fillStyle = '#2f3542';
        ctx.fillRect(-25, -266, 50, 10);
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2;
        ctx.strokeRect(-25, -266, 50, 10);

        // Ogiva do Foguete pontiagudo saindo da boca da bazuca
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.moveTo(-16, -266);
        ctx.lineTo(0, -325); // ponta do míssil
        ctx.lineTo(16, -266);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#78150c';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Ponta dourada da ogiva
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.moveTo(-6, -305);
        ctx.lineTo(0, -325);
        ctx.lineTo(6, -305);
        ctx.closePath();
        ctx.fill();

        // Explosão de saída e fumaça pesada
        if (recoil > 0.4) {
            this.drawMuzzleFlash(ctx, 0, -345, 58);
        }

        ctx.restore();
    }

    // Flash luminoso de disparo com faíscas estelares
    drawMuzzleFlash(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);

        // Estrela incandescente amarela e alaranjada
        ctx.fillStyle = '#fff200';
        ctx.shadowColor = '#ff3838';
        ctx.shadowBlur = 24;

        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const outer = size * (i % 2 === 0 ? 1.0 : 0.4);
            const a = (i * Math.PI) / 4;
            const px = Math.cos(a) * outer;
            const py = Math.sin(a) * outer;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Núcleo branco puro
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawSmoke(ctx) {
        ctx.save();
        for (const p of this.smokeParticles) {
            ctx.fillStyle = `rgba(180, 180, 190, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

window.GunRenderer = GunRenderer;
