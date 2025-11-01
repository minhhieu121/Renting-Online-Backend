const userModel = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Helper function to remove password from user object
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password, fullName, phone, role } = req.body;

    // Check if user already exists
    const userExists = await userModel.getUserByEmail(email);

    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    // Check username
    const usernameExists = await userModel.getUserByUsername(username);

    if (usernameExists) {
      return res.status(400).json({ 
        success: false,
        message: 'Username is already taken' 
      });
    }

    // Create user
    const user = await userModel.createUser({
      username,
      email,
      password,
      fullName,
      phone,
      role: role || 'customer'
    });

    const token = generateToken(user.user_id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: sanitizeUser(user),
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error registering user',
      error: error.message 
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await userModel.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check if user is banned
    if (user.status === 'banned') {
      return res.status(403).json({ 
        success: false,
        message: 'Your account has been banned' 
      });
    }

    // Check password
    const isPasswordValid = await userModel.comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Update last login
    await userModel.updateLastLogin(user.user_id);

    const token = generateToken(user.user_id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: sanitizeUser(user),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error logging in',
      error: error.message 
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Public
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    const offset = (page - 1) * limit;

    const filters = { role, status, search, limit: parseInt(limit), offset: parseInt(offset) };

    const users = await userModel.searchUsers(filters);
    const total = await userModel.countUsers(filters);

    // Remove password from all users
    const sanitizedUsers = users.map(sanitizeUser);

    res.status(200).json({
      success: true,
      data: {
        users: sanitizedUsers,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching users',
      error: error.message 
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.getUserById(id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user',
      error: error.message 
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating certain fields via this endpoint
    delete updates.user_id;
    delete updates.password;
    delete updates.created_at;
    delete updates.updated_at;

    const user = await userModel.getUserById(id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const updatedUser = await userModel.updateUser(id, updates);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: sanitizeUser(updatedUser)
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating user',
      error: error.message 
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.getUserById(id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    await userModel.deleteUser(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting user',
      error: error.message 
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};

