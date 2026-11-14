// game.js - Loop Principal, Cenário da Fazenda, Lógica de Ondas e Combate

class PigHunterGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Resolução interna fixa de 1280x720 (proporção 16:9 cinematográfica)
        this.virtualWidth = 1280;
        this.virtualHeight = 720;

        this.scaleRatio = 1;
        this.canvasRect = null;

        // Sistemas
        this.weapons = new WeaponSystem();
        this.particles = new ParticleSystem();
        this.env = new EnvironmentManager(this.virtualWidth, this.virtualHeight);
        this.gunRenderer = new GunRenderer(this.virtualWidth, this.virtualHeight);
        this.sniperScope = new SniperScopeSystem(this.virtualWidth, this.virtualHeight);
        this.pigs = [];
        this.horizonPigs = [];
        this.horizonSpawnTimer = 4.0;

        // Modo Natalino
        this.isChristmasMode = localStorage.getItem('pig_christmas_mode') !== 'false';
        if (this.isChristmasMode && window.SCENARIO_THEMES && window.SCENARIO_THEMES.XMAS) {
            this.env.currentThemeKey = 'XMAS';
            this.env.theme = window.SCENARIO_THEMES.XMAS;
        }

        // Customização de Miras
        this.crosshairStyle = localStorage.getItem('pig_crosshair_style') || 'weapon';
        this.crosshairColor = localStorage.getItem('pig_crosshair_color') || '#2ed573';

        // Estado do Jogo
        this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER', 'SHOP'
        this.gameMode = 'DEFENSE'; // 'DEFENSE' ou 'ARCADE'

        this.score = 0;
        this.highScoreDefense = parseInt(localStorage.getItem('pig_hunter_high_defense') || '0', 10);
        this.highScoreArcade = parseInt(localStorage.getItem('pig_hunter_high_arcade') || '0', 10);
        this.coins = parseInt(localStorage.getItem('pig_hunter_coins') || '0', 10);

        // Modo Defesa
        this.wave = 1;
        this.lives = 3;
        this.maxLives = 3;
        this.wavePigsRemaining = 0;
        this.wavePigsSpawned = 0;
        this.waveTotalPigs = 10;
        this.waveSpawnTimer = 0;
        this.waveBreakTimer = 0;
        this.isWaveBreak = false;

        // Modo Arcade
        this.arcadeTimer = 90.0;

        // Multiplicador de Combo
        this.combo = 1;
        this.comboTimer = 0;
        this.maxComboTime = 2.4;

        // Febre do Bacon (Frenzy)
        this.frenzyTimer = 0;

        // Estatísticas
        this.stats = {
            pigsKilled: 0,
            headshots: 0,
            shotsFired: 0,
            shotsHit: 0,
            bossesKilled: 0
        };

        // Mira e Entrada
        this.mouseX = this.virtualWidth / 2;
        this.mouseY = this.virtualHeight / 2;
        this.isMouseDown = false;
        this.shakeAmount = 0;
        this.lastTime = performance.now();

        // Elementos do Cenário
        this.windmillAngle = 0;
        this.clouds = [
            { x: 100, y: 80, speed: 12, scale: 1.2 },
            { x: 450, y: 120, speed: 8, scale: 0.9 },
            { x: 800, y: 70, speed: 15, scale: 1.4 },
            { x: 1100, y: 130, speed: 10, scale: 1.0 }
        ];

        this.initCanvas();
        this.initEventListeners();
        this.updateHUD();

        // Inicia loop de animação
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    initCanvas() {
        const resize = () => {
            const container = document.getElementById('game-container') || document.body;
            const cWidth = container.clientWidth || window.innerWidth;
            const cHeight = container.clientHeight || window.innerHeight;

            // Proporção de tela widescreen dinâmica (16:9, 19.5:9, 20:9, 21:9)
            const aspect = cWidth / cHeight;

            // Altura virtual padrão: 720p (mantém escala visual e física de jogo consistente)
            if (aspect >= 1.0) {
                this.virtualHeight = 720;
                // Expande a largura para preencher 100% da tela widescreen sem barras pretas laterais
                this.virtualWidth = Math.max(1280, Math.round(720 * Math.max(16 / 9, aspect)));
            } else {
                // Modo retrato (caso dispensado o alerta de giro)
                this.virtualWidth = 1280;
                this.virtualHeight = Math.round(1280 / aspect);
            }

            this.canvas.width = this.virtualWidth;
            this.canvas.height = this.virtualHeight;

            // Canvas ocupa 100% da tela útil de ponta a ponta
            this.canvas.style.width = '100vw';
            this.canvas.style.height = '100dvh';

            this.canvasRect = this.canvas.getBoundingClientRect();

            // Atualiza subsistemas com a nova resolução widescreen dinâmica
            if (this.env) {
                if (typeof this.env.resize === 'function') {
                    this.env.resize(this.virtualWidth, this.virtualHeight);
                } else {
                    this.env.w = this.virtualWidth;
                    this.env.h = this.virtualHeight;
                }
            }
            if (this.gunRenderer) {
                this.gunRenderer.w = this.virtualWidth;
                this.gunRenderer.h = this.virtualHeight;
            }
            if (this.sniperScope) {
                this.sniperScope.w = this.virtualWidth;
                this.sniperScope.h = this.virtualHeight;
            }
        };

        window.addEventListener('resize', resize);
        window.addEventListener('orientationchange', resize);
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', resize);
        }
        resize();
    }

    initEventListeners() {
        const getCanvasCoords = (e) => {
            this.canvasRect = this.canvas.getBoundingClientRect();
            let clientX = this.mouseX;
            let clientY = this.mouseY;
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else if (e.clientX !== undefined) {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            const rectW = this.canvasRect.width || window.innerWidth;
            const rectH = this.canvasRect.height || window.innerHeight;
            return {
                x: (clientX - this.canvasRect.left) * (this.virtualWidth / rectW),
                y: (clientY - this.canvasRect.top) * (this.virtualHeight / rectH)
            };
        };

        // Movimento do Mouse / Toque
        const onMove = (e) => {
            const coords = getCanvasCoords(e);
            this.mouseX = Math.max(0, Math.min(this.virtualWidth, coords.x));
            this.mouseY = Math.max(0, Math.min(this.virtualHeight, coords.y));
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('touchmove', onMove, { passive: false });

        // Disparo ao pressionar
        const onDown = (e) => {
            if (this.state !== 'PLAYING') return;
            const coords = getCanvasCoords(e);
            this.mouseX = coords.x;
            this.mouseY = coords.y;
            this.isMouseDown = true;
            this.performShot();
        };

        this.canvas.addEventListener('mousedown', onDown);
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            onDown(e);
        }, { passive: false });

        const onUp = () => {
            this.isMouseDown = false;
        };
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchend', onUp);

        // Botão direito do mouse para alternar luneta sniper ou recarregar
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (this.state === 'PLAYING') {
                if (this.weapons.currentKey === 'sniper') {
                    const scoping = this.sniperScope.toggle();
                    this.particles.addFloatingText(scoping ? 'LUNETA ATIVADA [4X] 🔭' : 'VISÃO ABERTA 👁️', this.mouseX, this.mouseY - 35, {
                        size: 16,
                        color: '#2ed573',
                        life: 0.6
                    });
                } else {
                    this.weapons.startReload();
                    this.updateHUD();
                }
            }
        });

        // Teclado
        window.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            const key = e.key.toLowerCase();

            if (this.state === 'PLAYING') {
                if (key === '1') this.selectWeapon('shotgun');
                else if (key === '2') this.selectWeapon('sniper');
                else if (key === '3') this.selectWeapon('machinegun');
                else if (key === '4') this.selectWeapon('launcher');
                else if (key === 'r' || key === ' ') {
                    e.preventDefault();
                    this.weapons.startReload();
                } else if (key === 'q' || key === 'shift') {
                    if (this.weapons.currentKey === 'sniper') {
                        const scoping = this.sniperScope.toggle();
                        this.particles.addFloatingText(scoping ? 'LUNETA [4X] 🔭' : 'VISÃO ABERTA 👁️', this.mouseX, this.mouseY - 35, {
                            size: 16,
                            color: '#2ed573',
                            life: 0.6
                        });
                    }
                } else if (key === 'v') {
                    this.cycleCrosshairStyle();
                } else if (key === 'escape' || key === 'p') {
                    this.togglePause();
                }
            } else if (this.state === 'PAUSED') {
                if (key === 'escape' || key === 'p') {
                    this.togglePause();
                }
            }

            if (key === 'm') {
                this.toggleSound();
            } else if (key === 'n') {
                this.toggleChristmasMode();
            } else if (key === 'c') {
                // Código secreto de moedas
                this.coins += 500;
                localStorage.setItem('pig_hunter_coins', this.coins.toString());
                window.sounds.playCoin();
                this.particles.addFloatingText('+500 MOEDAS BÔNUS! 🪙', this.virtualWidth / 2, this.virtualHeight / 2 - 50, {
                    size: 28,
                    color: '#ffd32a',
                    stroke: '#2c3e50',
                    life: 1.5
                });
                this.updateHUD();
            }
        });

        // Inicializa Controles e Gestos Touch Mobile
        this.initMobileControls();
    }

    initMobileControls() {
        this.isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 900;
        this.showMobileControls = this.isMobile;

        const updateMobileUI = () => {
            document.body.classList.toggle('mobile-ui-active', this.showMobileControls);
            const toggleMobileBtn = document.getElementById('btn-toggle-mobile');
            if (toggleMobileBtn) {
                toggleMobileBtn.classList.toggle('active', this.showMobileControls);
            }
        };

        updateMobileUI();

        // 1. Botão de Disparo / Gatilho Gigante
        const fireBtn = document.getElementById('btn-mobile-fire');
        if (fireBtn) {
            const handleFire = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.state !== 'PLAYING') return;
                if (navigator.vibrate) navigator.vibrate(30);
                this.performShot();
            };
            fireBtn.addEventListener('touchstart', handleFire, { passive: false });
            fireBtn.addEventListener('mousedown', handleFire);
        }

        // 2. Botão de Recarregar
        const reloadBtn = document.getElementById('btn-mobile-reload');
        if (reloadBtn) {
            const handleReload = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (navigator.vibrate) navigator.vibrate(20);
                this.weapons.startReload();
                this.updateHUD();
            };
            reloadBtn.addEventListener('touchstart', handleReload, { passive: false });
            reloadBtn.addEventListener('click', handleReload);
        }

        // 3. Botão de Luneta / Zoom Sniper
        const scopeBtn = document.getElementById('btn-mobile-scope');
        if (scopeBtn) {
            const handleScope = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.weapons.currentKey !== 'sniper') {
                    this.selectWeapon('sniper');
                }
                const scoping = this.sniperScope.toggle();
                scopeBtn.classList.toggle('active', scoping);
                if (navigator.vibrate) navigator.vibrate(35);
                this.particles.addFloatingText(scoping ? 'LUNETA ATIVADA [4X] 🔭' : 'VISÃO ABERTA 👁️', this.mouseX, this.mouseY - 35, {
                    size: 16,
                    color: '#2ed573',
                    life: 0.7
                });
            };
            scopeBtn.addEventListener('touchstart', handleScope, { passive: false });
            scopeBtn.addEventListener('click', handleScope);
        }

        // 4. Botão de Tela Cheia (Fullscreen com trava em paisagem)
        const fullscreenBtn = document.getElementById('btn-fullscreen');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', async () => {
                if (!document.fullscreenElement) {
                    const docEl = document.documentElement;
                    const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
                    if (req) {
                        try {
                            await req.call(docEl);
                            if (screen.orientation && screen.orientation.lock) {
                                await screen.orientation.lock('landscape').catch(() => {});
                            }
                        } catch (e) {}
                    }
                    fullscreenBtn.innerText = '⛶ Sair';
                } else {
                    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
                    if (exit) exit.call(document).catch(() => {});
                    fullscreenBtn.innerText = '⛶ Tela Cheia';
                }
            });
        }

        // 5. Botão de Alternar Controles Mobile no HUD
        const toggleMobileBtn = document.getElementById('btn-toggle-mobile');
        if (toggleMobileBtn) {
            toggleMobileBtn.addEventListener('click', () => {
                this.showMobileControls = !this.showMobileControls;
                updateMobileUI();
                this.particles.addFloatingText(this.showMobileControls ? 'CONTROLES MOBILE ATIVADOS 📱' : 'MODO DESKTOP ATIVADO 💻', this.mouseX, this.mouseY - 45, {
                    size: 16,
                    color: '#ffd32a',
                    life: 0.8
                });
            });
        }

        // 6. Alerta de Orientação de Tela (Retrato / Paisagem)
        this.checkOrientation();
        window.addEventListener('resize', () => this.checkOrientation());
        window.addEventListener('orientationchange', () => this.checkOrientation());

        const dismissBtn = document.getElementById('btn-dismiss-orientation');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                const orientAlert = document.getElementById('orientation-alert');
                if (orientAlert) orientAlert.classList.add('hidden');
            });
        }

        const forceLandscapeBtn = document.getElementById('btn-force-landscape');
        if (forceLandscapeBtn) {
            forceLandscapeBtn.addEventListener('click', async () => {
                const docEl = document.documentElement;
                const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
                if (req) {
                    try {
                        await req.call(docEl);
                        if (screen.orientation && screen.orientation.lock) {
                            await screen.orientation.lock('landscape').catch(() => {});
                        }
                    } catch (e) {}
                }
                const orientAlert = document.getElementById('orientation-alert');
                if (orientAlert) orientAlert.classList.add('hidden');
            });
        }
    }

    checkOrientation() {
        const orientAlert = document.getElementById('orientation-alert');
        if (!orientAlert) return;
        const isPortrait = window.innerHeight > window.innerWidth && (this.isMobile || window.innerWidth <= 768);
        if (isPortrait) {
            orientAlert.classList.remove('hidden');
        } else {
            orientAlert.classList.add('hidden');
        }
    }

    startNewGame(mode = 'DEFENSE') {
        this.gameMode = mode;
        this.state = 'PLAYING';
        this.score = 0;
        this.combo = 1;
        this.comboTimer = 0;
        this.frenzyTimer = 0;
        this.lives = this.maxLives;
        this.wave = 1;
        this.arcadeTimer = 90.0;
        this.pigs = [];
        this.horizonPigs = [];
        this.horizonSpawnTimer = 3.5;
        this.sniperScope.setScoping(false);
        this.particles.clear();
        this.weapons.refillAllAmmo();

        this.stats = {
            pigsKilled: 0,
            headshots: 0,
            shotsFired: 0,
            shotsHit: 0,
            bossesKilled: 0
        };

        if (this.isChristmasMode && window.SCENARIO_THEMES && window.SCENARIO_THEMES.XMAS) {
            this.env.currentThemeKey = 'XMAS';
            this.env.theme = window.SCENARIO_THEMES.XMAS;
            this.particles.addFloatingText(`🎄 EDIÇÃO ESPECIAL DE NATAL 🎅`, this.virtualWidth / 2, 130, {
                size: 26,
                color: '#2ed573',
                stroke: '#1e272e',
                life: 2.5
            });
            setTimeout(() => { if (window.sounds) window.sounds.playJingleBells(); }, 200);
        } else if (this.gameMode === 'ARCADE') {
            const themeInfo = this.env.setThemeByArcadeTime(90, 90);
            this.particles.addFloatingText(`${themeInfo.theme.icon} MODO ARCADE: ${themeInfo.theme.name.toUpperCase()}`, this.virtualWidth / 2, 130, {
                size: 24,
                color: '#fff200',
                stroke: '#1e272e',
                life: 2.2
            });
        } else {
            this.setupWave(this.wave);
        }

        window.sounds.init();
        window.sounds.startBGM();

        this.hideAllModals();
        this.updateHUD();
        this.particles.addFloatingText('PREPARE-SE! VEM PORCO AÍ!', this.virtualWidth / 2, this.virtualHeight / 2 - 80, {
            size: 38,
            color: '#ffeaa7',
            stroke: '#d63031',
            life: 2.0
        });
    }

    toggleChristmasMode() {
        this.isChristmasMode = !this.isChristmasMode;
        localStorage.setItem('pig_christmas_mode', this.isChristmasMode ? 'true' : 'false');

        const btn = document.getElementById('btn-toggle-xmas');
        if (btn) {
            btn.classList.toggle('active', this.isChristmasMode);
        }

        if (this.isChristmasMode) {
            this.env.currentThemeKey = 'XMAS';
            this.env.theme = window.SCENARIO_THEMES.XMAS;
            if (window.sounds) {
                window.sounds.playJingleBells();
            }
            this.particles.addFloatingText('🎅 FELIZ NATAL! TEMA NATALINO ATIVADO! 🎄🎁', this.virtualWidth / 2, 140, {
                size: 26,
                color: '#2ed573',
                stroke: '#1e272e',
                life: 2.4
            });
        } else {
            this.env.setThemeByWave(this.wave);
            this.particles.addFloatingText('🌾 TEMA CLÁSSICO RESTAURADO', this.virtualWidth / 2, 140, {
                size: 22,
                color: '#ffeaa7',
                stroke: '#1e272e',
                life: 1.5
            });
        }
    }

    setupWave(waveNum) {
        this.wave = waveNum;
        this.isWaveBreak = false;
        this.wavePigsSpawned = 0;
        this.waveTotalPigs = 8 + waveNum * 4;
        this.wavePigsRemaining = this.waveTotalPigs;
        this.waveSpawnTimer = 0.5;

        // Se for onda de chefe (múltiplo de 5)
        this.hasBossThisWave = (waveNum % 5 === 0);
        if (this.hasBossThisWave) {
            this.waveTotalPigs += 1;
            this.wavePigsRemaining += 1;
        }

        // Atualiza cenário e clima da fase
        if (this.isChristmasMode && window.SCENARIO_THEMES && window.SCENARIO_THEMES.XMAS) {
            this.env.currentThemeKey = 'XMAS';
            this.env.theme = window.SCENARIO_THEMES.XMAS;
        } else {
            const themeInfo = this.env.setThemeByWave(waveNum);
            this.particles.addFloatingText(`${themeInfo.theme.icon} ${themeInfo.theme.name.toUpperCase()}`, this.virtualWidth / 2, 130, {
                size: 26,
                color: '#fff200',
                stroke: '#1e272e',
                life: 2.2
            });
        }

        this.updateHUD();
    }

    selectWeapon(key) {
        if (this.weapons.selectWeapon(key)) {
            if (key !== 'sniper') {
                this.sniperScope.setScoping(false);
            }
            this.updateHUD();
            this.particles.addFloatingText(this.weapons.current.name.toUpperCase(), this.mouseX, this.mouseY - 45, {
                size: 18,
                color: '#ffeaa7',
                life: 0.8
            });
        }
    }

    performShot() {
        if (this.state !== 'PLAYING') return;

        const isFrenzy = this.frenzyTimer > 0;
        const result = this.weapons.triggerShot(isFrenzy);

        if (!result.fired) {
            const now = Date.now();
            if (now - (this.lastReloadWarn || 0) > 700) {
                this.lastReloadWarn = now;
                if (result.reason === 'reloading') {
                    this.particles.addFloatingText('RECARREGANDO... ⏳', this.mouseX, this.mouseY - 35, {
                        size: 16,
                        color: '#ff7675',
                        life: 0.5
                    });
                } else if (result.reason === 'empty') {
                    this.particles.addFloatingText('RECARREGANDO! [R]', this.mouseX, this.mouseY - 35, {
                        size: 18,
                        color: '#e74c3c',
                        life: 0.6
                    });
                }
            }
            this.updateHUD();
            return;
        }

        // Estatística de disparo
        this.stats.shotsFired++;
        this.shakeAmount = Math.max(this.shakeAmount, result.recoilShake);

        // Flash e faíscas da ponta do cano / ponto da mira
        this.particles.addSparks(this.mouseX, this.mouseY, 8, '#ffeb3b');
        this.particles.addSmoke(this.mouseX, this.mouseY, 3, 'rgba(230, 230, 230, 0.4)');

        // Fumaça saindo da ponta do cano na direção do disparo
        if (this.gunRenderer.lastMuzzleTip) {
            this.gunRenderer.addMuzzleSmoke(this.gunRenderer.lastMuzzleTip.x, this.gunRenderer.lastMuzzleTip.y, this.gunRenderer.lastMuzzleTip.angle);
        } else {
            const baseX = this.virtualWidth * 0.58;
            const baseY = this.virtualHeight + 8;
            const shotAngle = Math.atan2(this.mouseY - (baseY - 25), this.mouseX - baseX);
            this.gunRenderer.addMuzzleSmoke(this.mouseX, this.mouseY, shotAngle);
        }

        if (this.weapons.currentKey === 'machinegun') {
            this.particles.addBulletCasing(1180, 650);
            this.particles.addSparks(this.mouseX, this.mouseY, 12, '#ff9f43');
        } else if (this.weapons.currentKey === 'sniper' && this.sniperScope.isScoping) {
            this.particles.addShockwave(this.mouseX, this.mouseY, 45, '#2ed573');
            this.particles.addSparks(this.mouseX, this.mouseY, 14, '#00ffcc');
        }

        let hitAnyPig = false;

        // Checagem de acerto em Segredos e Easter Eggs no Cenário
        const secretCheck = this.env.checkSecretHit(this.mouseX, this.mouseY, this.weapons.currentKey, this.sniperScope.isScoping);
        if (secretCheck.hit) {
            hitAnyPig = true;
            this.stats.shotsHit++;
            this.addScore(secretCheck.points, this.mouseX, this.mouseY - 30, secretCheck.title);

            if (secretCheck.coins) {
                this.coins += secretCheck.coins;
                localStorage.setItem('pig_hunter_coins', this.coins.toString());
                this.particles.addFloatingText(`+${secretCheck.coins} 🪙`, this.mouseX, this.mouseY - 60, {
                    size: 24,
                    color: '#fed330',
                    stroke: '#1e272e',
                    life: 1.3
                });
            }

            if (secretCheck.dropGifts) {
                if (this.particles.addChristmasTreats) {
                    this.particles.addChristmasTreats(this.mouseX, this.mouseY, 14);
                }
                this.particles.addSparks(this.mouseX, this.mouseY, 20, '#ffd32a');
                this.particles.addShockwave(this.mouseX, this.mouseY, 65, '#ff4757');
            } else if (secretCheck.secret === 'MOON') {
                this.particles.addShockwave(this.mouseX, this.mouseY, 50, '#ffeaa7');
                this.particles.addSparks(this.mouseX, this.mouseY, 16, '#fffa65');
                this.shakeAmount = 14;
            } else if (secretCheck.secret === 'ROOSTER') {
                this.particles.addSparks(this.mouseX, this.mouseY, 14, '#f39c12');
                this.particles.addShockwave(this.mouseX, this.mouseY, 35, '#d35400');
            } else if (secretCheck.secret === 'SNOWMAN') {
                this.particles.addSparks(this.mouseX, this.mouseY, 14, '#ffffff');
                this.particles.addShockwave(this.mouseX, this.mouseY, 35, '#00d2d3');
            }
        }

        // Checagem de acerto em Porcos e Javalis no Horizonte (Alta recompensa / Sniper)
        for (let i = this.horizonPigs.length - 1; i >= 0; i--) {
            const hpig = this.horizonPigs[i];
            const check = hpig.checkHit(this.mouseX, this.mouseY, result.radius, this.sniperScope.isScoping);
            if (check.hit) {
                hitAnyPig = true;
                if (check.killed) {
                    this.onHorizonPigKilled(hpig);
                } else {
                    window.sounds.playPigHit();
                    this.particles.addSparks(hpig.x, hpig.baseY, 10, '#ff4757');
                    this.particles.addFloatingText(`💥 HP: ${hpig.hp}/${hpig.maxHp}`, hpig.x, hpig.baseY - 30, {
                        size: 15,
                        color: '#ff4757',
                        life: 0.7
                    });
                }
                break;
            }
        }

        // Se for arma explosiva (Super Bazuca RPG)
        if (this.weapons.currentKey === 'launcher') {
            this.particles.addShockwave(this.mouseX, this.mouseY, result.radius * 1.3, '#ff3838');
            this.particles.addShockwave(this.mouseX, this.mouseY, result.radius * 0.8, '#ff9f43');
            this.particles.addShockwave(this.mouseX, this.mouseY, result.radius * 0.4, '#fff200');
            this.particles.addSmoke(this.mouseX, this.mouseY, 14, 'rgba(80, 80, 80, 0.7)');
            this.particles.addSparks(this.mouseX, this.mouseY, 25, '#ff4757');
            this.particles.addFloatingText('🚀 KABOOOOOM! 💥', this.mouseX, this.mouseY - 70, {
                size: 34,
                color: '#ff3838',
                stroke: '#ffffff',
                life: 1.3
            });
            window.sounds.playExplosion();
            this.shakeAmount = 35;

            for (const pig of this.pigs) {
                if (pig.isDead || pig.escaped) continue;
                const dist = Math.hypot(pig.x - this.mouseX, (pig.currentY || pig.y) - this.mouseY);
                if (dist <= result.radius) {
                    hitAnyPig = true;
                    this.applyDamageToPig(pig, result.damage, false, 1.0);
                }
            }
        } else {
            // Tiro padrão (Espingarda, Rifle, Tommy)
            // Ordena por prioridade de clique mais próximo da mira
            let targets = [];

            for (const pig of this.pigs) {
                if (pig.isDead || pig.escaped) continue;
                const check = pig.checkHit(this.mouseX, this.mouseY, result.radius);
                if (check.hit) {
                    targets.push({ pig, check });
                }
            }

            // Espingarda atinge múltiplos alvos próximos; Rifle e Tommy atingem o mais próximo
            if (this.weapons.currentKey === 'shotgun') {
                for (const t of targets) {
                    hitAnyPig = true;
                    if (t.check.balloonPop) {
                        this.popFlyingPig(t.pig);
                    } else {
                        this.applyDamageToPig(t.pig, result.damage, t.check.isHeadshot, result.headshotMult);
                    }
                }
            } else if (targets.length > 0) {
                hitAnyPig = true;
                // Alvo mais próximo
                targets.sort((a, b) => (a.check.distance || 0) - (b.check.distance || 0));
                const target = targets[0];
                if (target.check.balloonPop) {
                    this.popFlyingPig(target.pig);
                } else {
                    this.applyDamageToPig(target.pig, result.damage, target.check.isHeadshot, result.headshotMult);
                }
            }
        }

        if (hitAnyPig) {
            this.stats.shotsHit++;
            this.addCombo();
        } else {
            // Tiro na água ou no chão
            this.particles.addSparks(this.mouseX, this.mouseY, 4, '#bdc581');
        }

        this.updateHUD();
    }

    popFlyingPig(pig) {
        window.sounds.playPigHit();
        this.particles.addShockwave(pig.x, pig.y - 45 * pig.scale, 50, pig.balloonColor);
        this.particles.addSparks(pig.x, pig.y - 45 * pig.scale, 12, pig.balloonColor);
        this.addScore(50, pig.x, pig.y - 45, 'POW! BALÃO ESTOURADO!');
    }

    applyDamageToPig(pig, damage, isHeadshot, headMult) {
        const hadArmor = (pig.armor || 0) > 0;
        const wasKilled = pig.takeDamage(damage, isHeadshot, headMult, this.weapons.currentKey);

        if (isHeadshot) {
            this.stats.headshots++;
            this.particles.addFloatingText('🎯 TIRO NA CABEÇA!', pig.x, (pig.currentY || pig.y) - 50, {
                size: 20,
                color: '#ff9f43',
                stroke: '#000',
                life: 0.9
            });
        }

        // Feedback de armadura metálica e ricochete
        if (hadArmor) {
            this.particles.addSparks(pig.x, (pig.currentY || pig.y), 12, '#00d2d3');
            this.particles.addSparks(pig.x, (pig.currentY || pig.y) - 15, 8, '#dfe4ea');

            if (pig.armorBroken && !pig.armorNotified) {
                pig.armorNotified = true;
                this.particles.addFloatingText('🛡️ ARMADURA DESTRUÍDA!', pig.x, (pig.currentY || pig.y) - 65, {
                    size: 20,
                    color: '#00d2d3',
                    stroke: '#1e272e',
                    life: 1.2
                });
                this.particles.addShockwave(pig.x, (pig.currentY || pig.y), 50, '#54a0ff');
            }
        }

        if (wasKilled) {
            this.onPigKilled(pig, isHeadshot);
        } else {
            window.sounds.playPigHit();
            this.particles.addSparks(pig.x, (pig.currentY || pig.y), 6, '#ff6b6b');
        }
    }

    onPigKilled(pig, isHeadshot) {
        this.stats.pigsKilled++;
        this.wavePigsRemaining = Math.max(0, this.wavePigsRemaining - 1);

        window.sounds.playPigOink();

        // Efeitos de eliminação
        const px = pig.x;
        const py = pig.currentY || pig.y;

        // Fatias cômicas de bacon voando!
        this.particles.addBacon(px, py, pig.type.id === 'BOSS' ? 12 : 3);
        this.particles.addSmoke(px, py, 6, 'rgba(255, 200, 200, 0.6)');
        this.particles.addSparks(px, py, 14, '#ff9ff3');

        // Se for TNT, gera explosão em cadeia
        if (pig.type.id === 'TNT') {
            this.triggerTntChain(px, py);
        }

        // Se for Porco Dourado, ativa febre do bacon
        if (pig.type.id === 'GOLDEN') {
            this.activateFrenzy();
        }

        // Se for Boss derrotado
        if (pig.type.id === 'BOSS') {
            this.stats.bossesKilled++;
            window.sounds.playExplosion();
            this.shakeAmount = 25;
            this.particles.addShockwave(px, py, 260, '#feca57');
        }

        // Pontuação e Moedas
        const basePoints = pig.type.points;
        const finalPoints = Math.round(basePoints * (isHeadshot ? 1.5 : 1.0) * this.combo * (this.frenzyTimer > 0 ? 2 : 1));
        const coinReward = Math.max(5, Math.round((basePoints / 10) * (isHeadshot ? 2 : 1) * (this.frenzyTimer > 0 ? 2 : 1)));

        this.coins += coinReward;
        localStorage.setItem('pig_hunter_coins', this.coins.toString());

        let label = `+${finalPoints}`;
        if (this.combo > 1) label += ` (x${this.combo})`;
        this.addScore(finalPoints, px, py - 20, label);

        window.sounds.playCoin();
    }

    triggerTntChain(x, y) {
        window.sounds.playExplosion();
        this.shakeAmount = 18;
        this.particles.addShockwave(x, y, 170, 'rgba(255, 71, 87, 0.9)');
        this.particles.addFloatingText('💥 DETONAÇÃO EM CADEIA!', x, y - 60, {
            size: 24,
            color: '#ff4757',
            stroke: '#2f3542',
            life: 1.2
        });

        // Danifica outros porcos no raio
        for (const other of this.pigs) {
            if (other.isDead || other.escaped) continue;
            const dist = Math.hypot(other.x - x, (other.currentY || other.y) - y);
            if (dist <= 170) {
                this.applyDamageToPig(other, 250, false, 1.0);
            }
        }
    }

    activateFrenzy() {
        this.frenzyTimer = 6.0;
        window.sounds.playFrenzy();
        this.particles.addFloatingText('🥓 FEBRE DO BACON ATIVADA! 🥓', this.virtualWidth / 2, 200, {
            size: 34,
            color: '#ffd32a',
            stroke: '#d63031',
            life: 2.2
        });
        this.particles.addShockwave(this.virtualWidth / 2, this.virtualHeight / 2, 350, '#ffc048');
    }

    addScore(points, x, y, label) {
        this.score += points;

        if (this.gameMode === 'DEFENSE' && this.score > this.highScoreDefense) {
            this.highScoreDefense = this.score;
            localStorage.setItem('pig_hunter_high_defense', this.highScoreDefense.toString());
        } else if (this.gameMode === 'ARCADE' && this.score > this.highScoreArcade) {
            this.highScoreArcade = this.score;
            localStorage.setItem('pig_hunter_high_arcade', this.highScoreArcade.toString());
        }

        if (x && y) {
            this.particles.addFloatingText(label || `+${points}`, x, y, {
                size: 22,
                color: '#fff200',
                stroke: '#333'
            });
        }
    }

    addCombo() {
        this.combo = Math.min(10, this.combo + 1);
        this.comboTimer = this.maxComboTime;

        if (this.combo >= 3) {
            this.particles.addFloatingText(`COMBO x${this.combo}! 🔥`, this.mouseX, this.mouseY - 70, {
                size: 22,
                color: '#ff3838',
                stroke: '#fff',
                life: 0.8
            });
        }
    }

    spawnPig() {
        const effectiveLevel = this.gameMode === 'ARCADE'
            ? Math.floor((90 - this.arcadeTimer) / 12) + 1
            : this.wave;
        const wave = this.wave;
        let type = 'CLASSIC';

        const rand = Math.random();

        // Probabilidade de tipos de porcos conforme onda / nível
        if (this.hasBossThisWave && this.wavePigsSpawned === 0) {
            type = 'BOSS';
        } else if (Math.random() < 0.08) {
            type = 'GOLDEN';
        } else if (effectiveLevel >= 4 && rand < 0.16) {
            type = 'CYBORG'; // Porco Mecha-Ciborgue com olho laser e titânio
        } else if (effectiveLevel >= 3 && rand < 0.32) {
            type = 'WAR_BOAR'; // Javali Gladiador com armadura de espinhos
        } else if (effectiveLevel >= 2 && rand < 0.48) {
            type = 'ARMORED'; // Porco Cavaleiro com elmo de balde de ferro
        } else if (effectiveLevel >= 3 && rand < 0.60) {
            type = 'TNT';
        } else if (effectiveLevel >= 2 && rand < 0.72) {
            type = 'FLYING';
        } else if (rand < 0.84) {
            type = 'BOAR';
        } else if (rand < 0.92) {
            type = 'MUD_POP';
        } else {
            type = 'CLASSIC';
        }

        const direction = Math.random() > 0.5 ? 1 : -1;
        let startX = direction > 0 ? -60 : this.virtualWidth + 60;
        let startY = 480 + Math.random() * 120; // faixa no solo / pasto

        if (type === 'FLYING') {
            startY = 140 + Math.random() * 180; // faixa no céu
        } else if (type === 'MUD_POP') {
            startX = 200 + Math.random() * (this.virtualWidth - 400);
            startY = 490 + Math.random() * 130;
        } else if (type === 'BOSS') {
            startX = direction > 0 ? -120 : this.virtualWidth + 120;
            startY = 470;
        }

        const pig = new Pig(type, startX, startY, direction, {
            speedMult: 1.0 + (wave * 0.04),
            hpMult: 1.0 + (wave * 0.08)
        });

        this.pigs.push(pig);
        this.wavePigsSpawned++;
    }

    updateHorizonPigs(dt) {
        // Atualiza porcos no horizonte
        for (let i = this.horizonPigs.length - 1; i >= 0; i--) {
            const hpig = this.horizonPigs[i];
            hpig.update(dt);
            if (hpig.state === 'gone' || (hpig.isDead && hpig.deathTimer > 0.8)) {
                this.horizonPigs.splice(i, 1);
            }
        }

        // Spawn timer
        this.horizonSpawnTimer -= dt;
        if (this.horizonSpawnTimer <= 0) {
            this.spawnHorizonPig();
            this.horizonSpawnTimer = 4.5 + Math.random() * 5.0;
        }
    }

    spawnHorizonPig() {
        if (this.horizonPigs.length >= 2) return;

        // Locais distantes no horizonte (topo de colinas, telhado do celeiro, moinho)
        const spots = [
            { x: 240, y: 320, label: 'Colina Esquerda' },
            { x: 530, y: 295, label: 'Telhado do Celeiro' },
            { x: 860, y: 305, label: 'Moinho de Vento' },
            { x: 1060, y: 335, label: 'Colina Direita' },
            { x: 710, y: 275, label: 'Torre de Feno' }
        ];

        // Seleciona um local que não esteja ocupado
        const available = spots.filter(s => !this.horizonPigs.some(p => Math.abs(p.x - s.x) < 80));
        if (available.length === 0) return;

        const spot = available[Math.floor(Math.random() * available.length)];
        const type = Math.random() < 0.45 ? 'BOAR' : 'PIG';
        const hpig = new HorizonPig(spot.x, spot.y, spot.label, type);
        this.horizonPigs.push(hpig);

        // Se o jogador estiver com o rifle de sniper, dá um aviso sutil de oportunidade
        if (this.weapons.currentKey === 'sniper') {
            const isBoar = type === 'BOAR';
            this.particles.addFloatingText(isBoar ? '🐗 JAVALI NO HORIZONTE!' : '🔭 ESPIÃO NO HORIZONTE!', spot.x, spot.y - 25, {
                size: 16,
                color: isBoar ? '#ff6b6b' : '#2ed573',
                stroke: '#1e272e',
                life: 1.2
            });
        }
    }

    onHorizonPigKilled(hpig) {
        this.stats.pigsKilled++;
        this.stats.headshots++;

        window.sounds.playPigOink();
        window.sounds.playCoin();

        const isBoar = hpig.type === 'BOAR';
        const points = isBoar ? 1500 : 1000;
        const coins = isBoar ? 50 : 35;
        const title = isBoar ? '🐗 JAVALI DO HORIZONTE ABATIDO!' : '🎯 FRANCO-ATIRADOR! ALVO ABATIDO!';

        this.addScore(points, hpig.x, hpig.baseY - 25, `${title} +${points} PTS`);
        this.coins += coins;
        localStorage.setItem('pig_hunter_coins', this.coins.toString());

        this.particles.addBacon(hpig.x, hpig.baseY, isBoar ? 8 : 5);
        this.particles.addSparks(hpig.x, hpig.baseY, 20, isBoar ? '#ff4757' : '#ffd32a');
        this.particles.addShockwave(hpig.x, hpig.baseY, isBoar ? 65 : 50, isBoar ? '#e74c3c' : '#2ed573');
        this.particles.addFloatingText(`+${coins} 🪙`, hpig.x, hpig.baseY - 50, {
            size: 24,
            color: '#fed330',
            stroke: '#1e272e',
            life: 1.3
        });
    }

    cycleCrosshairStyle() {
        const styles = ['weapon', 'red_dot', 'cross', 'circle_laser', 'mil_dot'];
        const currentIdx = styles.indexOf(this.crosshairStyle);
        const nextIdx = (currentIdx + 1) % styles.length;
        this.setCrosshairStyle(styles[nextIdx]);

        const styleNames = {
            weapon: 'PADRÃO DA ARMA 💥',
            red_dot: 'RED DOT REFLEX 🔴',
            cross: 'CRUZ MILITAR ➕',
            circle_laser: 'CÍRCULO SCI-FI ⭕',
            mil_dot: 'LUNETA MIL-DOT 🔭'
        };

        this.particles.addFloatingText(styleNames[this.crosshairStyle] || this.crosshairStyle.toUpperCase(), this.mouseX, this.mouseY - 45, {
            size: 18,
            color: this.crosshairColor,
            stroke: '#1e272e',
            life: 1.0
        });
    }

    setCrosshairStyle(style) {
        this.crosshairStyle = style;
        localStorage.setItem('pig_crosshair_style', style);
        this.updateCustomizerUI();
    }

    setCrosshairColor(color) {
        this.crosshairColor = color;
        localStorage.setItem('pig_crosshair_color', color);
        this.updateCustomizerUI();
    }

    updateCustomizerUI() {
        document.querySelectorAll('.crosshair-opt-btn').forEach(btn => {
            if (btn.getAttribute('data-style') === this.crosshairStyle) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        document.querySelectorAll('.color-opt-btn').forEach(btn => {
            if (btn.getAttribute('data-color') === this.crosshairColor) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    gameLoop(now) {
        const dt = Math.min(0.1, (now - this.lastTime) / 1000);
        this.lastTime = now;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(dt) {
        if (this.state !== 'PLAYING') return;

        // Rajada contínua com metralhadora caso o botão esteja pressionado
        if (this.isMouseDown && this.weapons.current.autoFire) {
            this.performShot();
        }

        this.weapons.update(dt);
        this.gunRenderer.update(dt, this.isMouseDown && this.weapons.currentKey === 'machinegun');
        this.sniperScope.update(dt);
        this.updateHorizonPigs(dt);
        this.env.update(dt);
        if (this.weapons.justFinishedReload) {
            this.particles.addFloatingText('CARREGADO! ⚡', this.mouseX, this.mouseY - 45, {
                size: 20,
                color: '#2ed573',
                stroke: '#1e272e',
                life: 0.7
            });
            const ammoCard = document.querySelector('.ammo-card');
            if (ammoCard) {
                ammoCard.classList.add('ammo-reloaded-pulse');
                setTimeout(() => ammoCard.classList.remove('ammo-reloaded-pulse'), 400);
            }
        }
        this.particles.update(dt);

        // Amortecimento do tremor de tela
        if (this.shakeAmount > 0) {
            this.shakeAmount = Math.max(0, this.shakeAmount - dt * 45);
        }

        // Atualiza timer do combo
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.combo = 1;
            }
        }

        // Febre do Bacon
        if (this.frenzyTimer > 0) {
            this.frenzyTimer -= dt;
            if (this.frenzyTimer <= 0) {
                this.frenzyTimer = 0;
            }
        }

        // Lógica dos Porcos
        for (let i = this.pigs.length - 1; i >= 0; i--) {
            const pig = this.pigs[i];
            pig.update(dt, this.virtualWidth, this.virtualHeight, this.frenzyTimer > 0);

            // Se o porco escapou da tela
            if (pig.escaped && !pig.isDead) {
                this.pigs.splice(i, 1);
                this.wavePigsRemaining = Math.max(0, this.wavePigsRemaining - 1);

                if (this.gameMode === 'DEFENSE') {
                    this.onPigEscaped(pig);
                }
                continue;
            }

            // Remove após animação de morte
            if (pig.isDead && pig.deathTimer > 0.6) {
                this.pigs.splice(i, 1);
            }
        }

        // Spawn de Porcos
        if (this.gameMode === 'DEFENSE') {
            this.updateDefenseWave(dt);
        } else if (this.gameMode === 'ARCADE') {
            this.updateArcadeMode(dt);
        }

        this.updateHUD();
    }

    updateDefenseWave(dt) {
        if (this.isWaveBreak) {
            this.waveBreakTimer -= dt;
            if (this.waveBreakTimer <= 0) {
                this.setupWave(this.wave + 1);
                this.particles.addFloatingText(`ONDA ${this.wave}!`, this.virtualWidth / 2, this.virtualHeight / 2 - 60, {
                    size: 40,
                    color: '#ffeaa7',
                    stroke: '#d63031',
                    life: 1.8
                });
            }
            return;
        }

        // Spawna novos porcos enquanto a cota da onda não acabou
        if (this.wavePigsSpawned < this.waveTotalPigs) {
            this.waveSpawnTimer -= dt;
            if (this.waveSpawnTimer <= 0) {
                this.spawnPig();
                const minSpawnRate = Math.max(0.6, 2.2 - this.wave * 0.12);
                this.waveSpawnTimer = minSpawnRate + Math.random() * 0.8;
            }
        } else if (this.pigs.length === 0 && this.wavePigsRemaining === 0) {
            // Onda concluída!
            this.isWaveBreak = true;
            this.waveBreakTimer = 3.0;
            window.sounds.playFrenzy();
            const waveBonus = this.wave * 500;
            this.addScore(waveBonus, this.virtualWidth / 2, this.virtualHeight / 2, `ONDA VENCIDA! +${waveBonus} PTS`);
        }
    }

    updateArcadeMode(dt) {
        this.arcadeTimer -= dt;

        // Atualiza ciclo horário e cenário no Arcade
        const themeInfo = this.env.setThemeByArcadeTime(this.arcadeTimer, 90);
        if (themeInfo.changed) {
            this.particles.addFloatingText(`${themeInfo.theme.icon} ${themeInfo.theme.name.toUpperCase()}`, this.virtualWidth / 2, 130, {
                size: 26,
                color: '#fff200',
                stroke: '#1e272e',
                life: 2.0
            });
        }

        // Spawna porcos contínuos
        this.waveSpawnTimer -= dt;
        if (this.waveSpawnTimer <= 0) {
            this.spawnPig();
            this.waveSpawnTimer = 0.5 + Math.random() * 0.9;
        }

        if (this.arcadeTimer <= 0) {
            this.arcadeTimer = 0;
            this.triggerGameOver('TEMPO ESGOTADO!');
        }
    }

    onPigEscaped(pig) {
        this.lives--;
        window.sounds.playGameOver();
        this.shakeAmount = 14;

        this.particles.addFloatingText('⚠️ PORCO INVADIU O CELEIRO! -1 VIDA', this.virtualWidth / 2, 220, {
            size: 26,
            color: '#e74c3c',
            stroke: '#2c3e50',
            life: 1.5
        });

        if (this.lives <= 0) {
            this.lives = 0;
            this.triggerGameOver('A FAZENDA FOI DOMINADA PELOS PORCOS!');
        }
    }

    triggerGameOver(reason) {
        this.state = 'GAMEOVER';
        window.sounds.stopBGM();
        window.sounds.playGameOver();

        const accuracy = this.stats.shotsFired > 0
            ? Math.round((this.stats.shotsHit / this.stats.shotsFired) * 100)
            : 0;

        document.getElementById('game-over-title').innerText = reason || 'FIM DE JOGO!';
        document.getElementById('final-score').innerText = this.score.toLocaleString('pt-BR');
        document.getElementById('final-pigs').innerText = this.stats.pigsKilled;
        document.getElementById('final-headshots').innerText = this.stats.headshots;
        document.getElementById('final-accuracy').innerText = `${accuracy}%`;
        document.getElementById('final-coins').innerText = `+${Math.round(this.score / 25)}`;

        const bestScore = this.gameMode === 'DEFENSE' ? this.highScoreDefense : this.highScoreArcade;
        document.getElementById('final-best').innerText = bestScore.toLocaleString('pt-BR');

        document.getElementById('game-over-modal').classList.remove('hidden');
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            document.getElementById('pause-modal').classList.remove('hidden');
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            document.getElementById('pause-modal').classList.add('hidden');
        }
    }

    toggleSound() {
        const isMuted = window.sounds.toggleMute();
        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) {
            soundBtn.innerText = isMuted ? '🔇 Mudo' : '🔊 Som';
        }
    }

    hideAllModals() {
        document.getElementById('start-modal').classList.add('hidden');
        document.getElementById('pause-modal').classList.add('hidden');
        document.getElementById('game-over-modal').classList.add('hidden');
        document.getElementById('shop-modal').classList.add('hidden');
    }

    updateHUD() {
        const currentWeapon = this.weapons.current;

        // Munição
        const ammoElem = document.getElementById('hud-ammo-count');
        if (ammoElem) {
            if (this.frenzyTimer > 0) {
                ammoElem.innerHTML = '<span class="frenzy-text">∞ INFINITO</span>';
            } else if (this.weapons.isReloading()) {
                const pct = Math.round(this.weapons.getReloadProgress() * 100);
                ammoElem.innerHTML = `<span class="reloading-text">RECARREGANDO ${pct}%</span>`;
            } else {
                ammoElem.innerText = `${currentWeapon.currentAmmo} / ${currentWeapon.magSize}`;
            }
        }

        // Pontos e Moedas
        const scoreElem = document.getElementById('hud-score');
        if (scoreElem) scoreElem.innerText = this.score.toLocaleString('pt-BR');

        const coinElem = document.getElementById('hud-coins');
        if (coinElem) coinElem.innerText = this.coins.toLocaleString('pt-BR');

        // Combo
        const comboElem = document.getElementById('hud-combo');
        if (comboElem) {
            if (this.combo > 1) {
                comboElem.innerText = `x${this.combo}`;
                comboElem.style.display = 'inline-block';
            } else {
                comboElem.style.display = 'none';
            }
        }

        // Modo / Vidas ou Tempo
        const modeStatusElem = document.getElementById('hud-mode-status');
        if (modeStatusElem) {
            if (this.gameMode === 'DEFENSE') {
                const hearts = '❤️'.repeat(this.lives) + '🖤'.repeat(Math.max(0, this.maxLives - this.lives));
                modeStatusElem.innerHTML = `Onda ${this.wave} | Vidas: ${hearts}`;
            } else {
                const secs = Math.ceil(this.arcadeTimer);
                modeStatusElem.innerHTML = `⏱️ Tempo: ${secs}s`;
            }
        }

        // Atualiza seleção visual dos botões de arma
        document.querySelectorAll('.weapon-btn').forEach(btn => {
            const wId = btn.getAttribute('data-weapon');
            if (wId === this.weapons.currentKey) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }

            const wObj = this.weapons.weapons[wId];
            if (wObj && !wObj.unlocked) {
                btn.classList.add('locked');
            } else {
                btn.classList.remove('locked');
            }
        });

        // Atualiza estado do botão de luneta mobile
        const scopeBtn = document.getElementById('btn-mobile-scope');
        if (scopeBtn) {
            scopeBtn.classList.toggle('active', this.weapons.currentKey === 'sniper' && this.sniperScope.isScoping);
            scopeBtn.style.opacity = this.weapons.currentKey === 'sniper' ? '1.0' : '0.65';
        }
    }

    render() {
        const ctx = this.ctx;

        ctx.save();

        // Efeito de Tremor de Tela
        if (this.shakeAmount > 0) {
            const sx = (Math.random() - 0.5) * this.shakeAmount * 1.5;
            const sy = (Math.random() - 0.5) * this.shakeAmount * 1.5;
            ctx.translate(sx, sy);
        }

        // 1. Cenário e Céu Dinâmicos por Fase
        this.env.drawBackground(ctx);

        // 2. Porcos no Horizonte (Colinas, telhado e moinho)
        for (const hpig of this.horizonPigs) {
            hpig.draw(ctx);
        }

        // 3. Porcos Principais
        for (const pig of this.pigs) {
            pig.draw(ctx);
        }

        // 4. Cerca da fazenda em primeiro plano (dá profundidade 2.5D)
        this.drawForegroundFence(ctx);

        // 5. Cano da Arma em perspectiva FPS (Acompanhando a Mira)
        if (this.sniperScope.scopeAlpha < 0.8) {
            this.gunRenderer.draw(
                ctx,
                this.weapons.currentKey,
                this.mouseX,
                this.mouseY,
                this.weapons.recoilAnim,
                this.weapons.isReloading(),
                this.weapons.getReloadProgress()
            );
        }

        // 6. Partículas e Textos
        this.particles.draw(ctx);

        // 7. Bronca da Mulher do Fazendeiro (Dona Benta) se atirou na Lua
        this.env.drawWifeSpeechBubble(ctx);

        // 8. Filtro de Febre do Bacon
        if (this.frenzyTimer > 0) {
            ctx.fillStyle = `rgba(255, 215, 0, ${0.12 + Math.sin(Date.now() * 0.01) * 0.06})`;
            ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);
        }

        // 9. Visão de Luneta Sniper (Scope Overlay)
        if (this.weapons.currentKey === 'sniper') {
            this.sniperScope.draw(ctx, this.mouseX, this.mouseY, this.crosshairColor);
        }

        // 10. Mira / Retículo do Jogador
        if (this.sniperScope.scopeAlpha < 0.6) {
            this.drawCrosshair(ctx);
        }

        ctx.restore();
    }

    drawForegroundFence(ctx) {
        // Cerca adaptativa ao tema do cenário
        ctx.save();
        if (this.env && this.env.theme.id === 'VOLCANO') {
            // Ameias de pedra/ferro vulcânico
            ctx.fillStyle = '#2d3436';
            ctx.strokeStyle = '#1e272e';
        } else if (this.env && (this.env.theme.id === 'STORM' || this.env.theme.id === 'NIGHT')) {
            // Madeira escura molhada ou sob o luar
            ctx.fillStyle = '#3a2312';
            ctx.strokeStyle = '#1a0e05';
        } else {
            // Madeira rústica da fazenda
            ctx.fillStyle = '#8b572a';
            ctx.strokeStyle = '#4a2c11';
        }
        ctx.lineWidth = 2.5;

        const postSpacing = 90;
        const totalPosts = Math.ceil(this.virtualWidth / postSpacing) + 1;

        // Vigas horizontais
        ctx.fillRect(0, 680, this.virtualWidth, 12);
        ctx.strokeRect(0, 680, this.virtualWidth, 12);

        // Mourões verticais pontiagudos
        for (let i = 0; i <= totalPosts; i++) {
            const px = i * postSpacing;
            ctx.beginPath();
            ctx.moveTo(px - 10, 720);
            ctx.lineTo(px - 10, 655);
            ctx.lineTo(px, 640);
            ctx.lineTo(px + 10, 655);
            ctx.lineTo(px + 10, 720);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Pregos de ferro nos mourões
            ctx.fillStyle = '#1e272e';
            ctx.beginPath();
            ctx.arc(px, 686, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Decoração natalina na cerca (Neve, Gelo e Luzes Pisca-Pisca)
            if (this.isChristmasMode || (this.env && this.env.theme.id === 'XMAS')) {
                // Capuz de neve sobre cada mourão pontiagudo
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.moveTo(px - 10, 655);
                ctx.lineTo(px, 638);
                ctx.lineTo(px + 10, 655);
                ctx.closePath();
                ctx.fill();

                // Estalactite de gelo translúcido pendendo
                if (i % 2 === 0) {
                    ctx.fillStyle = 'rgba(215, 235, 255, 0.85)';
                    ctx.beginPath();
                    ctx.moveTo(px - 4, 692);
                    ctx.lineTo(px - 2, 704);
                    ctx.lineTo(px, 692);
                    ctx.closePath();
                    ctx.fill();
                }

                // Luzinhas de Natal coloridas entre os postes
                const lightColors = ['#ff4757', '#2ed573', '#ffd32a', '#1e90ff'];
                const c = lightColors[(i + Math.floor(Date.now() * 0.003)) % lightColors.length];
                ctx.fillStyle = c;
                ctx.shadowColor = c;
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(px + 45, 686 + Math.sin(i * 1.5) * 4, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (this.env && this.env.theme.id === 'VOLCANO') {
                // Se for fase vulcão: espinhos pontiagudos
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(px - 1, 630, 2, 10);
            }
        }

        // Neve contínua sobre a viga superior na Edição de Natal
        if (this.isChristmasMode || (this.env && this.env.theme.id === 'XMAS')) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 678, this.virtualWidth, 4);
        }
        ctx.restore();
    }

    drawCrosshair(ctx) {
        const x = this.mouseX;
        const y = this.mouseY;
        const weaponKey = this.weapons.currentKey;
        const recoil = this.weapons.recoilAnim;
        const isReloading = this.weapons.isReloading();
        const color = this.crosshairColor || '#2ed573';
        const style = this.crosshairStyle || 'weapon';

        ctx.save();
        ctx.translate(x, y);

        // Se estiver recarregando, desenha anel de progresso e porcentagem
        if (isReloading) {
            const progress = this.weapons.getReloadProgress();
            const pct = Math.round(progress * 100);

            // Anel base
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(0, 0, 36, 0, Math.PI * 2);
            ctx.stroke();

            // Anel de preenchimento dinâmico
            ctx.strokeStyle = pct > 75 ? '#2ed573' : '#ff4757';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(0, 0, 36, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
            ctx.stroke();

            // Porcentagem abaixo da mira
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${pct}%`, 0, 52);
        }

        if (style === 'weapon') {
            if (weaponKey === 'sniper') {
                // Mira telescópica de rifle de alta precisão
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, 42 + recoil * 8, 0, Math.PI * 2);
                ctx.stroke();

                // Retículo com marcadores
                ctx.beginPath();
                ctx.moveTo(-50, 0); ctx.lineTo(-12, 0);
                ctx.moveTo(12, 0); ctx.lineTo(50, 0);
                ctx.moveTo(0, -50); ctx.lineTo(0, -12);
                ctx.moveTo(0, 12); ctx.lineTo(0, 50);
                ctx.stroke();

                // Ponto central vermelho
                ctx.fillStyle = '#ff4757';
                ctx.beginPath();
                ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
                ctx.fill();

            } else if (weaponKey === 'shotgun') {
                // Retículo aberto circular com marcadores de calibre 12
                const rad = 28 + recoil * 14;
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 0, rad, 0, Math.PI * 2);
                ctx.stroke();

                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(-rad - 8, 0); ctx.lineTo(-rad + 4, 0);
                ctx.moveTo(rad - 4, 0); ctx.lineTo(rad + 8, 0);
                ctx.moveTo(0, -rad - 8); ctx.lineTo(0, -rad + 4);
                ctx.moveTo(0, rad - 4); ctx.lineTo(0, rad + 8);
                ctx.stroke();

                // Ponto central
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(0, 0, 3, 0, Math.PI * 2);
                ctx.fill();

            } else if (weaponKey === 'machinegun') {
                // Retículo Minigun Vulcan giratório
                const size = 22 + recoil * 12;
                const spin = Date.now() * 0.015;

                ctx.strokeStyle = color;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.arc(0, 0, size, 0, Math.PI * 2);
                ctx.stroke();

                // 6 canos rotativos estilo Gatling
                for (let i = 0; i < 6; i++) {
                    const angle = spin + (i * Math.PI / 3);
                    const bx = Math.cos(angle) * (size - 6);
                    const by = Math.sin(angle) * (size - 6);
                    ctx.fillStyle = '#ff4757';
                    ctx.beginPath();
                    ctx.arc(bx, by, 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Marcadores externos
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-size - 8, 0); ctx.lineTo(-size, 0);
                ctx.moveTo(size, 0); ctx.lineTo(size + 8, 0);
                ctx.moveTo(0, -size - 8); ctx.lineTo(0, -size);
                ctx.moveTo(0, size); ctx.lineTo(0, size + 8);
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(0, 0, 3, 0, Math.PI * 2);
                ctx.fill();

            } else if (weaponKey === 'launcher') {
                // Retículo tático de míssil da Bazuca
                const size = 36 + recoil * 14;
                ctx.strokeStyle = color;
                ctx.lineWidth = 2.5;

                // Cantos de mira estilo mira militar
                const corner = 10;
                ctx.beginPath();
                ctx.moveTo(-size, -size + corner); ctx.lineTo(-size, -size); ctx.lineTo(-size + corner, -size);
                ctx.moveTo(size - corner, -size); ctx.lineTo(size, -size); ctx.lineTo(size, -size + corner);
                ctx.moveTo(-size, size - corner); ctx.lineTo(-size, size); ctx.lineTo(-size + corner, size);
                ctx.moveTo(size - corner, size); ctx.lineTo(size, size); ctx.lineTo(size, size - corner);
                ctx.stroke();

                // Raio de impacto estimado
                ctx.strokeStyle = 'rgba(255, 71, 87, 0.45)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.arc(0, 0, size * 1.4, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);

                // Cruz central com ponto de ogiva
                ctx.strokeStyle = color;
                ctx.beginPath();
                ctx.moveTo(-10, 0); ctx.lineTo(10, 0);
                ctx.moveTo(0, -10); ctx.lineTo(0, 10);
                ctx.stroke();

                ctx.fillStyle = '#fffa65';
                ctx.beginPath();
                ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (style === 'red_dot') {
            // RED DOT REFLEX TÁTICO
            ctx.strokeStyle = color;
            ctx.globalAlpha = 0.35;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, 22 + recoil * 6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1.0;

            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, -28 - recoil * 6); ctx.lineTo(0, -22 - recoil * 6);
            ctx.moveTo(0, 22 + recoil * 6); ctx.lineTo(0, 28 + recoil * 6);
            ctx.moveTo(-28 - recoil * 6, 0); ctx.lineTo(-22 - recoil * 6, 0);
            ctx.moveTo(22 + recoil * 6, 0); ctx.lineTo(28 + recoil * 6, 0);
            ctx.stroke();

        } else if (style === 'cross') {
            // CRUZ MILITAR (CS / Mil-Spec)
            const gap = 8 + recoil * 14;
            const length = 14;

            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#000000';
            ctx.beginPath();
            ctx.moveTo(-gap - length, 0); ctx.lineTo(-gap, 0);
            ctx.moveTo(gap, 0); ctx.lineTo(gap + length, 0);
            ctx.moveTo(0, -gap - length); ctx.lineTo(0, -gap);
            ctx.moveTo(0, gap); ctx.lineTo(0, gap + length);
            ctx.stroke();

            ctx.lineWidth = 2;
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(-gap - length, 0); ctx.lineTo(-gap, 0);
            ctx.moveTo(gap, 0); ctx.lineTo(gap + length, 0);
            ctx.moveTo(0, -gap - length); ctx.lineTo(0, -gap);
            ctx.moveTo(0, gap); ctx.lineTo(0, gap + length);
            ctx.stroke();

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(0, 0, 2, 0, Math.PI * 2);
            ctx.fill();

        } else if (style === 'circle_laser') {
            // CÍRCULO SCI-FI HOLOGRÁFICO
            const rad = 24 + recoil * 10;
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.arc(0, 0, rad, 0.2, Math.PI * 2 / 3 - 0.2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, rad, Math.PI * 2 / 3 + 0.2, Math.PI * 4 / 3 - 0.2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, rad, Math.PI * 4 / 3 + 0.2, Math.PI * 2 - 0.2);
            ctx.stroke();

            for (let i = 0; i < 3; i++) {
                const ang = (i * Math.PI * 2 / 3);
                const cx = Math.cos(ang) * (rad + 6);
                const cy = Math.sin(ang) * (rad + 6);
                ctx.beginPath();
                ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            }

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
            ctx.fill();

        } else if (style === 'mil_dot') {
            // LUNETA TÁTICA MIL-DOT
            const rad = 32 + recoil * 8;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.8;

            ctx.beginPath();
            ctx.arc(0, 0, rad, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(-rad - 15, 0); ctx.lineTo(-8, 0);
            ctx.moveTo(8, 0); ctx.lineTo(rad + 15, 0);
            ctx.moveTo(0, -rad - 15); ctx.lineTo(0, -8);
            ctx.moveTo(0, 8); ctx.lineTo(0, rad + 15);
            ctx.stroke();

            ctx.fillStyle = color;
            const dotOffsets = [-24, -16, 16, 24];
            for (const offset of dotOffsets) {
                ctx.beginPath(); ctx.arc(offset, 0, 1.8, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(0, offset, 1.8, 0, Math.PI * 2); ctx.fill();
            }

            ctx.fillStyle = '#ff4757';
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

// Inicialização Global
window.addEventListener('DOMContentLoaded', () => {
    window.game = new PigHunterGame();

    // Vincula botões do DOM
    document.getElementById('btn-play-defense').addEventListener('click', () => {
        window.game.startNewGame('DEFENSE');
    });

    document.getElementById('btn-play-arcade').addEventListener('click', () => {
        window.game.startNewGame('ARCADE');
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
        window.game.startNewGame(window.game.gameMode);
    });

    document.getElementById('btn-resume').addEventListener('click', () => {
        window.game.togglePause();
    });

    document.getElementById('btn-pause-menu').addEventListener('click', () => {
        window.game.state = 'MENU';
        window.game.hideAllModals();
        document.getElementById('start-modal').classList.remove('hidden');
    });

    document.getElementById('btn-gameover-menu').addEventListener('click', () => {
        window.game.state = 'MENU';
        window.game.hideAllModals();
        document.getElementById('start-modal').classList.remove('hidden');
    });

    document.getElementById('btn-open-shop').addEventListener('click', () => {
        window.openShopModal();
    });

    document.getElementById('btn-close-shop').addEventListener('click', () => {
        document.getElementById('shop-modal').classList.add('hidden');
    });

    // Modal de Miras e Retículos
    const btnOpenCrosshairs = document.getElementById('btn-open-crosshairs');
    if (btnOpenCrosshairs) {
        btnOpenCrosshairs.addEventListener('click', () => {
            window.game.updateCustomizerUI();
            document.getElementById('customizer-modal').classList.remove('hidden');
        });
    }

    const btnCloseCustomizer = document.getElementById('btn-close-customizer');
    if (btnCloseCustomizer) {
        btnCloseCustomizer.addEventListener('click', () => {
            document.getElementById('customizer-modal').classList.add('hidden');
        });
    }

    document.querySelectorAll('.crosshair-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const style = btn.getAttribute('data-style');
            window.game.setCrosshairStyle(style);
        });
    });

    document.querySelectorAll('.color-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.getAttribute('data-color');
            window.game.setCrosshairColor(color);
        });
    });

    document.getElementById('sound-toggle-btn').addEventListener('click', () => {
        window.game.toggleSound();
    });

    // Seletor de Armas na barra inferior
    document.querySelectorAll('.weapon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const wId = btn.getAttribute('data-weapon');
            window.game.selectWeapon(wId);
        });
    });

    // Clique na caixinha de munição para recarregar
    const ammoCard = document.querySelector('.ammo-card');
    if (ammoCard) {
        ammoCard.addEventListener('click', () => {
            if (window.game && window.game.state === 'PLAYING') {
                window.game.weapons.startReload();
                window.game.updateHUD();
            }
        });
    }
});

// Funções da Loja
window.openShopModal = function() {
    const shopList = document.getElementById('shop-items-list');
    shopList.innerHTML = '';
    const coins = window.game.coins;
    document.getElementById('shop-coins-display').innerText = coins.toLocaleString('pt-BR');

    const shopItems = [
        { key: 'free_coins', name: 'Saco de Ouro da Fazenda', cost: 0, icon: '💰', desc: 'Resgate +1.000 moedas grátis imediatamente!' },
        { key: 'launcher', name: 'Lança-Granadas TNT', cost: 300, icon: '💣', desc: 'Explosões gigantescas em área!' },
        { key: 'heal', name: 'Consertar Cerca (+1 Vida)', cost: 100, icon: '❤️', desc: 'Recupera 1 coração da fazenda' }
    ];

    shopItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'shop-item-card';

        let actionBtnHtml = '';
        if (item.key === 'free_coins') {
            actionBtnHtml = `<button class="btn btn-warning" onclick="window.buyShopItem('free_coins', 0)">Resgatar +1.000 🪙</button>`;
        } else {
            const isUnlocked = item.key === 'heal' ? false : window.game.weapons.weapons[item.key].unlocked;
            if (isUnlocked) {
                actionBtnHtml = '<button class="btn btn-secondary" disabled>JÁ ADQUIRIDO ✔️</button>';
            } else {
                const canAfford = coins >= item.cost;
                actionBtnHtml = `<button class="btn btn-primary" ${canAfford ? '' : 'disabled'} onclick="window.buyShopItem('${item.key}', ${item.cost})">Comprar por 🪙 ${item.cost}</button>`;
            }
        }

        card.innerHTML = `
            <div class="shop-item-header">
                <span class="shop-item-icon">${item.icon}</span>
                <div>
                    <h4>${item.name}</h4>
                    <p>${item.desc}</p>
                </div>
            </div>
            <div class="shop-item-footer">
                ${actionBtnHtml}
            </div>
        `;
        shopList.appendChild(card);
    });

    document.getElementById('shop-modal').classList.remove('hidden');
};

window.buyShopItem = function(key, cost) {
    if (key === 'free_coins') {
        window.game.coins += 1000;
        localStorage.setItem('pig_hunter_coins', window.game.coins.toString());
        window.sounds.playCoin();
        window.game.particles.addFloatingText('+1.000 MOEDAS! 💰', window.game.virtualWidth / 2, 200, {
            size: 32,
            color: '#ffd32a'
        });
        window.game.updateHUD();
        window.openShopModal();
        return;
    }

    if (window.game.coins < cost) return;

    window.game.coins -= cost;
    localStorage.setItem('pig_hunter_coins', window.game.coins.toString());
    window.sounds.playCoin();

    if (key === 'heal') {
        window.game.lives = Math.min(window.game.maxLives, window.game.lives + 1);
        window.game.particles.addFloatingText('+1 VIDA! ❤️', window.game.virtualWidth / 2, 200, {
            size: 28,
            color: '#2ecc71'
        });
    } else {
        window.game.weapons.unlock(key);
        window.game.selectWeapon(key);
    }

    window.game.updateHUD();
    window.openShopModal(); // atualiza a interface da loja
};
