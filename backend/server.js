// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');

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
  process.exit(1); // Exit process with failure
});

// Middleware to parse JSON
app.use(express.json());

// ✅ Fix CORS to Allow Credentials
app.use(cors({
  origin: ['https://school-crm-cuvette.vercel.app'],
  credentials: true,
}));

// ✅ Configure Secure Session with MongoDB Store
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI, // Store sessions in MongoDB
    collectionName: 'sessions',
  }),
  cookie: {
    secure: true, // ✅ Set to true for HTTPS
    httpOnly: true,
    sameSite: "none", // ✅ Required for cross-origin cookies
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
}));

// ✅ Debugging Route to Check Session
app.get('/api/check-session', (req, res) => {
  if (req.session.user) {
    return res.json({ session: req.session.user });
  }
  return res.status(401).json({ message: "No active session" });
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
