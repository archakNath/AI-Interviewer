// backend/routes/userRoutes.js
import express from 'express';
import User from '../models/user.model.js';

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email ? 'Email already exists' : 'Username already exists'
      });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully!' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ error: 'Failed to create user' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({ 
      message: 'Login successful', 
      userId: user._id,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user details by ID
router.get('/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).select('-password'); // omit password
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error('Fetch user error:', err);
    res.status(400).json({ error: 'Failed to fetch user details' });
  }
});

// Update user details (username and email only)
router.put('/:id', async (req, res) => {
  const userId = req.params.id;
  const { username, email } = req.body;

  try {
    // Validate input
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    if (username.trim().length < 2) {
      return res.status(400).json({ error: 'Username must be at least 2 characters long' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Check if username or email already exists (excluding current user)
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: userId } }, // Exclude current user
        {
          $or: [
            { email: email.trim() },
            { username: username.trim() }
          ]
        }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === email.trim() 
          ? 'Email already exists' 
          : 'Username already exists'
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username: username.trim(),
        email: email.trim(),
        updatedAt: new Date()
      },
      {
        new: true, // Return updated document
        runValidators: true // Run mongoose validators
      }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (err) {
    console.error('Update user error:', err);
    
    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: Object.values(err.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ error: 'Failed to update user details' });
  }
});

// Change password route
router.put('/:id/password', async (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All password fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    // Find user and verify current password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.password !== currentPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    user.updatedAt = new Date();
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });

  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

export default router;