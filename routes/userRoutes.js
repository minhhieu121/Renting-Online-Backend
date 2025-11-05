const express = require('express');
const { verifySession, verifyRole } = require('../middleware/auth');
 
const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshSession,
  checkSessionStatus,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const router = express.Router();

// Public authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected session routes
router.post('/logout', verifySession, logoutUser);
router.get('/me', verifySession, getCurrentUser);  
router.post('/refresh-session', verifySession, refreshSession);

// User CRUD routes
router.get('/', verifySession, verifyRole(['admin']), getAllUsers);
router.get('/:id', verifySession, verifyRole(['admin', 'seller', 'customer']), getUserById);
router.put('/:id', verifySession, verifyRole(['admin', 'seller', 'customer']), updateUser);
router.delete('/:id', verifySession, verifyRole(['admin']), deleteUser);

module.exports = router;

