const userModel = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId, userRole) => {
  return jwt.sign({ id: userId , role: userRole}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Generate Refresh Token (for extended sessions)
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Helper function to set session cookie
const setSessionCookie = (res, token, refreshToken) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict' // CSRF protection
  };
  
  // Set main auth token
  res.cookie('authToken', token, cookieOptions);
  
  // Set refresh token with longer expiry
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
  }
};

// Helper function to clear session cookies
const clearSessionCookies = (res) => {
  const clearOptions = {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };
  
  res.cookie('authToken', '', clearOptions);
  res.cookie('refreshToken', '', clearOptions);
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
    const { username, email, password, role } = req.body;

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
      role: role || 'customer'
    });

    // Generate tokens
    const token = generateToken(user.user_id, user.role);
    const refreshToken = generateRefreshToken(user.user_id);
    
    // Set session cookies
    setSessionCookie(res, token, refreshToken);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: sanitizeUser(user),
        token,  
        sessionCreated: true
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

    // Generate tokens
    const token = generateToken(user.user_id, user.role);
    const refreshToken = generateRefreshToken(user.user_id);
    
    // Set session cookies
    setSessionCookie(res, token, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: sanitizeUser(user),
        token, 
        sessionCreated: true
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

// @desc    Logout user and destroy session
// @route   POST /api/users/logout
// @access  Private
const logoutUser = (req, res) => {
  try {
    // Clear session cookies
    clearSessionCookies(res);
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      sessionDestroyed: true
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
};

// @desc    Get current user from session
// @route   GET /api/users/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.authToken;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No session found. Please login.',
        sessionValid: false
      });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.getUserById(decoded.id);
      
      if (!user) {
        clearSessionCookies(res);
        return res.status(401).json({
          success: false,
          message: 'User not found',
          sessionValid: false
        });
      }
      
      if (user.status === 'banned') {
        clearSessionCookies(res);
        return res.status(403).json({
          success: false,
          message: 'Account has been banned',
          sessionValid: false
        });
      }
      
      res.status(200).json({
        success: true,
        data: sanitizeUser(user),
        sessionValid: true
      });
    } catch (jwtError) {
      // Try to refresh token if main token is expired
      const refreshToken = req.cookies.refreshToken;
      
      if (refreshToken) {
        try {
          const refreshDecoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
          const user = await userModel.getUserById(refreshDecoded.id);
          
          if (user && user.status !== 'banned') {
            // Generate new tokens
            const newToken = generateToken(user.user_id, user.role);
            const newRefreshToken = generateRefreshToken(user.user_id);
            
            // Set new session cookies
            setSessionCookie(res, newToken, newRefreshToken);
            
            return res.status(200).json({
              success: true,
              data: sanitizeUser(user),
              sessionValid: true,
              sessionRefreshed: true
            });
          }
        } catch (refreshError) {
          console.error('Refresh token error:', refreshError);
        }
      }
      
      // If all fails, clear cookies and return unauthorized
      clearSessionCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.',
        sessionValid: false
      });
    }
  } catch (error) {
    console.error('Get current user error:', error);
    clearSessionCookies(res);
    res.status(500).json({
      success: false,
      message: 'Error retrieving session',
      sessionValid: false
    });
  }
};

// @desc    Refresh session
// @route   POST /api/users/refresh-session
// @access  Private
const refreshSession = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token found'
      });
    }
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await userModel.getUserById(decoded.id);
    
    if (!user || user.status === 'banned') {
      clearSessionCookies(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    
    // Generate new tokens
    const newToken = generateToken(user.user_id, user.role);
    const newRefreshToken = generateRefreshToken(user.user_id);
    
    // Set new session cookies
    setSessionCookie(res, newToken, newRefreshToken);
    
    res.status(200).json({
      success: true,
      message: 'Session refreshed successfully',
      data: {
        user: sanitizeUser(user),
        token: newToken
      }
    });
  } catch (error) {
    console.error('Refresh session error:', error);
    clearSessionCookies(res);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
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
    delete updates.role; 

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
  logoutUser,
  getCurrentUser,
  refreshSession,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};

