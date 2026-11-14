# 🐷 Caça aos Porcos: O Apocalipse Suíno (v2.5.0)

> Jogo de tiro e defesa da fazenda estilo arcade 2.5D construído com HTML5 Canvas e Web Audio API.

![Versão](https://img.shields.io/badge/vers%C3%A3o-2.5.0-red.svg)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-green.svg)
![Stack](https://img.shields.io/badge/stack-Vanilla%20JS%20%7C%20Canvas%20%7C%20Web%20Audio-blue.svg)

---

## 🌟 Destaques do Projeto

* 🎮 **Jogabilidade Arcade Fluida**: Miras customizáveis, recoil realista, luneta sniper com zoom ótico e cano da arma em perspectiva FPS.
* 🛡️ **Inimigos com Armaduras**: Porco Cavaleiro de Ferro medieval, Porco Mecha-Ciborgue com olho laser e Javali Gladiador com espinhos.
* 🌙 **Segredos e Easter Eggs**: Atire na Lua para tomar uma bronca cômica de Dona Benta agitando um rolo de massa, atire no cata-vento do galo ou acerte o trenó do Papai Noel!
* 🎄 **Edição Especial de Natal**: Cenário nevado, luzes pisca-pisca, gorros natalinos, chifres de rena e trilha sonora procedural com sinos de Natal.
* ⚡ **Zero Dependências Externas**: Áudio sintetizado em tempo real pelo navegador, sem necessidade de carregar arquivos MP3 ou imagens pesadas.

---

## 📁 Estrutura de Diretórios Modular

```
caca-aos-porcos/
├── docs/                      # Documentação técnica e manual do jogador
│   ├── ARQUITETURA.md
│   └── GUIA_DO_JOGO.md
├── scripts/                   # Automação e utilitários
│   ├── check.js               # Validação de integridade e sintaxe AST
│   ├── package_netlify.js     # Empacotador para deploy estático
│   └── server.js              # Servidor local Node.js
├── src/                       # Código-fonte da aplicação
│   ├── audio/                 # Síntese procedural de som
│   ├── core/                  # Game loop, state machine e HUD
│   ├── entities/              # Classes de Porcos, Javalis e Inimigos
│   ├── styles/                # CSS responsivo e modais
│   └── systems/               # Cenário, Armas, Partículas e Mira FPS
├── index.html                 # Ponto de entrada do jogo
├── server.js                  # Ponto de partida do servidor de desenvolvimento
├── package.json               # Configurações e comandos npm
└── jogar.bat                  # Executável para Windows
```

---

## 🚀 Como Executar Localmente

### Opção 1: Via NPM
```bash
# 1. Iniciar servidor local
npm start

# 2. Abrir no navegador
http://localhost:8080
```

### Opção 2: Pelo Arquivo Batch (Windows)
Dê um duplo clique no arquivo `jogar.bat`. O navegador será aberto automaticamente na página do jogo.

---

## 🌐 Como Publicar em Domínio Público

### 1. Publicação Instantânea no Netlify (Grátis e Imediato)
1. Execute `npm run package` (ou utilize o arquivo `caca-aos-porcos-netlify.zip` já gerado na sua Área de Trabalho).
2. Acesse [Netlify Drop](https://app.netlify.com/drop).
3. Arraste e solte o arquivo `.zip` na tela.
4. Seu jogo estará imediatamente online com um link público HTTPS como `https://caca-aos-porcos.netlify.app`!

### 2. Publicação via GitHub Pages
```bash
# 1. Adicione seu repositório remoto no GitHub
git remote add origin https://github.com/SEU_USUARIO/caca-aos-porcos.git
git push -u origin main

# 2. No GitHub: Vá em Settings > Pages > Source: "main branch / root" e salve.
# Seu jogo estará disponível em: https://SEU_USUARIO.github.io/caca-aos-porcos/
```

---

## 🛠️ Comandos Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm start` | Inicia o servidor HTTP local na porta 8080. |
| `npm run check` | Executa testes de sintaxe AST e validação de integridade. |
| `npm run package` | Cria o pacote otimizado com headers de cache para produção. |

---

## 📜 Licença
Distribuído sob licença MIT. Criado por Antigravity.
