const mongoose = require('mongoose');

const TenantProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  preferredLocation: {
    type: String,
    required: [true, 'Preferred location is required'],
    trim: true,
  },
  budgetMin: {
    type: Number,
    required: [true, 'Minimum budget is required'],
    min: [0, 'Budget cannot be negative'],
  },
  budgetMax: {
    type: Number,
    required: [true, 'Maximum budget is required'],
    min: [0, 'Budget cannot be negative'],
  },
  moveInDate: {
    type: Date,
    required: [true, 'Preferred move-in date is required'],
  },
  occupation: {
    type: String,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer Not to Say'],
    default: 'Prefer Not to Say',
  },
  smoking: {
    type: String,
    enum: ['No', 'Yes', 'Outside Only'],
    default: 'No',
  },
  pets: {
    type: String,
    enum: ['No', 'Yes', 'Fish/Birds Only'],
    default: 'No',
  },
  foodPreference: {
    type: String,
    enum: ['Veg', 'Non-Veg', 'Any'],
    default: 'Any',
  },
  preferredBedrooms: {
    type: String,
    enum: ['Any', '1 BHK', '2 BHK', '3 BHK', 'Studio Room'],
    default: 'Any',
  },
  requiredAmenities: {
    type: [String],
    default: [],
  },
  about: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('TenantProfile', TenantProfileSchema);
