const express           = require('express');
const router            = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware    = require('../middlewares/authMiddleware');

// Todas as rotas de pacientes exigem autenticação
router.use(authMiddleware);

router.get   ('/',    patientController.list);
router.get   ('/:id', patientController.get);
router.post  ('/',    patientController.create);
router.put   ('/:id', patientController.update);
router.delete('/:id', patientController.remove);

module.exports = router;
