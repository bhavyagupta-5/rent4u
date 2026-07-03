require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const TenantProfile = require('../models/TenantProfile');
const RoomListing = require('../models/RoomListing');
const Interest = require('../models/Interest');
const Compatibility = require('../models/Compatibility');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const ActivityLog = require('../models/ActivityLog');

const seedData = async () => {
  try {
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/renthour_ai');
    console.log("Connected to MongoDB for seeding...");

    
    await User.deleteMany();
    await TenantProfile.deleteMany();
    await RoomListing.deleteMany();
    await Interest.deleteMany();
    await Compatibility.deleteMany();
    await Conversation.deleteMany();
    await Message.deleteMany();
    await ActivityLog.deleteMany();
    console.log("Cleared existing collections.");

    
    console.log("Seeding Users...");
    
    
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    const users = await User.create([
      {
        name: 'System Admin',
        email: 'admin@renthour.com',
        password: 'password123', 
        role: 'Admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150',
        verified: true
      },
      {
        name: 'Sarah Connor (Owner)',
        email: 'sarah@owner.com',
        password: 'password123',
        role: 'Owner',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
        verified: true,
        phone: '+1 (555) 123-4567'
      },
      {
        name: 'Bruce Wayne (Owner)',
        email: 'bruce@owner.com',
        password: 'password123',
        role: 'Owner',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
        verified: false,
        phone: '+1 (555) 987-6543'
      },
      {
        name: 'Peter Parker (Tenant)',
        email: 'peter@tenant.com',
        password: 'password123',
        role: 'Tenant',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150',
        verified: true,
        phone: '+1 (555) 222-3333'
      },
      {
        name: 'Clark Kent (Tenant)',
        email: 'clark@tenant.com',
        password: 'password123',
        role: 'Tenant',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150',
        verified: false,
        phone: '+1 (555) 444-5555'
      }
    ]);

    const [admin, ownerSarah, ownerBruce, tenantPeter, tenantClark] = users;

    
    console.log("Seeding Tenant Profiles...");
    const profilePeter = await TenantProfile.create({
      user: tenantPeter._id,
      preferredLocation: 'Swaroop Nagar',
      budgetMin: 5000,
      budgetMax: 15000,
      moveInDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 
      occupation: 'Freelance Photographer',
      gender: 'Male',
      smoking: 'No',
      pets: 'No',
      foodPreference: 'Veg',
      preferredBedrooms: '1 BHK',
      requiredAmenities: ['WiFi', 'Kitchen'],
      about: 'Quiet student and freelance photographer. Very neat, keep to myself, and spend a lot of time working outdoors.'
    });

    const profileClark = await TenantProfile.create({
      user: tenantClark._id,
      preferredLocation: 'Kalyanpur',
      budgetMin: 8000,
      budgetMax: 20000,
      moveInDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), 
      occupation: 'Research Scholar',
      gender: 'Male',
      smoking: 'No',
      pets: 'Yes',
      foodPreference: 'Any',
      preferredBedrooms: '3 BHK',
      requiredAmenities: ['WiFi', 'Gym', 'Parking'],
      about: 'Respectful, professional researcher at IIT. Work irregular hours, neat, and highly active. Enjoy a peaceful room environment.'
    });

    
    console.log("Seeding Room Listings...");
    const listings = await RoomListing.create([
      {
        owner: ownerSarah._id,
        title: 'Charming Room near Swaroop Nagar Metro',
        description: 'Cozy and quiet private room in modern Swaroop Nagar apartment. Just 5 mins walk from the metro station. High-speed WiFi included. Full kitchen access and laundry on site. Veg preferred.',
        location: '12-34 Block A, Swaroop Nagar',
        city: 'Kanpur',
        state: 'UP',
        latitude: 26.4746,
        longitude: 80.3236,
        rent: 11000,
        deposit: 11000,
        availableFrom: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        roomType: 'Single',
        furnishing: 'Furnished',
        amenities: ['WiFi', 'AC', 'Kitchen', 'Laundry', 'Dishwasher'],
        images: [
          '/images/indian_living_room.png',
          '/images/indian_bedroom.png'
        ],
        status: 'available'
      },
      {
        owner: ownerSarah._id,
        title: 'Spacious Shared Flat near IIT Kalyanpur',
        description: 'Large shared double room in Kalyanpur. Shared bath and spacious living room. Friendly environment. Pets welcome! Utilities split evenly.',
        location: 'IIT Road, Kalyanpur',
        city: 'Kanpur',
        state: 'UP',
        latitude: 26.5126,
        longitude: 80.2329,
        rent: 7500,
        deposit: 5000,
        availableFrom: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        roomType: 'Shared',
        furnishing: 'Semi-Furnished',
        amenities: ['WiFi', 'Kitchen', 'Gym', 'Pet Friendly'],
        images: [
          '/images/indian_living_room.png'
        ],
        status: 'available'
      },
      {
        owner: ownerBruce._id,
        title: 'Luxury Studio Penthouse in Civil Lines',
        description: 'Elite penthouse studio overlooking Ganga River skyline in Civil Lines. State of the art automated systems, gym access, security, and private balcony. Move-in immediately.',
        location: '100 VIP Road, Civil Lines',
        city: 'Kanpur',
        state: 'UP',
        latitude: 26.4808,
        longitude: 80.3472,
        rent: 18000,
        deposit: 20000,
        availableFrom: new Date(),
        roomType: 'Entire Flat',
        furnishing: 'Furnished',
        amenities: ['WiFi', 'AC', 'Kitchen', 'Gym', 'Pool', 'Parking', 'Elevator', 'Security'],
        images: [
          '/images/indian_bedroom.png',
          '/images/indian_living_room.png'
        ],
        status: 'available'
      },
      {
        owner: ownerBruce._id,
        title: 'Cozy Room in Kakadeo Coaching Hub',
        description: 'Quiet study room in a peaceful apartment in Kakadeo. Huge study table, private wardrobe, and very peaceful neighborhood. Non-smokers preferred.',
        location: '45 Geeta Nagar, Kakadeo',
        city: 'Kanpur',
        state: 'UP',
        latitude: 26.4716,
        longitude: 80.2974,
        rent: 9500,
        deposit: 9500,
        availableFrom: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        roomType: 'Single',
        furnishing: 'Unfurnished',
        amenities: ['WiFi', 'Parking', 'Kitchen', 'Laundry', 'Backyard'],
        images: [
          '/images/indian_bedroom.png'
        ],
        status: 'filled'
      }
    ]);

    const [listingSarah1, listingSarah2, listingBruce1, listingBruce2] = listings;

    
    console.log("Seeding Compatibility Scores...");
    await Compatibility.create([
      {
        tenant: tenantPeter._id,
        listing: listingSarah1._id,
        score: 93,
        explanation: 'Excellent budget match (Rs 11000 fits in 5k-15k limit). Location matches Swaroop Nagar preference. Peter is a non-smoker vegetarian tenant, matching Sarah\'s room conditions.',
        generatedBy: 'grok'
      },
      {
        tenant: tenantPeter._id,
        listing: listingSarah2._id,
        score: 72,
        explanation: 'Peter preferred single room but this is shared. Budget is extremely cheap. Location Kalyanpur is close to preferred zones.',
        generatedBy: 'grok'
      },
      {
        tenant: tenantClark._id,
        listing: listingBruce1._id,
        score: 95,
        explanation: 'Excellent fit for budget (Rs 18000 fits in 8k-20k range) and location matches Kanpur preference. Clark is clean, professional, and pet friendly, mapping to Bruce\'s penthouse.',
        generatedBy: 'grok'
      },
      {
        tenant: tenantClark._id,
        listing: listingSarah1._id,
        score: 55,
        explanation: 'Budget matches but location Swaroop Nagar is different from Kalyanpur IIT preference. Additionally, Clark has pets while Sarah\'s room has no pet-friendly amenities.',
        generatedBy: 'grok'
      }
    ]);

    
    console.log("Seeding Interests...");
    
    
    const interestPeter = await Interest.create({
      tenant: tenantPeter._id,
      owner: ownerSarah._id,
      listing: listingSarah1._id,
      status: 'pending'
    });

    
    const interestClark = await Interest.create({
      tenant: tenantClark._id,
      owner: ownerBruce._id,
      listing: listingBruce1._id,
      status: 'accepted'
    });

    
    console.log("Seeding Chat Rooms...");
    const conversation = await Conversation.create({
      participants: [tenantClark._id, ownerBruce._id],
      listing: listingBruce1._id
    });

    const messages = await Message.create([
      {
        conversation: conversation._id,
        sender: tenantClark._id,
        text: 'Hello Mr. Wayne, I saw your Penthouse listing and is highly interested. The layout looks perfect for my commute.'
      },
      {
        conversation: conversation._id,
        sender: ownerBruce._id,
        text: 'Hello Clark. I reviewed your profile and compatibility score. A journalist is a respectable tenant. When would you like to view the flat?'
      },
      {
        conversation: conversation._id,
        sender: tenantClark._id,
        text: 'That is great to hear! Would this Saturday at 2:00 PM work for you?'
      }
    ]);

    
    conversation.lastMessage = messages[messages.length - 1]._id;
    await conversation.save();

    
    console.log("Seeding Admin Logs...");
    await ActivityLog.create([
      {
        user: admin._id,
        action: 'USER_VERIFIED',
        target: 'Sarah Connor',
        details: 'Admin verified owner profile for Sarah Connor after identity review.'
      },
      {
        user: admin._id,
        action: 'LISTING_MODERATION',
        target: 'Charming Queens Room near Subway',
        details: 'Admin approved room listing for Sarah Connor after spam checks.'
      }
    ]);

    console.log("Database seeding completed successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Database seeding failed:", error.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
