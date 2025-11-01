const express = require('express');
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const router = express.Router();

// Authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// User CRUD routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

