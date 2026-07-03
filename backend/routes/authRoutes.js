const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  logout, 
  refresh, 
  forgotPassword, 
  resetPassword, 
  getMe, 
  updateProfile,
  verifyUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/forgot', forgotPassword);
router.post('/reset/:token', resetPassword);

const { upload } = require('../middleware/uploadMiddleware');

router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('avatarFile'), updateProfile);
router.post('/verify', protect, verifyUser);

module.exports = router;
