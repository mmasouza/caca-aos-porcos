/**
 * scripts/package_netlify.js
 * Script de Empacotamento e Distribuição Otimizada para o Netlify
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const deployDir = path.join(rootDir, 'deploy-netlify');
const zipFile = path.join(rootDir, 'caca-aos-porcos-netlify.zip');

console.log('='.repeat(60));
console.log('📦 EMPACOTAMENTO PARA PRODUÇÃO (NETLIFY / DOMÍNIO PÚBLICO)');
console.log('='.repeat(60));

console.log('Criando pasta limpa de distribuição:', deployDir);
if (fs.existsSync(deployDir)) {
    fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir, { recursive: true });

// Função de cópia recursiva
function copyDirRecursive(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// 1. Copia index.html, manifest.json e sw.js (PWA Mobile)
fs.copyFileSync(path.join(rootDir, 'index.html'), path.join(deployDir, 'index.html'));
if (fs.existsSync(path.join(rootDir, 'manifest.json'))) {
    fs.copyFileSync(path.join(rootDir, 'manifest.json'), path.join(deployDir, 'manifest.json'));
}
if (fs.existsSync(path.join(rootDir, 'sw.js'))) {
    fs.copyFileSync(path.join(rootDir, 'sw.js'), path.join(deployDir, 'sw.js'));
}
console.log('[OK] index.html, manifest.json e sw.js copiados.');

// 2. Copia pasta modular src/
copyDirRecursive(path.join(rootDir, 'src'), path.join(deployDir, 'src'));
console.log('[OK] Pasta src/ copiada com todos os módulos (audio, core, entities, styles, systems).');

// 3. Cria _headers para Netlify (Cache HTTP, CSP e Segurança)
const headersContent = `/*
  X-Frame-Options: SAMEORIGIN
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/src/*
  Cache-Control: public, max-age=31536000, immutable

/index.html
  Cache-Control: public, max-age=0, must-revalidate
`;
fs.writeFileSync(path.join(deployDir, '_headers'), headersContent);
console.log('[OK] _headers gerado.');

// 4. Cria _redirects para SPA/HTML5 Canvas
const redirectsContent = `/*    /index.html   200\n`;
fs.writeFileSync(path.join(deployDir, '_redirects'), redirectsContent);
console.log('[OK] _redirects gerado.');

// 5. Cria netlify.toml
const netlifyToml = `[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
`;
fs.writeFileSync(path.join(deployDir, 'netlify.toml'), netlifyToml);
console.log('[OK] netlify.toml gerado.');

// 6. Geração do arquivo ZIP
console.log('\nCompactando artefato final em .zip...');
if (fs.existsSync(zipFile)) {
    fs.unlinkSync(zipFile);
}

try {
    execSync(`tar -a -c -f "${zipFile}" *`, { cwd: deployDir, stdio: 'inherit' });
    console.log(`[SUCESSO] Pacote .zip gerado: ${zipFile}`);
} catch (err) {
    execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${deployDir}\\*' -DestinationPath '${zipFile}' -Force"`, { stdio: 'inherit' });
    console.log(`[SUCESSO] Pacote .zip gerado via PowerShell: ${zipFile}`);
}

const stats = fs.statSync(zipFile);
console.log(`Tamanho final do ZIP: ${(stats.size / 1024).toFixed(1)} KB`);

// 7. Cópia conveniente para Área de Trabalho (Desktop)
const desktopZip = 'C:\\Users\\root\\Desktop\\caca-aos-porcos-netlify.zip';
try {
    fs.copyFileSync(zipFile, desktopZip);
    console.log(`[DESKTOP] Copiado para Área de Trabalho: ${desktopZip}`);
} catch (e) {
    console.log('Aviso ao copiar para Desktop:', e.message);
}

console.log('='.repeat(60));
console.log('✨ PACOTE PRONTO PARA DEPLOY INSTANTÂNEO NO NETLIFY!');
console.log('='.repeat(60));
