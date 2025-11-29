const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const EventController = require('../controllers/eventController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../uploads/events');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for event image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF, WebP)'));
    }
  },
});

// Public routes (optional auth to get participation status if logged in)
router.get('/', optionalAuth, EventController.getAllEvents);
router.get('/category/:category', EventController.getEventsByCategory);
router.get('/:id', EventController.getEventById);

// Admin routes (require admin role)
router.post('/', authenticate, authorize(['admin']), upload.single('image'), validate(schemas.createEvent), EventController.createEvent);
router.put('/:id', authenticate, authorize(['admin']), upload.single('image'), validate(schemas.updateEvent), EventController.updateEvent);
router.delete('/:id', authenticate, authorize(['admin']), EventController.deleteEvent);
router.put('/:id/status', authenticate, authorize(['admin']), validate(schemas.updateEventStatus), EventController.updateEventStatus);
router.get('/stats', authenticate, authorize(['admin']), EventController.getEventStats);

module.exports = router;
