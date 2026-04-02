// app.js — Configura o Express e registra todas as rotas
const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const path    = require('path');

dotenv.config();

const authRoutes        = require('./routes/authRoutes');
const dashboardRoutes   = require('./routes/dashboardRoutes');
const patientRoutes     = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const noteRoutes        = require('./routes/noteRoutes');
const reminderRoutes    = require('./routes/reminderRoutes');
const calendarRoutes    = require('./routes/calendarRoutes');
const prontuarioRoutes  = require('./routes/prontuarioRoutes');
const tarefaRoutes      = require('./routes/tarefaRoutes');
const funilRoutes       = require('./routes/funilRoutes');
const errorMiddleware   = require('./middlewares/errorMiddleware');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Serve os arquivos de upload (contratos) como estáticos autenticados
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

app.get('/health', (req, res) => res.json({ status: 'ok', mensagem: 'PsiConnect API rodando!' }));

app.use('/api/auth',         authRoutes);
app.use('/api/dashboard',    dashboardRoutes);
app.use('/api/patients',     patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notes',        noteRoutes);
app.use('/api/reminders',    reminderRoutes);
app.use('/api/calendar',     calendarRoutes);
app.use('/api/prontuarios',  prontuarioRoutes);
app.use('/api/tarefas',      tarefaRoutes);
app.use('/api/funil',        funilRoutes);

app.use(errorMiddleware);

module.exports = app;
