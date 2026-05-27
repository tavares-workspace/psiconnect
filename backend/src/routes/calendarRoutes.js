const express            = require('express');
const router             = express.Router();
const calendarController = require('../controllers/calendarController');
const authMiddleware     = require('../middlewares/authMiddleware');

router.get   ('/auth-url',   authMiddleware, calendarController.getAuthUrl);
router.get   ('/status',     authMiddleware, calendarController.getStatus);
router.delete('/disconnect', authMiddleware, calendarController.disconnect);

router.get('/callback', calendarController.handleCallback);

module.exports = router;
