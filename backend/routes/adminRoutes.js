const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getUsers, 
  toggleUserStatus, 
  deleteListing, 
  getActivityLogs,
  getListings
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('Admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.patch('/users/:id/status', toggleUserStatus);
router.get('/listings', getListings);
router.delete('/listings/:id', deleteListing);
router.get('/activity-logs', getActivityLogs);

module.exports = router;
