require('dotenv').config();
console.log('Loaded MONGO_URI:', process.env.MONGO_URI);
const connectDB = require('./config/db');
console.log('Connecting...');
connectDB().then(() => {
  console.log('Connected successfully!');
  process.exit(0);
}).catch(err => {
  console.error('Connection failed:', err);
  process.exit(1);
});
