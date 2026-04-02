const express            = require('express');
const router             = express.Router();
const reminderController = require('../controllers/reminderController');
const authMiddleware     = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get   ('/',    reminderController.list);
router.post  ('/',    reminderController.create);
router.put   ('/:id', reminderController.update);
router.delete('/:id', reminderController.remove);

module.exports = router;
