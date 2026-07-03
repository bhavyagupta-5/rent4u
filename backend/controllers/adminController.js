const User = require('../models/User');
const RoomListing = require('../models/RoomListing');
const Interest = require('../models/Interest');
const Conversation = require('../models/Conversation');
const Compatibility = require('../models/Compatibility');
const ActivityLog = require('../models/ActivityLog');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const tenantsCount = await User.countDocuments({ role: 'Tenant' });
    const ownersCount = await User.countDocuments({ role: 'Owner' });
    const adminsCount = await User.countDocuments({ role: 'Admin' });

    const totalListings = await RoomListing.countDocuments();
    const availableListings = await RoomListing.countDocuments({ status: 'available' });
    const filledListings = await RoomListing.countDocuments({ status: 'filled' });

    const totalInterests = await Interest.countDocuments();
    const acceptedInterests = await Interest.countDocuments({ status: 'accepted' });
    const pendingInterests = await Interest.countDocuments({ status: 'pending' });

    const totalChats = await Conversation.countDocuments();

    
    const compatibilityAgg = await Compatibility.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]);
    const averageScore = compatibilityAgg.length > 0 ? Math.round(compatibilityAgg[0].avgScore) : 0;

    res.status(200).json({
      success: true,
      stats: {
        users: { total: totalUsers, tenants: tenantsCount, owners: ownersCount, admins: adminsCount },
        listings: { total: totalListings, available: availableListings, filled: filledListings },
        interests: { total: totalInterests, accepted: acceptedInterests, pending: pendingInterests },
        chats: { total: totalChats },
        averageScore
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: users
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'Admin') {
      return res.status(400).json({ success: false, message: 'Cannot change status of another Admin' });
    }

    
    
    
    
    
    user.deactivated = user.deactivated === true ? false : true;
    await user.save();

    
    await ActivityLog.create({
      user: req.user.id,
      action: user.deactivated ? 'USER_DEACTIVATED' : 'USER_REACTIVATED',
      target: user.name,
      details: `Admin changed status of ${user.email} to ${user.deactivated ? 'deactivated' : 'active'}`
    });

    res.status(200).json({ 
      success: true, 
      message: `User is now ${user.deactivated ? 'deactivated' : 'activated'}`,
      data: user 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await RoomListing.findById(id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    await RoomListing.findByIdAndDelete(id);

    
    await Interest.deleteMany({ listing: id });
    await Compatibility.deleteMany({ listing: id });

    
    await ActivityLog.create({
      user: req.user.id,
      action: 'LISTING_DELETED',
      target: listing.title,
      details: `Admin deleted listing: "${listing.title}" located at ${listing.location}`
    });

    res.status(200).json({ success: true, message: 'Listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'name email role')
      .sort('-timestamp')
      .limit(100);

    res.status(200).json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
