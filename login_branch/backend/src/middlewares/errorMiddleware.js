function errorMiddleware(err, req, res, next) {
  console.error('Erro na aplicação:', err.message);
  console.error(err.stack); // mostra onde o erro ocorreu

  const status  = err.status  || 500;
  const message = err.message || 'Erro interno do servidor.';

  // Erro do multer (upload de arquivo)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Arquivo muito grande. Máximo permitido: 10MB.' });
  }

  res.status(status).json({ message });
}

module.exports = errorMiddleware;
