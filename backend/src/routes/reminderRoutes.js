const express             = require('express');
const router              = express.Router();
const reminderController  = require('../controllers/reminderController');
const authMiddleware      = require('../middlewares/authMiddleware');
const { validate, schemas } = require('../middlewares/validateMiddleware');

router.use(authMiddleware);

router.get   ('/',    reminderController.list);
router.post  ('/',    validate(schemas.reminder), reminderController.create);
router.put   ('/:id', validate(schemas.reminder), reminderController.update);
router.delete('/:id', reminderController.remove);

module.exports = router;
