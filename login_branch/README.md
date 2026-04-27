# PsiConnect — Login Completo com Autenticação e Autorização

## Sobre esta branch

Implementação do módulo de **autenticação e autorização com criptografia**, armazenando dados no banco de dados PostgreSQL.

**Aluno:** Nathan Tavares da Silva  
**Orientador:** Prof. Alessandro Aparecido da Silva Horas  
**Curso:** Bacharelado em Engenharia de Software — UMC 2026

---

## Funcionalidade implementada

Login completo com:
- Cadastro de usuário com senha criptografada via **bcrypt** (10 rounds)
- Login com validação de credenciais e geração de **token JWT** (7 dias)
- Middleware de autenticação que protege rotas privadas
- Armazenamento seguro no **PostgreSQL** (Railway) com SSL obrigatório
- Nunca armazena senha em texto puro — apenas o hash bcrypt

---

## Estrutura dos arquivos

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Conexão com PostgreSQL (Railway)
│   ├── controllers/
│   │   └── authController.js    # Recebe req/res e chama o service
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Valida token JWT em rotas protegidas
│   │   └── errorMiddleware.js   # Tratamento global de erros
│   ├── models/
│   │   └── userModel.js         # Queries SQL na tabela users
│   ├── routes/
│   │   └── authRoutes.js        # Define os endpoints de autenticação
│   ├── services/
│   │   └── authService.js       # Lógica de negócio (bcrypt, JWT)
│   ├── utils/
│   │   └── jwtUtils.js          # Gerar e verificar tokens JWT
│   └── app.js                   # Configura o Express
├── server.js                    # Inicia o servidor
├── package.json
└── .env.example                 # Modelo de variáveis de ambiente
database.sql                     # Script para criar a tabela no banco
```

---

## Endpoints disponíveis

| Método | Rota | Autenticação | Descrição |
|--------|------|-------------|-----------|
| POST | /api/auth/register | Não | Cadastra novo psicólogo |
| POST | /api/auth/login | Não | Faz login e retorna token JWT |
| GET | /api/auth/profile | Sim (JWT) | Retorna dados do perfil |
| PUT | /api/auth/profile | Sim (JWT) | Atualiza nome, CRP e telefone |
| PUT | /api/auth/change-password | Sim (JWT) | Altera a senha |

---

## Como executar

**1. Configure o banco de dados**
- Acesse o Railway e execute o arquivo `database.sql` no Query Editor

**2. Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o .env com sua DATABASE_URL do Railway e JWT_SECRET
```

**3. Instale as dependências e rode**
```bash
cd backend
npm install
npm run dev
```

**4. Teste o endpoint de saúde**
```
GET http://localhost:3001/health
```

---

## Tecnologias utilizadas

- **Node.js + Express** — servidor e API REST
- **bcrypt** — hash seguro de senhas (nunca salva em texto puro)
- **jsonwebtoken (JWT)** — autenticação stateless
- **PostgreSQL** — banco de dados relacional
- **Railway** — hospedagem do banco em nuvem com SSL
