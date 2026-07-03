const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_1234');
    
    
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User matching token not found' });
    }
    
    if (req.user.deactivated) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }
    
    next();
  } catch (error) {
    console.error("JWT Verification error:", error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role '${req.user.role}' is not authorized to access this resource` 
      });
    }
    next();
  };
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key_1234', {
    expiresIn: '1h', 
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_key_5678', {
    expiresIn: '7d', 
  });
};

module.exports = {
  protect,
  authorize,
  generateToken,
  generateRefreshToken,
};
