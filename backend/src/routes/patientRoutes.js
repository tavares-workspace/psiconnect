const express           = require('express');
const router            = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware    = require('../middlewares/authMiddleware');
const { validate, schemas } = require('../middlewares/validateMiddleware');

router.use(authMiddleware);

router.get ('/',     patientController.list);
router.get ('/:id',  patientController.get);
router.post('/',     validate(schemas.patient), patientController.create);
router.put ('/:id',  validate(schemas.patient), patientController.update);
router.delete('/:id',patientController.remove);

module.exports = router;
