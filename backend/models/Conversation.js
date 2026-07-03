const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoomListing',
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Conversation', ConversationSchema);
