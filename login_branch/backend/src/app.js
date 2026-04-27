// app.js — Servidor Express com módulo de autenticação
const express      = require('express');
const cors         = require('cors');
const dotenv       = require('dotenv');
const authRoutes   = require('./routes/authRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Rota de verificação — útil para confirmar que o servidor está rodando
app.get('/health', (req, res) => res.json({ status: 'ok', sistema: 'PsiConnect' }));

// Rotas de autenticação
app.use('/api/auth', authRoutes);

// Middleware de erros — sempre por último
app.use(errorMiddleware);

module.exports = app;
