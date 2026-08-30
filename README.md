# SimpleVote

Sistema de votação extremamente simples, leve e fácil de hospedar no **Netlify**.

Votação pública com três opções (**SIM**, **NÃO**, **SE ABSTER**) e uma área administrativa para acompanhar resultados, encerrar/reabrir e resetar a votação.

## Funcionalidades

- Votação pública com três opções: SIM, NÃO e SE ABSTER
- Resultados administrativos com contagem, porcentagens e barras visuais
- Reset da votação com criação de nova sessão (todos podem votar novamente)
- Sessão de votação (`sessionId`) que impede votos repetidos no mesmo navegador
- Encerrar / reabrir a votação
- Proteção administrativa por senha (`ADMIN_PASSWORD`)
- Armazenamento em Netlify Blobs — um blob por voto, sem problemas de concorrência
- Interface mobile-first, sem frameworks

## Stack

- HTML, CSS e JavaScript Vanilla
- Netlify Functions
- Netlify Blobs
- Node.js

## Estrutura

```text
simplevote/
├── public/
│   ├── index.html          # página pública de votação (/)
│   ├── style.css
│   ├── app.js
│   └── admin/
│       ├── index.html      # área administrativa (/admin/)
│       ├── admin.css
│       └── admin.js
│
├── netlify/
│   └── functions/
│       ├── lib/
│       │   └── shared.js    # helpers compartilhados (não é uma Function)
│       ├── vote.js          # POST /.netlify/functions/vote
│       ├── results.js       # GET  /.netlify/functions/results (protegida)
│       ├── reset.js         # POST /.netlify/functions/reset (protegida)
│       └── session.js       # GET/POST /.netlify/functions/session
│
├── netlify.toml
├── package.json
├── .gitignore
├── .env.example
└── README.md
```

## Como funciona

### Votação

- A página pública busca a sessão atual em `/.netlify/functions/session`.
- Se a votação estiver aberta e o navegador ainda não votou nesta sessão, os botões são habilitados.
- Cada voto é um `POST` para `/.netlify/functions/vote` com `{ "option": "sim" | "nao" | "abstencao", "sessionId": "..." }`.
- O backend valida a opção e confere se o `sessionId` enviado é o da sessão atual — se não for (ex.: o admin resetou enquanto a página estava aberta), responde `409` e o navegador re-sincroniza.
- Cada voto é um blob independente dentro da sessão atual:

```text
sessions/{sessionId}/sim/550e8400-e29b-41d4-a716-446655440000
sessions/{sessionId}/nao/...
sessions/{sessionId}/abstencao/...
```

- O navegador marca o voto em `localStorage` com a chave `simplevote_voted_{sessionId}`.
- Quando a votação é resetada, um novo `sessionId` é gerado — a chave muda e todos podem votar novamente.

### Administração

- A senha é enviada no header `x-admin-password` em todas as chamadas administrativas.
- `results` conta apenas os blobs da sessão atual por prefixo (`sessions/{id}/sim/`, `sessions/{id}/nao/`, `sessions/{id}/abstencao/`) e retorna contagens, total e estado da votação.
- `reset` é O(1): apenas troca a sessão. Os votos antigos deixam de pertencer à votação atual e a votação é reaberta.
- `session` (POST) encerra ou reabre a votação.

### Consistência

O store usa **consistência forte** (`consistency: "strong"`), então encerrar/reabrir, reset e troca de `sessionId` ficam visíveis imediatamente para todos os leitores — sem o atraso de propagação da consistência eventual.

## Desenvolvimento local

Pré-requisitos: Node.js 18+.

```bash
npm install
```

Instale o Netlify CLI (uma vez):

```bash
npm install -g netlify-cli
```

Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Edite `ADMIN_PASSWORD` no `.env` e rode:

```bash
netlify dev
```

Acesse:

- Votação: `http://localhost:8888/`
- Administração: `http://localhost:8888/admin/`

## Deploy no Netlify

1. Envie o projeto para um repositório no GitHub.
2. No Netlify, clique em **Add new site → Import an existing project**.
3. Conecte o repositório (o Netlify detecta `netlify.toml` automaticamente).
4. Em **Site configuration → Environment variables**, adicione:

   ```text
   ADMIN_PASSWORD=sua-senha-forte
   ```

5. Clique em **Deploy**.

Pronto. A cada `git push` na branch principal o site é atualizado automaticamente.

## Variáveis de ambiente

| Variável        | Obrigatória | Descrição                          |
| --------------- | ----------- | ---------------------------------- |
| `ADMIN_PASSWORD`| Sim         | Senha da área administrativa.      |

Nunca commite a senha real — use apenas o `.env.example` como referência.