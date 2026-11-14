// weapons.js - Sistema de Armamentos, Recarga e Mira

const WEAPON_CONFIGS = {
    shotgun: {
        id: 'shotgun',
        name: 'Espingarda 12',
        shortName: 'Espingarda',
        icon: '💥',
        magSize: 6,
        damage: 85,
        spreadRadius: 65,
        fireRateMs: 380,
        reloadTimeMs: 850,
        recoilShake: 12,
        autoFire: false,
        headshotMult: 1.8,
        description: 'Tiro espalhado. Excelente para acertar grupos de porcos!'
    },
    sniper: {
        id: 'sniper',
        name: 'Rifle de Precisão',
        shortName: 'Rifle',
        icon: '🎯',
        magSize: 5,
        damage: 190,
        spreadRadius: 18,
        fireRateMs: 550,
        reloadTimeMs: 850,
        recoilShake: 9,
        autoFire: false,
        headshotMult: 3.0,
        description: 'Dano cirúrgico. Elimina alvos resistentes e dá bônus de tiro certeiro!'
    },
    machinegun: {
        id: 'machinegun',
        name: 'Metralhadora Vulcan 5000',
        shortName: 'Metralhadora',
        icon: '⚡',
        magSize: 100,
        damage: 42,
        spreadRadius: 36,
        fireRateMs: 70,
        reloadTimeMs: 1100,
        recoilShake: 4,
        autoFire: true,
        headshotMult: 1.8,
        description: 'Automática pesada! Segure o botão para disparar uma saraivada contínua de 100 tiros.'
    },
    launcher: {
        id: 'launcher',
        name: 'Super Bazuca RPG Antisuína',
        shortName: 'Super Bazuca',
        icon: '🚀',
        magSize: 5,
        damage: 480,
        spreadRadius: 240,
        fireRateMs: 750,
        reloadTimeMs: 1100,
        recoilShake: 28,
        autoFire: false,
        headshotMult: 1.0,
        description: 'Dispara mísseis pesados que causam uma explosão nuclear devastadora em massa!'
    }
};

class WeaponSystem {
    constructor() {
        this.weapons = {};
        for (const [key, cfg] of Object.entries(WEAPON_CONFIGS)) {
            this.weapons[key] = {
                ...cfg,
                currentAmmo: cfg.magSize,
                unlocked: true, // Todas as armas liberadas
                reloadingStart: 0,
                reloadingUntil: 0
            };
        }

        this.currentKey = 'shotgun';
        this.lastShotTime = 0;
        this.recoilAnim = 0;
        this.justFinishedReload = false;
    }

    get current() {
        return this.weapons[this.currentKey];
    }

    isReloading() {
        return Date.now() < (this.current.reloadingUntil || 0);
    }

    getReloadProgress() {
        if (!this.isReloading()) return 1.0;
        const total = this.current.reloadingUntil - this.current.reloadingStart;
        const elapsed = Date.now() - this.current.reloadingStart;
        return Math.min(1.0, Math.max(0.0, elapsed / total));
    }

    selectWeapon(key) {
        if (!this.weapons[key] || !this.weapons[key].unlocked) return false;
        if (this.currentKey === key) return true;
        this.currentKey = key;
        window.sounds.playReload();
        return true;
    }

    unlock(key) {
        if (this.weapons[key]) {
            this.weapons[key].unlocked = true;
            return true;
        }
        return false;
    }

    canShoot() {
        const now = Date.now();
        if (this.isReloading()) return false;
        if (now - this.lastShotTime < this.current.fireRateMs) return false;
        return true;
    }

    startReload() {
        if (this.isReloading()) return false;
        if (this.current.currentAmmo >= this.current.magSize) return false;

        const now = Date.now();
        this.current.reloadingStart = now;
        this.current.reloadingUntil = now + this.current.reloadTimeMs;
        if (window.sounds && window.sounds.playReload) {
            window.sounds.playReload();
        }
        return true;
    }

    // Dispara a arma
    // Retorna { fired: true/false, reason: 'empty' | 'cooldown' | 'ok', weapon, damage, radius }
    triggerShot(frenzyMode = false) {
        if (this.isReloading()) {
            return { fired: false, reason: 'reloading' };
        }

        const now = Date.now();
        if (now - this.lastShotTime < this.current.fireRateMs) {
            return { fired: false, reason: 'cooldown' };
        }

        if (this.current.currentAmmo <= 0 && !frenzyMode) {
            window.sounds.playEmpty();
            this.startReload();
            return { fired: false, reason: 'empty' };
        }

        // Sucesso no disparo!
        this.lastShotTime = now;
        this.recoilAnim = 1.0;

        if (!frenzyMode) {
            this.current.currentAmmo--;
        }

        window.sounds.playShot(this.currentKey);

        // Se acabou a última bala, inicia recarga no mesmo instante
        if (this.current.currentAmmo === 0 && !frenzyMode) {
            this.startReload();
        }

        return {
            fired: true,
            weapon: this.current,
            damage: this.current.damage,
            radius: this.current.spreadRadius,
            recoilShake: this.current.recoilShake,
            headshotMult: this.current.headshotMult
        };
    }

    update(dt) {
        const now = Date.now();
        this.justFinishedReload = false;

        // Atualiza recarga de todas as armas (inclusive as guardadas no coldre)
        for (const k in this.weapons) {
            const w = this.weapons[k];
            if (w.reloadingUntil && now >= w.reloadingUntil) {
                w.currentAmmo = w.magSize;
                w.reloadingUntil = 0;
                if (k === this.currentKey) {
                    this.justFinishedReload = true;
                    if (window.sounds && window.sounds.playReloadFinish) {
                        window.sounds.playReloadFinish();
                    }
                }
            }
        }

        if (this.recoilAnim > 0) {
            this.recoilAnim = Math.max(0, this.recoilAnim - dt * 6.0);
        }
    }

    refillAllAmmo() {
        for (const k in this.weapons) {
            this.weapons[k].currentAmmo = this.weapons[k].magSize;
            this.weapons[k].reloadingUntil = 0;
        }
    }
}

window.WeaponSystem = WeaponSystem;
window.WEAPON_CONFIGS = WEAPON_CONFIGS;
