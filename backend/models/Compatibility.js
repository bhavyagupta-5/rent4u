const mongoose = require('mongoose');

const CompatibilitySchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoomListing',
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  explanation: {
    type: String,
    required: true,
  },
  generatedBy: {
    type: String,
    enum: ['grok', 'fallback'],
    default: 'grok',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

CompatibilitySchema.index({ tenant: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('Compatibility', CompatibilitySchema);
