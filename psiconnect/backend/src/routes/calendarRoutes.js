const express            = require('express');
const router             = express.Router();
const calendarController = require('../controllers/calendarController');
const authMiddleware     = require('../middlewares/authMiddleware');

// auth-url, status e disconnect exigem login normalmente
router.get   ('/auth-url',   authMiddleware, calendarController.getAuthUrl);
router.get   ('/status',     authMiddleware, calendarController.getStatus);
router.delete('/disconnect', authMiddleware, calendarController.disconnect);

// callback NÃO tem authMiddleware
// Google redireciona sem token no header
// O userId é recuperado pelo parâmetro "state" que envia na URL de autorização
router.get('/callback', calendarController.handleCallback);

module.exports = router;
