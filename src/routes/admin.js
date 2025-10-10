const express = require('express');
const AdminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize(['admin']));

// Main dashboard route - returns all dashboard data
router.get('/dashboard', AdminController.getDashboard);

// Individual statistics routes
router.get('/dashboard/users/stats', AdminController.getUserStats);
router.get('/dashboard/events/stats', AdminController.getEventStats);
router.get('/dashboard/participants/stats', AdminController.getParticipantStats);

// Chart data routes
router.get('/dashboard/charts/users-distribution', AdminController.getUsersDistributionChart);
router.get('/dashboard/charts/monthly-users-events', AdminController.getMonthlyUsersEventsChart);
router.get('/dashboard/charts/monthly-participants', AdminController.getMonthlyParticipantsChart);

// Additional dashboard data routes
router.get('/dashboard/recent-activities', AdminController.getRecentActivities);
router.get('/dashboard/events/upcoming', AdminController.getUpcomingEvents);
router.get('/dashboard/events/popular', AdminController.getMostPopularEvents);
router.get('/dashboard/participants/pending', AdminController.getPendingApprovals);

module.exports = router;
