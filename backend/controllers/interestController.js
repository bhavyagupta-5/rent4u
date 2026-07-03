const Interest = require('../models/Interest');
const RoomListing = require('../models/RoomListing');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Compatibility = require('../models/Compatibility');
const emailService = require('../services/emailService');

exports.sendInterest = async (req, res) => {
  try {
    const { listingId } = req.body;
    const tenantId = req.user.id;

    
    const listing = await RoomListing.findById(listingId).populate('owner', 'name email');
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.owner._id.toString() === tenantId) {
      return res.status(400).json({ success: false, message: 'Cannot express interest in your own listing' });
    }

    
    const existingInterest = await Interest.findOne({ tenant: tenantId, listing: listingId });
    if (existingInterest) {
      return res.status(400).json({ success: false, message: 'You have already expressed interest in this listing' });
    }

    
    const interest = await Interest.create({
      tenant: tenantId,
      owner: listing.owner._id,
      listing: listingId,
      status: 'pending'
    });

    
    let scoreObj = await Compatibility.findOne({ tenant: tenantId, listing: listingId });
    const scoreVal = scoreObj ? scoreObj.score : 'N/A';

    
    // Send email asynchronously in the background so it doesn't block the API response
    emailService.sendInterestReceivedEmail(
      listing.owner.email,
      listing.owner.name,
      req.user.name,
      listing.title,
      scoreVal
    ).catch(mailError => {
      console.error("Nodemailer failed in sendInterest (background):", mailError.message);
    });

    res.status(201).json({ success: true, data: interest });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateInterestStatus = async (req, res) => {
  try {
    const { status } = req.body; 
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update option' });
    }

    const interest = await Interest.findById(req.params.id)
      .populate('tenant', 'name email')
      .populate('owner', 'name phone email')
      .populate('listing', 'title');

    if (!interest) {
      return res.status(404).json({ success: false, message: 'Interest entry not found' });
    }

    if (interest.owner._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to change interest status' });
    }

    interest.status = status;
    await interest.save();

    if (status === 'accepted') {
      const existingConv = await Conversation.findOne({
        participants: { $all: [interest.tenant._id, interest.owner._id] },
        listing: interest.listing._id
      });

      if (!existingConv) {
        await Conversation.create({
          participants: [interest.tenant._id, interest.owner._id],
          listing: interest.listing._id
        });
      }

      emailService.sendInterestAcceptedEmail(
        interest.tenant.email,
        interest.tenant.name,
        interest.owner.name,
        interest.owner.phone,
        interest.listing.title
      ).catch(mailErr => {
        console.error("Mail dispatch failed in updateInterestStatus (accepted background):", mailErr.message);
      });
    } else if (status === 'declined') {
      emailService.sendInterestDeclinedEmail(
        interest.tenant.email,
        interest.tenant.name,
        interest.listing.title
      ).catch(mailErr => {
        console.error("Mail dispatch failed in updateInterestStatus (declined background):", mailErr.message);
      });
    }

    res.status(200).json({ success: true, data: interest });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getInterests = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'Tenant') {
      query.tenant = req.user.id;
    } else if (req.user.role === 'Owner') {
      query.owner = req.user.id;
    }

    const interests = await Interest.find(query)
      .populate('tenant', 'name email phone avatar')
      .populate('owner', 'name email phone avatar')
      .populate('listing', 'title location rent roomType images status');

    res.status(200).json({ success: true, data: interests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
