const express          = require('express');
const router           = express.Router();
const funilController  = require('../controllers/funilController');
const authMiddleware   = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get  ('/',                    funilController.listar);
router.patch('/:patientId/etapa',    funilController.moverEtapa);

module.exports = router;
