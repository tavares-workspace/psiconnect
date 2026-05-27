const express               = require('express');
const router                = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware        = require('../middlewares/authMiddleware');
const { validate, schemas } = require('../middlewares/validateMiddleware');

router.use(authMiddleware);

router.get   ('/',             appointmentController.listar);
router.get   ('/:id',          appointmentController.buscarPorId);
router.post  ('/',             validate(schemas.appointment), appointmentController.criar);
router.put   ('/:id',          validate(schemas.appointment), appointmentController.atualizar);
router.delete('/:id',          appointmentController.cancelar);
router.patch ('/:id/complete', appointmentController.concluir);

module.exports = router;
