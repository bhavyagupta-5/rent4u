require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { configureCloudinary } = require('./config/cloudinary');
const { initSocket } = require('./services/socketService');
const errorHandler = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const interestRoutes = require('./routes/interestRoutes');
const messageRoutes = require('./routes/messageRoutes');
const compatibilityRoutes = require('./routes/compatibilityRoutes');
const adminRoutes = require('./routes/adminRoutes');

connectDB();

configureCloudinary();

const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(helmet());
app.use(mongoSanitize());

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'https://renthour-ai.vercel.app' 
];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/interest', interestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/compatibility', compatibilityRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'RentHour AI API is running successfully' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
