import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from './models/User.js';
import Transaction from './models/Transaction.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campuscash');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// ========== AUTH ROUTES ==========

// Register
app.post('/api/auth/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    user = new User({ name, email, password });
    await user.save();

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        budget: user.budget
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        budget: user.budget
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== TRANSACTION ROUTES ==========

// Get all transactions for user
app.get('/api/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.userId })
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get transaction by ID
app.get('/api/transactions/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create transaction
app.post('/api/transactions', [
  auth,
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { amount, category, type, note } = req.body;

    const transaction = new Transaction({
      user: req.userId,
      amount,
      category,
      type,
      note: note || ''
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update transaction
app.put('/api/transactions/:id', [
  auth,
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const { amount, category, type, note } = req.body;

    if (amount !== undefined) transaction.amount = amount;
    if (category) transaction.category = category;
    if (type) transaction.type = type;
    if (note !== undefined) transaction.note = note;

    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete transaction
app.delete('/api/transactions/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== STATS ROUTES ==========

// Get user statistics
app.get('/api/stats', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.userId });

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    // Category breakdown
    const categoryBreakdown = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!categoryBreakdown[t.category]) {
          categoryBreakdown[t.category] = 0;
        }
        categoryBreakdown[t.category] += t.amount;
      });

    res.json({
      totalIncome,
      totalExpenses,
      balance,
      categoryBreakdown,
      transactionCount: transactions.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== USER SETTINGS ==========

// Update user budget
app.put('/api/user/budget', [
  auth,
  body('budget').isNumeric().withMessage('Budget must be a number')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.userId);
    user.budget = req.body.budget;
    await user.save();
    res.json({ budget: user.budget });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CampusCash API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});