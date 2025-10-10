const express = require('express');
const ParticipantController = require('../controllers/participantController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// User routes (require authentication)
router.post('/join/:eventId', authenticate, authorize(['user']), validate(schemas.joinEvent), ParticipantController.joinEvent);
router.delete('/leave/:eventId', authenticate, authorize(['user']), ParticipantController.leaveEvent);
router.get('/my-events', authenticate, authorize(['user']), ParticipantController.getMyEvents);
router.get('/event/:eventId', authenticate, authorize(['admin', 'user']), ParticipantController.getEventParticipants);

// Admin routes (require admin role)
router.get('/pending', authenticate, authorize(['admin']), ParticipantController.getAllPendingParticipants);
router.get('/stats', authenticate, authorize(['admin']), ParticipantController.getParticipantStats);
router.get('/:id', authenticate, authorize(['admin']), ParticipantController.getParticipantById);
router.put('/:id', authenticate, authorize(['admin']), validate(schemas.updateParticipant), ParticipantController.updateParticipant);
router.delete('/:id', authenticate, authorize(['admin']), ParticipantController.deleteParticipant);
router.put('/:id/approve', authenticate, authorize(['admin']), validate(schemas.approveParticipant), ParticipantController.approveParticipant);
router.put('/:id/reject', authenticate, authorize(['admin']), validate(schemas.rejectParticipant), ParticipantController.rejectParticipant);
router.put('/bulk-approve', authenticate, authorize(['admin']), validate(schemas.bulkApproveParticipants), ParticipantController.bulkApproveParticipants);

module.exports = router;

