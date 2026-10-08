# SimpleVote

Sistema simples de votação para reuniões, assembleias informais e decisões rápidas.

O objetivo do **SimpleVote** é permitir que participantes votem de forma rápida entre três opções:

* **Sim**
* **Não**
* **Se abster**

O sistema possui uma página pública para votação e uma área administrativa para acompanhar os resultados, encerrar/reabrir a votação e iniciar uma nova votação.

## Funcionalidades

* Votação pública com três opções
* Título e descrição da votação editáveis pela área administrativa
* Resultados em tempo real na área administrativa
* Contagem total de votos
* Percentuais por opção
* Barras visuais de resultado
* Encerrar e reabrir votação
* Reset rápido da votação
* Nova sessão criada automaticamente após o reset
* Bloqueio básico de voto repetido no mesmo navegador
* Área administrativa protegida por senha
* Interface responsiva para celular, tablet e computador

## Stack

O projeto foi desenvolvido com uma stack propositalmente simples:

* HTML
* CSS
* JavaScript Vanilla
* Netlify Functions
* Netlify Blobs
* Node.js

Não utiliza frameworks frontend ou banco de dados tradicional.

## Estrutura

```text
SimpleVote/
├── public/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── admin/
│       ├── index.html
│       ├── admin.css
│       └── admin.js
│
├── netlify/
│   └── functions/
│       ├── lib/
│       │   └── shared.js
│       ├── vote.js
│       ├── results.js
│       ├── reset.js
│       └── session.js
│
├── netlify.toml
├── package.json
├── .env.example
└── README.md
```

## Como funciona

### Votação

A página principal:

```text
/
```

permite escolher entre:

```text
SIM
NÃO
SE ABSTER
```

Cada votação possui um `sessionId`.

Os votos são armazenados no Netlify Blobs seguindo uma estrutura semelhante a:

```text
sessions/{sessionId}/sim/{uuid}
sessions/{sessionId}/nao/{uuid}
sessions/{sessionId}/abstencao/{uuid}
```

Cada voto é armazenado individualmente.

### Área administrativa

A administração fica disponível em:

```text
/admin/
```

Após informar a senha administrativa é possível:

* definir o título e a descrição exibidos na página de votação;
* visualizar os resultados;
* atualizar os resultados;
* encerrar a votação;
* reabrir a votação;
* resetar a votação.

Ao resetar, um novo `sessionId` é criado e a contagem volta para zero. O título e a descrição são mantidos.

## Prevenção de votos repetidos

O frontend utiliza `localStorage` para impedir que o mesmo navegador vote novamente dentro da mesma sessão.

Quando uma nova votação é criada, o `sessionId` muda e o navegador pode votar novamente normalmente.

> Este mecanismo é propositalmente simples e não deve ser considerado autenticação de eleitor.

O SimpleVote foi desenvolvido para reuniões e votações informais, e não para eleições oficiais ou situações que exijam garantia de identidade e de um único voto por pessoa.

## Desenvolvimento local

Instale as dependências:

```bash
npm install
```

Instale o Netlify CLI, caso ainda não tenha:

```bash
npm install -g netlify-cli
```

Crie um arquivo `.env` baseado no exemplo:

```bash
cp .env.example .env
```

Configure:

```text
ADMIN_PASSWORD=sua-senha
```

Depois execute:

```bash
netlify dev
```

O projeto ficará disponível normalmente em:

```text
http://localhost:8888
```

Área administrativa:

```text
http://localhost:8888/admin/
```

## Deploy no Netlify

1. Envie o projeto para o GitHub.
2. Importe o repositório no Netlify.
3. O Netlify utilizará automaticamente o `netlify.toml`.
4. Configure a variável de ambiente:

```text
ADMIN_PASSWORD
```

5. Faça o deploy.

A configuração utilizada pelo projeto é:

```toml
[build]
  publish = "public"
  functions = "netlify/functions"
```

## Rotas

### Público

```text
GET /.netlify/functions/session
```

Retorna informações sobre a votação atual (estado, `sessionId`, título e descrição).

```text
POST /.netlify/functions/vote
```

Registra um voto.

### Administração

```text
GET /.netlify/functions/results
```

Retorna os resultados da votação atual.

```text
POST /.netlify/functions/session
```

Encerra ou reabre a votação (`open`) e/ou altera o título e a descrição (`title`, `description`).

```text
POST /.netlify/functions/reset
```

Cria uma nova sessão de votação.

As rotas administrativas exigem a senha enviada pelo header:

```text
x-admin-password
```

## Uso recomendado

O SimpleVote foi pensado principalmente para situações como:

* reuniões de condomínio;
* reuniões de associação;
* decisões internas;
* pequenas assembleias;
* grupos e equipes;
* votações rápidas em eventos.

A proposta do projeto é ser simples, rápido e fácil de hospedar.

## Licença

Projeto livre para uso e adaptação conforme a necessidade.
