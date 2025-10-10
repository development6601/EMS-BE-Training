const express = require('express');
const UserController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Admin routes (require admin role)
router.get('/', authenticate, authorize(['admin']), UserController.getAllUsers);
router.get('/stats', authenticate, authorize(['admin']), UserController.getUserStats);
router.get('/:id', authenticate, authorize(['admin']), UserController.getUserById);
router.put('/:id', authenticate, authorize(['admin']), validate(schemas.updateUser), UserController.updateUser);
router.delete('/:id', authenticate, authorize(['admin']), UserController.deleteUser);
router.put('/:id/block', authenticate, authorize(['admin']), validate(schemas.toggleBlock), UserController.toggleUserBlock);

// User profile routes (require authentication)
router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, validate(schemas.updateProfile), UserController.updateProfile);

module.exports = router;
