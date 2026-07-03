const express = require('express');
const router = express.Router();
const { getConversations, getMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, sendMessage);

router.route('/conversations')
  .get(protect, getConversations);

router.route('/conversations/:id/messages')
  .get(protect, getMessages);

module.exports = router;
