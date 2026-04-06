// server.js — Ponto de entrada da aplicação
// Importa o app configurado e inicia o servidor na porta definida

const app  = require('./app');
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor PsiConnect rodando em http://localhost:${PORT}`);
});
