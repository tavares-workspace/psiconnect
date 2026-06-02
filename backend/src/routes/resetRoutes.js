const express          = require('express');
const router           = express.Router();
const resetController  = require('../controllers/resetController');
const { loginLimit }   = require('../middlewares/rateLimitMiddleware');

router.post('/solicitar',  loginLimit, resetController.solicitarReset);
router.get ('/validar',    resetController.validarToken);
router.post('/redefinir',  resetController.redefinirSenha);

module.exports = router;
