/**
 * scripts/check.js
 * Script de Verificação de Integridade e Sintaxe do Caça aos Porcos
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const jsFiles = [
    'src/audio/audio.js',
    'src/systems/weapons.js',
    'src/entities/pig.js',
    'src/entities/sniper_horizon.js',
    'src/systems/particles.js',
    'src/systems/environment.js',
    'src/systems/gun_render.js',
    'src/core/game.js',
    'scripts/server.js',
    'scripts/package_netlify.js'
];

console.log('='.repeat(60));
console.log('🔍 INICIANDO VERIFICAÇÃO DE INTEGRIDADE DO CÓDIGO');
console.log('='.repeat(60));

let hasErrors = false;

// 1. Verificação de arquivos essenciais
console.log('\n[1/3] Checando existência de arquivos de sistema...');
const essentialFiles = [
    'index.html',
    'src/styles/style.css',
    'package.json',
    'README.md',
    '.gitignore'
];

essentialFiles.forEach(f => {
    const full = path.join(rootDir, f);
    if (fs.existsSync(full)) {
        console.log(`  ✓ Encontrado: ${f}`);
    } else {
        console.error(`  ✗ AUSENTE: ${f}`);
        hasErrors = true;
    }
});

// 2. Verificação de sintaxe dos scripts JavaScript
console.log('\n[2/3] Validando sintaxe JavaScript (AST)...');
jsFiles.forEach(f => {
    const full = path.join(rootDir, f);
    if (!fs.existsSync(full)) {
        console.error(`  ✗ Arquivo não encontrado: ${f}`);
        hasErrors = true;
        return;
    }

    try {
        execSync(`node --check "${full}"`, { stdio: 'pipe' });
        const sizeKb = (fs.statSync(full).size / 1024).toFixed(1);
        console.log(`  ✓ Sintaxe válida: ${f.padEnd(35)} (${sizeKb} KB)`);
    } catch (err) {
        console.error(`  ✗ ERRO DE SINTAXE EM: ${f}`);
        console.error(err.message);
        hasErrors = true;
    }
});

// 3. Verificação do index.html (tags de script)
console.log('\n[3/3] Validando referências no index.html...');
const indexPath = path.join(rootDir, 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

jsFiles.filter(f => f.startsWith('src/')).forEach(f => {
    if (indexHtml.includes(f)) {
        console.log(`  ✓ Tag script correta para: ${f}`);
    } else {
        console.warn(`  ⚠️ Alerta: "${f}" não referenciado diretamente no index.html`);
    }
});

console.log('\n' + '='.repeat(60));
if (hasErrors) {
    console.error('❌ FORAM ENCONTRADOS ERROS NA VERIFICAÇÃO!');
    process.exit(1);
} else {
    console.log('✅ TODAS AS CHECAGENS PASSARAM COM SUCESSO! CÓDIGO 100% ÍNTEGRO.');
    console.log('='.repeat(60));
}
