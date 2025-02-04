// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');

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
  process.exit(1); // Exit process with failure
});

// Middleware to parse JSON
app.use(express.json());

// CORS config: allow your vercel URL + local dev
const allowedOrigins = [
  'https://school-crm-cuvette-hq5gapiwx-jadhavakashofficials-projects.vercel.app',
  'https://school-crm-cuvette.vercel.app/',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);
    if (!allowedOrigins.includes(origin)) {
      return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Session config
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24,
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
