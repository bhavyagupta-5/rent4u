const Compatibility = require('../models/Compatibility');
const TenantProfile = require('../models/TenantProfile');
const RoomListing = require('../models/RoomListing');
const { generateCompatibility } = require('../services/grokService');

exports.getCompatibility = async (req, res) => {
  try {
    const { listingId } = req.params;
    const tenantId = req.user.id;

    
    const listing = await RoomListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Room listing not found' });
    }

    
    const tenantProfile = await TenantProfile.findOne({ user: tenantId });
    if (!tenantProfile || tenantProfile.preferredLocation === 'Not specified yet') {
      return res.status(400).json({ 
        success: false, 
        message: 'Tenant profile not found or incomplete. Please complete your profile questionnaire to view compatibility scores.' 
      });
    }

    
    let compatibility = await Compatibility.findOne({ tenant: tenantId, listing: listingId });
    
    if (compatibility) {
      return res.status(200).json({
        success: true,
        cached: true,
        data: compatibility
      });
    }

    
    const matchData = await generateCompatibility(tenantProfile, listing);

    
    compatibility = await Compatibility.create({
      tenant: tenantId,
      listing: listingId,
      score: matchData.score,
      explanation: matchData.explanation,
      generatedBy: matchData.generatedBy
    });

    res.status(200).json({
      success: true,
      cached: false,
      data: compatibility
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
