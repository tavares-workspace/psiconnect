const app  = require('./src/app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 PsiConnect rodando em http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponíveis:`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/auth/profile  (requer token JWT)`);
  console.log(`   PUT  /api/auth/profile  (requer token JWT)`);
  console.log(`   PUT  /api/auth/change-password (requer token JWT)`);
});
