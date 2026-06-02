const express           = require('express');
const router            = express.Router();
const tarefaController  = require('../controllers/tarefaController');
const authMiddleware    = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get  ('/',              tarefaController.listar);
router.post ('/verificar',     tarefaController.verificar);
router.patch('/:id/concluir',  tarefaController.marcarFeita);
router.delete('/:id',          tarefaController.remover);

module.exports = router;
