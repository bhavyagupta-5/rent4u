const express = require('express');
const router = express.Router();
const { sendInterest, updateInterestStatus, getInterests } = require('../controllers/interestController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('Tenant'), sendInterest)
  .get(protect, getInterests);

router.route('/:id')
  .patch(protect, authorize('Owner'), updateInterestStatus);

module.exports = router;
