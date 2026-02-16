const express = require('express');
const { getEvents, getEventById, getFilterOptions } = require('../controllers/eventController');
const { optionalProtect } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalProtect, getEvents);
router.get('/filters', getFilterOptions);
router.get('/:id', optionalProtect, getEventById);

module.exports = router;
