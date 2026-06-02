const express        = require('express');
const router         = express.Router();
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get   ('/appointment/:appointmentId', noteController.listByAppointment);
router.post  ('/appointment/:appointmentId', noteController.create);
router.get   ('/patient/:patientId',         noteController.listByPatient);
router.put   ('/:id',                        noteController.update);
router.delete('/:id',                        noteController.remove);

module.exports = router;
