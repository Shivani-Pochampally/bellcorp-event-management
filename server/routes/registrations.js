const express = require('express');
const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
} = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/my', getMyRegistrations);
router.post('/:eventId', registerForEvent);
router.delete('/:eventId', cancelRegistration);

module.exports = router;
