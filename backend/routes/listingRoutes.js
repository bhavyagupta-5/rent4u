const express = require('express');
const router = express.Router();
const { 
  getListings, 
  getListingById, 
  createListing, 
  updateListing, 
  deleteListing, 
  toggleSaveListing,
  generateDescription,
  getSavedListings
} = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.route('/')
  .get(getListings)
  .post(protect, authorize('Owner', 'Admin'), upload.array('images', 5), createListing);

router.post('/generate-description', protect, authorize('Owner', 'Admin'), generateDescription);

router.get('/wishlist', protect, authorize('Tenant'), getSavedListings);

router.route('/:id')
  .get(getListingById)
  .put(protect, authorize('Owner', 'Admin'), upload.array('images', 5), updateListing)
  .delete(protect, authorize('Owner', 'Admin'), deleteListing);

router.post('/:id/wishlist', protect, authorize('Tenant'), toggleSaveListing);

module.exports = router;
