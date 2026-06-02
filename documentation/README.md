# PsiConnect — CRM para Psicólogos

Sistema web para psicólogos autônomos gerenciarem pacientes, consultas, histórico clínico e lembretes.

---

## Tecnologias utilizadas

- **Front-end:** React 18 + Vite + Tailwind CSS
- **Back-end:** Node.js + Express
- **Banco de dados:** PostgreSQL (hospedado no Railway)
- **Autenticação:** JWT + bcrypt
- **Integração:** Google Calendar API (OAuth 2.0)

---

## Como rodar o projeto localmente

### Pré-requisitos
- Node.js instalado (versão 18 ou superior)
- npm instalado

---

### Passo 1 — Preparar o banco de dados

O banco já está hospedado no Railway. Você só precisa criar as tabelas:

1. Acesse [railway.app](https://railway.app) e abra o projeto
2. Clique no serviço PostgreSQL → aba **Query**
3. Cole o conteúdo do arquivo `documentation/schema.sql`
4. Clique em **Run Query**

---

### Passo 2 — Iniciar o back-end

```bash
# Entre na pasta do back-end
cd backend

# Instale as dependências
npm install

# Inicie o servidor em modo de desenvolvimento
npm run dev
```

O servidor vai rodar em: `http://localhost:3001`

Para confirmar que está funcionando, acesse: `http://localhost:3001/health`

---

### Passo 3 — Iniciar o front-end

Abra outro terminal:

```bash
# Entre na pasta do front-end
cd frontend

# Instale as dependências
npm install

# Inicie o front-end
npm run dev
```

O front-end vai rodar em: `http://localhost:5173`

---

## Padrão arquitetural MVC (back-end)

O back-end segue o padrão MVC em camadas:

```
Requisição HTTP
      ↓
   Routes        → define o endpoint e aplica o middleware de autenticação
      ↓
  Controllers    → recebe req e res, chama o service
      ↓
   Services      → contém a regra de negócio
      ↓
    Models       → executa a query SQL no banco
      ↓
  PostgreSQL     → retorna os dados
```

### Por que separar assim?
- **Routes**: sabe apenas qual URL chama qual controller
- **Controllers**: sabe apenas como responder a uma requisição HTTP
- **Services**: sabe apenas as regras do negócio (validações, lógica)
- **Models**: sabe apenas como falar com o banco de dados

---

## Estrutura de pastas

```
psiconnect/
├── backend/
│   └── src/
│       ├── config/        → conexão com o banco
│       ├── controllers/   → recebem req/res
│       ├── middlewares/   → autenticação JWT e erros
│       ├── models/        → queries SQL
│       ├── routes/        → endpoints
│       ├── services/      → regras de negócio
│       ├── utils/         → funções auxiliares
│       ├── app.js         → configura o Express
│       └── server.js      → inicia o servidor
│
├── frontend/
│   └── src/
│       ├── components/    → componentes reutilizáveis
│       ├── pages/         → telas do sistema
│       ├── routes/        → controle de rotas
│       ├── services/      → chamadas à API
│       └── utils/         → funções auxiliares
│
└── documentation/
    ├── schema.sql         → script do banco
    └── README.md          → este arquivo
```

---

## Principais endpoints da API

| Método | Rota                              | O que faz                  |
|--------|-----------------------------------|----------------------------|
| POST   | /api/auth/register                | Cadastrar psicólogo        |
| POST   | /api/auth/login                   | Fazer login                |
| GET    | /api/dashboard                    | Dados do painel            |
| GET    | /api/patients                     | Listar pacientes           |
| POST   | /api/patients                     | Cadastrar paciente         |
| PUT    | /api/patients/:id                 | Editar paciente            |
| DELETE | /api/patients/:id                 | Remover paciente           |
| GET    | /api/appointments                 | Listar consultas           |
| POST   | /api/appointments                 | Agendar consulta           |
| PATCH  | /api/appointments/:id/cancel      | Cancelar consulta          |
| PATCH  | /api/appointments/:id/complete    | Marcar como realizada      |
| GET    | /api/notes/patient/:id            | Histórico do paciente      |
| POST   | /api/notes/appointment/:id        | Criar anotação             |
| GET    | /api/reminders                    | Listar lembretes           |
| POST   | /api/reminders                    | Criar lembrete             |
| PUT    | /api/reminders/:id                | Atualizar lembrete         |

---

## Segurança

- Senhas sempre salvas com **bcrypt** (nunca em texto puro)
- Rotas protegidas verificam o **token JWT** antes de processar
- Cada usuário só acessa seus próprios dados (filtro por `user_id`)
- Conexão com banco usa **SSL** em produção
