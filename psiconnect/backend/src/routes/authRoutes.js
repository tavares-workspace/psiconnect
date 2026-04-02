// Rotas de autenticação
const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas públicas (não precisam de token)
router.post('/register', authController.register);
router.post('/login',    authController.login);

// Rotas protegidas (precisam de token JWT)
router.get ('/profile',         authMiddleware, authController.getProfile);
router.put ('/profile',         authMiddleware, authController.updateProfile);
router.put ('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
