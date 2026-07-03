const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, 
  },
  phone: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['Tenant', 'Owner', 'Admin'],
    default: 'Tenant',
  },
  avatar: {
    type: String,
    default: '',
  },
  verified: {
    type: Boolean,
    default: false, 
  },
  deactivated: {
    type: Boolean,
    default: false,
  },
  savedListings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoomListing',
  }]
}, {
  timestamps: true,
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
