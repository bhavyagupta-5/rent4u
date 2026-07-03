const mongoose = require('mongoose');

const InterestSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoomListing',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  }
}, {
  timestamps: true,
});

InterestSchema.index({ tenant: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('Interest', InterestSchema);
