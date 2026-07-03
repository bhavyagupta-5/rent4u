const User = require('../models/User');
const TenantProfile = require('../models/TenantProfile');
const crypto = require('crypto');
const { generateToken, generateRefreshToken } = require('../middleware/authMiddleware');

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'Tenant',
    });

    
    if (user.role === 'Tenant') {
      await TenantProfile.create({
        user: user._id,
        preferredLocation: 'Not specified yet',
        budgetMin: 0,
        budgetMax: 10000,
        moveInDate: new Date(),
      });
    }

    
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        verified: user.verified,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.deactivated) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }

    
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        verified: user.verified,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token not found' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_key_5678');
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const token = generateToken(user._id);
    res.status(200).json({ success: true, token });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email' });
    }

    
    const jwt = require('jsonwebtoken');
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret_key_1234', {
      expiresIn: '10m'
    });

    
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset/${resetToken}`;
    console.log(`Password reset link (Stateless JWT): ${resetUrl}`);

    
    
    res.status(200).json({
      success: true,
      message: 'Email sent with reset link (logged in server console)',
      resetToken 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_1234');

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid token or user not found' });
    }

    user.password = password; 
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Token is invalid or has expired' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let tenantProfile = null;

    if (user.role === 'Tenant') {
      tenantProfile = await TenantProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      tenantProfile
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, ...profileDetails } = req.body;

    
    const user = await User.findById(req.user.id);
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    await user.save();

    let tenantProfile = null;
    if (user.role === 'Tenant') {
      
      tenantProfile = await TenantProfile.findOneAndUpdate(
        { user: user._id },
        { ...profileDetails },
        { new: true, runValidators: true, upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
      tenantProfile
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.verified = true;
    await user.save();

    
    const ActivityLog = require('../models/ActivityLog');
    await ActivityLog.create({
      user: user._id,
      action: 'USER_VERIFIED',
      target: user.name,
      details: `${user.name} completed identity document upload and verification checklist.`
    });

    res.status(200).json({ success: true, message: 'Identity verified successfully!', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

