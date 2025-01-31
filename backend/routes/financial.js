

// backend/routes/financial.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Class = require('../models/Class');
const { protect, authorize } = require('../middleware/auth');

// Get Total Expenses on Teacher Salaries
router.get('/expenses/teacher-salaries', protect, authorize('admin'), async (req, res, next) => {
  try {
    const totalExpenses = await User.aggregate([
      { $match: { role: 'teacher' } },
      { $group: { _id: null, totalSalary: { $sum: '$salary' } } },
    ]);

    res.json({
      totalExpenses: totalExpenses[0] ? totalExpenses[0].totalSalary : 0,
    });
  } catch (error) {
    next(error);
  }
});

// Get Total Income from Student Fees
router.get('/income/student-fees', protect, authorize('admin'), async (req, res, next) => {
  try {
    // Sum of all class fees
    const totalIncome = await Class.aggregate([
      { $group: { _id: null, totalIncome: { $sum: '$fee' } } },
    ]);

    res.json({
      totalIncome: totalIncome[0] ? totalIncome[0].totalIncome : 0,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; // Correctly export the router
