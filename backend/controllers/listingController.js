const RoomListing = require('../models/RoomListing');
const User = require('../models/User');
const Interest = require('../models/Interest');
const Compatibility = require('../models/Compatibility');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/uploadMiddleware');

exports.getListings = async (req, res) => {
  try {
    const { 
      search, 
      city, 
      state, 
      minRent, 
      maxRent, 
      roomType, 
      furnishing, 
      amenities, 
      availableFrom,
      sort, 
      page = 1, 
      limit = 10 
    } = req.query;

    const query = { status: 'available' };

    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (state) {
      query.state = { $regex: state, $options: 'i' };
    }

    
    if (minRent || maxRent) {
      query.rent = {};
      if (minRent) query.rent.$gte = Number(minRent);
      if (maxRent) query.rent.$lte = Number(maxRent);
    }

    
    if (roomType) {
      query.roomType = roomType;
    }

    
    if (furnishing) {
      query.furnishing = furnishing;
    }

    
    if (amenities) {
      const amenitiesList = amenities.split(',').map(a => a.trim());
      query.amenities = { $all: amenitiesList };
    }

    
    if (availableFrom) {
      query.availableFrom = { $lte: new Date(availableFrom) };
    }

    
    let dbQuery = RoomListing.find(query).populate('owner', 'name email avatar verified');

    
    if (sort) {
      const sortBy = sort.split(',').join(' ');
      dbQuery = dbQuery.sort(sortBy);
    } else {
      dbQuery = dbQuery.sort('-createdAt');
    }

    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    dbQuery = dbQuery.skip(skip).limit(limitNum);

    const listings = await dbQuery;
    const total = await RoomListing.countDocuments(query);

    res.status(200).json({
      success: true,
      count: listings.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: listings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getListingById = async (req, res) => {
  try {
    const listing = await RoomListing.findById(req.params.id)
      .populate('owner', 'name email phone avatar verified');
    
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.status(200).json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createListing = async (req, res) => {
  try {
    
    req.body.owner = req.user.id;

    
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        imageUrls.push(url);
      }
    }
    req.body.images = imageUrls;

    
    if (typeof req.body.amenities === 'string') {
      try {
        req.body.amenities = JSON.parse(req.body.amenities);
      } catch (e) {
        req.body.amenities = req.body.amenities.split(',').map(a => a.trim());
      }
    }

    
    req.body.latitude = req.body.latitude ? Number(req.body.latitude) : (37.7749 + (Math.random() - 0.5) * 0.1);
    req.body.longitude = req.body.longitude ? Number(req.body.longitude) : (-122.4194 + (Math.random() - 0.5) * 0.1);

    const listing = await RoomListing.create(req.body);

    try {
      const { getIO } = require('../services/socketService');
      const io = getIO();
      if (io) {
        io.emit('new_listing', { listingId: listing._id });
      }
    } catch (e) {
      console.warn("Socket broadcast failed in createListing:", e.message);
    }

    res.status(201).json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateListing = async (req, res) => {
  try {
    let listing = await RoomListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    
    if (listing.owner.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this listing' });
    }

    
    if (typeof req.body.amenities === 'string') {
      try {
        req.body.amenities = JSON.parse(req.body.amenities);
      } catch (e) {
        req.body.amenities = req.body.amenities.split(',').map(a => a.trim());
      }
    }

    
    let finalImages = listing.images;
    if (req.body.deletedImages) {
      const deleteList = typeof req.body.deletedImages === 'string' ? [req.body.deletedImages] : req.body.deletedImages;
      for (const imgUrl of deleteList) {
        await deleteFromCloudinary(imgUrl);
        finalImages = finalImages.filter(url => url !== imgUrl);
      }
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        finalImages.push(url);
      }
    }
    req.body.images = finalImages;

    listing = await RoomListing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = await RoomListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    
    if (listing.owner.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    
    if (listing.images && listing.images.length > 0) {
      for (const url of listing.images) {
        await deleteFromCloudinary(url);
      }
    }

    
    await RoomListing.findByIdAndDelete(req.params.id);

    
    await Interest.deleteMany({ listing: req.params.id });
    await Compatibility.deleteMany({ listing: req.params.id });

    res.status(200).json({ success: true, message: 'Listing and linked references deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleSaveListing = async (req, res) => {
  try {
    const listingId = req.params.id;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const listing = await RoomListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const isSaved = user.savedListings.includes(listingId);
    if (isSaved) {
      user.savedListings = user.savedListings.filter(id => id.toString() !== listingId);
      await user.save();
      return res.status(200).json({ success: true, saved: false, message: 'Listing removed from saved wishlist' });
    } else {
      user.savedListings.push(listingId);
      await user.save();
      return res.status(200).json({ success: true, saved: true, message: 'Listing saved to wishlist' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.generateDescription = async (req, res) => {
  try {
    const { title, city, roomType, rent, amenities, furnishing } = req.body;
    const grokService = require('../services/grokService');
    const result = await grokService.generateListingDescription({
      title,
      city,
      roomType,
      rent,
      amenities,
      furnishing
    });
    res.status(200).json({ success: true, data: result.description });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSavedListings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedListings',
      populate: { path: 'owner', select: 'name email avatar verified' }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user.savedListings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

