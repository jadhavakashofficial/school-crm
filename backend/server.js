// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Address Mongoose Deprecation Warning
mongoose.set('strictQuery', false);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => {
  console.error('MongoDB connection error:', error.message);
  process.exit(1);
});

// Middleware to parse JSON
app.use(express.json());

// Define allowed origins (both production and development)
const allowedOrigins = [
  'https://school-crm-cuvette.vercel.app', // Deployed frontend URL
  'http://localhost:3000',                // Local development URL
];

// Configure CORS to allow requests from the allowed origins
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Allow cookies to be sent
}));

// Configure Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret', // Use a strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
    httpOnly: true,
    // For cross-site cookies, if in production, set sameSite to "none"
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
}));

// Placeholder Route
app.get('/', (req, res) => {
  res.send('Welcome to the School CRM Backend!');
});

// Import Routes
const authRoutes = require('./routes/auth');
const teacherRoutes = require('./routes/teachers');
const studentRoutes = require('./routes/students');
const classRoutes = require('./routes/classes');
const financialRoutes = require('./routes/financial');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/financial', financialRoutes);

// Error Handling Middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
