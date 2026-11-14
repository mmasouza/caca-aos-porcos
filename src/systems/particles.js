// particles.js - Sistema de Partículas, Textos Flutuantes e Efeitos Visuais

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.floatingTexts = [];
        this.shockwaves = [];
    }

    addBacon(x, y, count = 3) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 120 + Math.random() * 200;
            this.particles.push({
                type: 'bacon',
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 150, // impulso para cima
                gravity: 600,
                rotation: Math.random() * Math.PI,
                vRot: (Math.random() - 0.5) * 12,
                width: 22,
                height: 10,
                alpha: 1.0,
                life: 1.0,
                maxLife: 1.0
            });
        }
    }

    addChristmasTreats(x, y, count = 3) {
        const types = ['xmas_gift', 'candy_cane', 'gingerbread'];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 120 + Math.random() * 180;
            this.particles.push({
                type: types[i % types.length],
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 160,
                gravity: 550,
                rotation: Math.random() * Math.PI,
                vRot: (Math.random() - 0.5) * 14,
                size: 16,
                alpha: 1.0,
                life: 1.1,
                maxLife: 1.1
            });
        }
    }

    addBulletCasing(x, y) {
        this.particles.push({
            type: 'casing',
            x: x || 1150,
            y: y || 650,
            vx: -(130 + Math.random() * 120),
            vy: -(160 + Math.random() * 120),
            gravity: 850,
            rotation: Math.random() * Math.PI,
            vRot: (Math.random() - 0.5) * 25,
            width: 12,
            height: 5,
            alpha: 1.0,
            life: 0.9,
            maxLife: 0.9
        });
    }

    addSmoke(x, y, count = 6, color = 'rgba(200, 200, 200, 0.6)') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 70;
            this.particles.push({
                type: 'smoke',
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 30,
                radius: 12 + Math.random() * 15,
                growth: 24,
                color,
                alpha: 0.8,
                life: 0.6 + Math.random() * 0.4,
                maxLife: 0.8
            });
        }
    }

    addSparks(x, y, count = 10, color = '#ffeb3b') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 90 + Math.random() * 220;
            this.particles.push({
                type: 'spark',
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                gravity: 400,
                color,
                radius: 2 + Math.random() * 2.5,
                alpha: 1.0,
                life: 0.35 + Math.random() * 0.25,
                maxLife: 0.5
            });
        }
    }

    addShockwave(x, y, maxRadius = 120, color = 'rgba(255, 235, 59, 0.8)') {
        this.shockwaves.push({
            x,
            y,
            radius: 10,
            maxRadius,
            color,
            alpha: 1.0,
            speed: maxRadius * 3.5
        });
    }

    addFloatingText(text, x, y, options = {}) {
        this.floatingTexts.push({
            text,
            x,
            y,
            vy: options.vy || -70,
            color: options.color || '#fff',
            size: options.size || 22,
            stroke: options.stroke || '#000',
            alpha: 1.0,
            life: options.life || 1.1,
            maxLife: options.life || 1.1,
            scale: options.scale || 1.0
        });
    }

    update(dt) {
        // Atualiza partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            p.alpha = Math.max(0, p.life / p.maxLife);

            if (p.gravity) {
                p.vy += p.gravity * dt;
            }
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            if (p.type === 'bacon' || p.type === 'casing') {
                p.rotation += p.vRot * dt;
            } else if (p.type === 'smoke') {
                p.radius += p.growth * dt;
            }
        }

        // Atualiza shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.radius += sw.speed * dt;
            sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);
            if (sw.radius >= sw.maxRadius) {
                this.shockwaves.splice(i, 1);
            }
        }

        // Atualiza textos flutuantes
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.life -= dt;
            if (ft.life <= 0) {
                this.floatingTexts.splice(i, 1);
                continue;
            }
            ft.y += ft.vy * dt;
            ft.alpha = Math.max(0, ft.life / ft.maxLife);
        }
    }

    draw(ctx) {
        // Shockwaves
        for (const sw of this.shockwaves) {
            ctx.save();
            ctx.strokeStyle = sw.color;
            ctx.globalAlpha = sw.alpha;
            ctx.lineWidth = 4 * sw.alpha;
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Partículas
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = p.alpha;

            if (p.type === 'bacon') {
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                // Fatia de bacon ondulada
                ctx.fillStyle = '#b71540';
                ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
                ctx.fillStyle = '#f8c291';
                ctx.fillRect(-p.width / 2, -p.height / 6, p.width, p.height / 3);
                ctx.strokeStyle = '#6f1e51';
                ctx.lineWidth = 1;
                ctx.strokeRect(-p.width / 2, -p.height / 2, p.width, p.height);
            } else if (p.type === 'smoke') {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'spark') {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'casing') {
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillStyle = '#f1c40f';
                ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
                ctx.fillStyle = '#b7791f';
                ctx.fillRect(-p.width / 2, -p.height / 2, 3, p.height);
            } else if (p.type === 'xmas_gift') {
                // Caixa de presente natalina com fita dourada
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(-8, -8, 16, 16);
                ctx.strokeStyle = '#c0392b';
                ctx.lineWidth = 1;
                ctx.strokeRect(-8, -8, 16, 16);
                // Fita dourada
                ctx.fillStyle = '#ffd32a';
                ctx.fillRect(-2, -8, 4, 16);
                ctx.fillRect(-8, -2, 16, 4);
            } else if (p.type === 'candy_cane') {
                // Bengala doce de Natal
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#ffffff';
                ctx.beginPath();
                ctx.moveTo(0, 10); ctx.lineTo(0, -6);
                ctx.arc(-5, -6, 5, 0, Math.PI, true);
                ctx.stroke();
                ctx.lineWidth = 2.5;
                ctx.strokeStyle = '#e74c3c';
                ctx.setLineDash([4, 4]);
                ctx.stroke();
                ctx.setLineDash([]);
            } else if (p.type === 'gingerbread') {
                // Biscoito de gengibre estrelar
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillStyle = '#b7791f';
                ctx.beginPath();
                ctx.arc(0, 0, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#5d4037';
                ctx.lineWidth = 1;
                ctx.stroke();
                // Confeito branco
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(0, 0, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }

        // Textos flutuantes
        for (const ft of this.floatingTexts) {
            ctx.save();
            ctx.globalAlpha = ft.alpha;
            ctx.font = `bold ${Math.round(ft.size * ft.scale)}px 'Arial Black', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Contorno forte estilo arcade
            ctx.strokeStyle = ft.stroke;
            ctx.lineWidth = 5;
            ctx.strokeText(ft.text, ft.x, ft.y);

            // Preenchimento brilhante
            ctx.fillStyle = ft.color;
            ctx.fillText(ft.text, ft.x, ft.y);

            ctx.restore();
        }
    }

    clear() {
        this.particles = [];
        this.floatingTexts = [];
        this.shockwaves = [];
    }
}

window.ParticleSystem = ParticleSystem;
