const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validate, schemas } = require('../middlewares/validateMiddleware');
const { loginLimit } = require('../middlewares/rateLimitMiddleware');

router.post('/register',         validate(schemas.register), authController.register);
router.post('/login',            loginLimit, validate(schemas.login), authController.login);
router.get ('/profile',          authMiddleware, authController.getProfile);
router.put ('/profile',          authMiddleware, authController.updateProfile);
router.put ('/change-password',  authMiddleware, authController.changePassword);
router.delete('/account',        authMiddleware, authController.deleteAccount);

module.exports = router;
