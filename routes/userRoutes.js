const express = require('express');
const { verifySession, verifyRole } = require('../middleware/auth');
 
const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshSession,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  verifyEmail,
  resendVerificationEmail
  ,forgotPassword
  ,resetPassword
} = require('../controllers/userController');

const router = express.Router();

// Public authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
// Forgot / Reset password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected session routes
router.post('/logout', verifySession, logoutUser);
router.get('/me', verifySession, getCurrentUser);  
router.get('/profile', verifySession, getCurrentUser); // Alias for /me
router.post('/refresh-session', verifySession, refreshSession);

// User CRUD routes
router.get('/', verifySession, verifyRole(['admin']), getAllUsers);
router.get('/:id', verifySession, verifyRole(['admin', 'seller', 'customer']), getUserById);
router.put('/:id', verifySession, verifyRole(['admin', 'seller', 'customer']), updateUser);
router.delete('/:id', verifySession, verifyRole(['admin']), deleteUser);

module.exports = router;

