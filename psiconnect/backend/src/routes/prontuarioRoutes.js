const express              = require('express');
const router               = express.Router();
const multer               = require('multer');
const path                 = require('path');
const fs                   = require('fs');
const prontuarioController = require('../controllers/prontuarioController');
const authMiddleware       = require('../middlewares/authMiddleware');

// Garante que a pasta de uploads existe
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Remove caracteres especiais do nome original
    const nomeSeguro = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const nome = Date.now() + '_' + nomeSeguro;
    cb(null, nome);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const tiposAceitos = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (tiposAceitos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas PDF e Word (.doc, .docx) são aceitos.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.use(authMiddleware);

router.get ('/:patientId',          prontuarioController.buscar);
router.post('/:patientId',          upload.single('contrato'), prontuarioController.salvar);
router.get ('/:patientId/download-evolucao', prontuarioController.downloadEvolucao);
router.get ('/:patientId/download', prontuarioController.downloadContrato);

module.exports = router;
