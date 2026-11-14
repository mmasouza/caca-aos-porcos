# 🏗️ Arquitetura e Engenharia de Software - Caça aos Porcos: O Apocalipse Suíno

## 1. Visão Geral
**Caça aos Porcos** é um jogo arcade 2.5D construído com JavaScript puro (Vanilla ES6+), HTML5 Canvas de alta resolução (1280x720) com aspect ratio 16:9 cinematográfico fixo e síntese de áudio procedural via Web Audio API.

---

## 2. Árvore de Diretórios (Estrutura Modular)

```
caca-aos-porcos/
├── .editorconfig              # Padronização de formatação entre editores
├── .gitignore                 # Exclusões do Git (node_modules, zip, builds)
├── package.json               # Configurações do projeto e scripts npm
├── README.md                  # Documentação principal e instruções de execução
├── index.html                 # Ponto de entrada do jogo
├── server.js                  # Ponto de entrada conveniente para servidor local
├── jogar.bat                  # Inicializador em 1-clique para Windows
│
├── docs/                      # Documentação técnica e manuais
│   ├── ARQUITETURA.md         # Este documento
│   └── GUIA_DO_JOGO.md        # Manual de mecânicas, armas, inimigos e segredos
│
├── scripts/                   # Utilitários de desenvolvimento e automação
│   ├── check.js               # Verificador de integridade e sintaxe AST
│   ├── package_netlify.js     # Empacotador para deploy em produção (Netlify)
│   └── server.js              # Servidor HTTP Node.js estático
│
└── src/                       # Código-fonte da aplicação
    ├── audio/
    │   └── audio.js           # Síntese procedural de efeitos sonoros e BGM
    ├── core/
    │   └── game.js            # Loop principal, state machine, input e HUD
    ├── entities/
    │   ├── pig.js             # Entidade dos porcos, hitboxes, estados e armaduras
    │   └── sniper_horizon.js  # Entidades de longa distância no horizonte
    ├── styles/
    │   └── style.css          # Estilização responsiva, temas e modais
    └── systems/
        ├── environment.js     # Cenários dinâmicos, iluminação, clima e segredos
        ├── gun_render.js      # Renderizador em perspectiva FPS do cano da arma
        ├── particles.js       # Sistema de partículas, textos flutuantes e faíscas
        └── weapons.js         # Balística, inventário, recarga e recoil
```

---

## 3. Padrões de Projeto e Arquitetura

### 3.1 Loop de Jogo Cinematográfico
O loop roda via `requestAnimationFrame` desacoplando física de renderização:
* `update(dt)`: Aplica física, animações, squash & stretch, decay de recoil e checagens de borda.
* `render()`: Camadas visuais ordenadas por profundidade:
  1. Background (Céu com gradientes, estrelas, sol/lua, montanhas em parallax, estruturas).
  2. Inimigos no Horizonte (Colinas distantes, moinho, celeiro).
  3. Inimigos do Pasto (Porcos com ordenação de profundidade).
  4. Cerca em primeiro plano (Perspectiva 2.5D).
  5. Cano da Arma em perspectiva FPS.
  6. Efeitos de Partículas, Faíscas e Textos Flutuantes.
  7. Balão cômico de bronca da Dona Benta (Overlay).
  8. Luneta da Sniper (Scope Overlay).
  9. Retículo / Crosshair customizável.

### 3.2 Síntese de Áudio Procedural (Zero Assets Externos)
Todos os sons são gerados em tempo real via Web Audio API:
* Disparos (onda senoidal + ruído branco + decay exponencial).
* Ricochete Metálico de Armaduras (`playMetalClang`).
* Oinc dos porcos e rugido dos javalis.
* Jingle Bells e Ho-Ho-Ho natalinos.
* Bronca estridente da mulher do fazendeiro (`playWifeYell`).
* Cacarejo do galo do moinho (`playRoosterCrow`).

### 3.3 Sistema de Armaduras e Balística
* Inimigos com armadura (`ARMORED`, `CYBORG`, `WAR_BOAR`) possuem barra de durabilidade metálica.
* Tiros convencionais sofrem **70% de absorção** na blindagem.
* Armas de alto calibre ou perfurantes (Bazuca RPG ou tiro certeiro na cabeça com Sniper) aplicam dano direto e quebram a armadura instantaneamente.
