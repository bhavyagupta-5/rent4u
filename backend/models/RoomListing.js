const mongoose = require('mongoose');

const RoomListingSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  location: {
    type: String,
    required: [true, 'Please provide the listing address'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
  },
  rent: {
    type: Number,
    required: [true, 'Monthly rent is required'],
    min: [0, 'Rent cannot be negative'],
  },
  deposit: {
    type: Number,
    required: [true, 'Security deposit is required'],
    min: [0, 'Deposit cannot be negative'],
  },
  availableFrom: {
    type: Date,
    required: [true, 'Availability date is required'],
  },
  roomType: {
    type: String,
    enum: ['Single', 'Shared', 'Entire Flat'],
    required: true,
  },
  furnishing: {
    type: String,
    enum: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
    required: true,
  },
  amenities: [{
    type: String,
    trim: true,
  }],
  images: [{
    type: String, 
  }],
  status: {
    type: String,
    enum: ['available', 'filled'],
    default: 'available',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('RoomListing', RoomListingSchema);
