const express               = require('express');
const router                = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware        = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get  ('/',                    appointmentController.list);
router.get  ('/:id',                 appointmentController.get);
router.post ('/',                    appointmentController.create);
router.put  ('/:id',                 appointmentController.update);
router.patch('/:id/cancel',          appointmentController.cancel);
router.patch('/:id/complete',        appointmentController.complete);

module.exports = router;
