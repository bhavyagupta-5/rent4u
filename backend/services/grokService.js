const axios = require('axios');

function calculateRuleBasedScore(tenantProfile, listing) {
  let score = 0;
  const breakdown = [];

  
  const rent = listing.rent;
  const minB = tenantProfile.budgetMin;
  const maxB = tenantProfile.budgetMax;

  if (rent >= minB && rent <= maxB) {
    score += 40;
    breakdown.push("Rent is perfectly within your budget range (40/40).");
  } else if (rent < minB) {
    
    const diffPercent = (minB - rent) / minB;
    if (diffPercent <= 0.25) {
      score += 35;
      breakdown.push("Rent is slightly below your preferred range, offering savings (35/40).");
    } else {
      score += 30;
      breakdown.push("Rent is significantly below budget (30/40).");
    }
  } else {
    
    const diffPercent = (rent - maxB) / maxB;
    if (diffPercent <= 0.1) {
      score += 25;
      breakdown.push("Rent is slightly above budget range by less than 10% (25/40).");
    } else if (diffPercent <= 0.25) {
      score += 15;
      breakdown.push("Rent exceeds budget range by up to 25% (15/40).");
    } else {
      score += 0;
      breakdown.push("Rent is significantly above your maximum budget (0/40).");
    }
  }

  
  const preferredLoc = (tenantProfile.preferredLocation || '').toLowerCase();
  const listingLoc = (listing.location || '').toLowerCase();
  const listingCity = (listing.city || '').toLowerCase();
  const listingState = (listing.state || '').toLowerCase();

  if (
    listingLoc.includes(preferredLoc) || 
    preferredLoc.includes(listingLoc) ||
    listingCity.includes(preferredLoc) ||
    preferredLoc.includes(listingCity)
  ) {
    score += 30;
    breakdown.push("Listing matches preferred location or city (30/30).");
  } else if (listingState.includes(preferredLoc) || preferredLoc.includes(listingState)) {
    score += 15;
    breakdown.push("Listing is in the preferred state, but different local area (15/30).");
  } else {
    score += 5;
    breakdown.push("Listing location differs from preferences (5/30).");
  }

  
  const tenantMoveIn = new Date(tenantProfile.moveInDate);
  const listingAvail = new Date(listing.availableFrom);
  
  if (listingAvail <= tenantMoveIn) {
    score += 10;
    breakdown.push("Room is available on or before your desired move-in date (10/10).");
  } else {
    const diffDays = Math.ceil((listingAvail - tenantMoveIn) / (1000 * 60 * 60 * 24));
    if (diffDays <= 15) {
      score += 7;
      breakdown.push(`Room is available within 15 days of your move-in date (7/10).`);
    } else if (diffDays <= 30) {
      score += 4;
      breakdown.push(`Room is available within 30 days of your move-in date (4/10).`);
    } else {
      score += 0;
      breakdown.push(`Room is available more than a month after your move-in date (0/10).`);
    }
  }

  
  const roomType = listing.roomType;
  if (roomType === 'Single' || roomType === 'Entire Flat') {
    score += 10;
    breakdown.push(`Listing offers private space (${roomType}) which fits most preferences (10/10).`);
  } else {
    score += 7;
    breakdown.push("Listing is for a shared space (7/10).");
  }

  
  let lifestyleScore = 10;
  const desc = (listing.description || '').toLowerCase();
  
  
  if (tenantProfile.smoking === 'No' && (desc.includes('smoking allowed') || desc.includes('smoker friendly'))) {
    lifestyleScore -= 3;
    breakdown.push("Listing allows smoking, which clashes with your non-smoking preference.");
  }
  
  if (tenantProfile.pets === 'No' && (desc.includes('pet allowed') || desc.includes('dog') || desc.includes('cat') || desc.includes('pet friendly'))) {
    lifestyleScore -= 3;
    breakdown.push("Listing allows pets, which conflicts with your preference.");
  }
  
  if (tenantProfile.foodPreference === 'Veg' && desc.includes('non-veg only')) {
    lifestyleScore -= 4;
    breakdown.push("Listing is non-veg only, conflicts with veg food preference.");
  }

  if (lifestyleScore === 10) {
    breakdown.push("Lifestyle preferences (smoking, pets, food) seem compatible (10/10).");
  } else {
    breakdown.push(`Lifestyle compatibility adjusted for preferences (${lifestyleScore}/10).`);
  }
  score += Math.max(0, lifestyleScore);

  
  const prefBeds = tenantProfile.preferredBedrooms || 'Any';
  if (prefBeds !== 'Any') {
    const title = (listing.title || '').toLowerCase();
    const lDesc = (listing.description || '').toLowerCase();
    const isStudioPref = prefBeds === 'Studio Room' && (title.includes('studio') || lDesc.includes('studio') || listing.roomType === 'Single');
    const isBhkPref = (prefBeds === '1 BHK' && (title.includes('1 bhk') || title.includes('1bhk') || lDesc.includes('1 bhk') || lDesc.includes('1bhk') || title.includes('single') || listing.roomType === 'Single')) ||
                      (prefBeds === '2 BHK' && (title.includes('2 bhk') || title.includes('2bhk') || lDesc.includes('2 bhk') || lDesc.includes('2bhk') || title.includes('double') || listing.roomType === 'Shared')) ||
                      (prefBeds === '3 BHK' && (title.includes('3 bhk') || title.includes('3bhk') || lDesc.includes('3 bhk') || lDesc.includes('3bhk') || listing.roomType === 'Entire Flat'));

    if (isStudioPref || isBhkPref) {
      breakdown.push(`Listing matches your preferred bedroom configuration (${prefBeds}).`);
    } else {
      score = Math.max(0, score - 10);
      breakdown.push(`Listing does not match your preferred bedroom setup (${prefBeds}). (-10 pts)`);
    }
  }

  
  const reqAmenities = tenantProfile.requiredAmenities || [];
  if (reqAmenities.length > 0) {
    const listAmenities = listing.amenities || [];
    const missing = reqAmenities.filter(a => !listAmenities.includes(a));
    if (missing.length > 0) {
      const deduction = missing.length * 5;
      score = Math.max(0, score - deduction);
      breakdown.push(`Missing required amenities: ${missing.join(', ')}. (-${deduction} pts)`);
    } else {
      breakdown.push("All your required amenities are included in the listing.");
    }
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    explanation: `Calculated via Rule-based fallback: ${breakdown.join(' ')}`
  };
}

function getGrokConfig() {
  const apiKey = process.env.GROK_API_KEY;
  let baseUrl = process.env.GROK_BASE_URL || 'https://api.x.ai/v1';
  let model = process.env.GROK_MODEL || 'grok-4';

  if (apiKey && apiKey.startsWith('gsk_')) {
    if (baseUrl.includes('x.ai') || baseUrl === 'https://api.x.ai/v1') {
      baseUrl = 'https://api.groq.com/openai/v1';
    }
    if (model === 'grok-4' || model === 'grok-2' || model === 'grok-beta') {
      model = 'llama-3.3-70b-versatile';
    }
  } else if (apiKey) {
    if (model === 'grok-4') {
      model = 'grok-2-latest';
    }
  }

  return { apiKey, baseUrl, model };
}

async function generateCompatibility(tenantProfile, listing) {
  const { apiKey, baseUrl, model } = getGrokConfig();

  if (!apiKey) {
    console.warn("Grok API key not set. Using Rule-Based fallback scoring.");
    return {
      ...calculateRuleBasedScore(tenantProfile, listing),
      generatedBy: 'fallback'
    };
  }

  try {
    const prompt = `
You are an intelligent housing compatibility expert.
Given the tenant profile and room listing details, calculate their compatibility score between 0 and 100.
Consider details such as:
1. Budget match: Tenant preferred range is Rs. ${tenantProfile.budgetMin} to Rs. ${tenantProfile.budgetMax}. Listing rent is Rs. ${listing.rent}.
2. Location match: Tenant preferred location is "${tenantProfile.preferredLocation}". Listing is in "${listing.location}, ${listing.city}, ${listing.state}".
3. Move-in compatibility: Tenant wants to move in on ${new Date(tenantProfile.moveInDate).toDateString()}. Listing is available from ${new Date(listing.availableFrom).toDateString()}.
4. Room type compatibility: Listing room type is "${listing.roomType}", furnishing is "${listing.furnishing}".
5. Lifestyle compatibility: Tenant smoking preference is "${tenantProfile.smoking}", pets preference is "${tenantProfile.pets}", food preference is "${tenantProfile.foodPreference}". Listing amenities are: [${(listing.amenities || []).join(', ')}]. Listing description is: "${listing.description}".
6. Tenant details: Occupation: "${tenantProfile.occupation}", gender: "${tenantProfile.gender}", about tenant: "${tenantProfile.about}".
7. Layout & Amenities Requirements: Tenant preferred bedrooms configuration is "${tenantProfile.preferredBedrooms || 'Any'}", required amenities checklist is [${(tenantProfile.requiredAmenities || []).join(', ')}].

Generate a JSON response only. No conversational wrapper, no markdown blocks. The JSON must exactly conform to this schema:
{
  "score": 91,
  "explanation": "Brief explanation detailing the pros/cons of this match."
}
`;

    const response = await axios.post(`${baseUrl}/chat/completions`, {
      model,
      messages: [
        {
          role: "system",
          content: "You are a housing matchmaker. You return only valid JSON scores and explanations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 8000 
    });

    const content = response.data.choices[0].message.content.trim();
    
    const data = JSON.parse(content);
    
    if (typeof data.score === 'number' && data.explanation) {
      return {
        score: Math.min(100, Math.max(0, data.score)),
        explanation: data.explanation,
        generatedBy: 'grok'
      };
    }
    
    throw new Error("Invalid response format from Grok API");
  } catch (error) {
    console.error("Grok API call failed, using rule-based fallback. Error:", error.message);
    return {
      ...calculateRuleBasedScore(tenantProfile, listing),
      generatedBy: 'fallback'
    };
  }
}

async function generateListingDescription({ title, city, roomType, rent, amenities, furnishing }) {
  const { apiKey, baseUrl, model } = getGrokConfig();

  const fallbackText = `Welcome to this premium ${roomType} listing in the heart of ${city}! Featuring essential features such as ${amenities || 'high-speed WiFi, modern kitchen and climate control'}, and offered at an attractive monthly rate of Rs. ${rent || '10000'} with ${furnishing || 'furnished'} settings, this space is ideal for tenants looking for a neat and peaceful room. Contact us today to coordinate a viewing walk-through!`;

  if (!apiKey) {
    return { description: fallbackText, generatedBy: 'fallback' };
  }

  try {
    const prompt = `You are an expert real estate copywriter. Write a highly appealing and professional listing description (around 100 words) for a rental listing with these details:
- Title: "${title}"
- City: "${city}"
- Room Type: "${roomType}"
- Rent: "Rs. ${rent}/mo"
- Furnishing: "${furnishing}"
- Amenities: "${amenities}"

Format the response strictly as a JSON object:
{
  "description": "The beautifully written listing description paragraph."
}
No conversational wrapper, no markdown block wraps.`;

    const response = await axios.post(`${baseUrl}/chat/completions`, {
      model,
      messages: [
        {
          role: "system",
          content: "You are a professional copywriter. You respond only with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 8000
    });

    const content = response.data.choices[0].message.content.trim();
    const data = JSON.parse(content);
    if (data.description) {
      return { description: data.description, generatedBy: 'grok' };
    }
    throw new Error("Invalid output format");
  } catch (err) {
    console.error("Grok description generation failed, using template:", err.message);
    return { description: fallbackText, generatedBy: 'fallback' };
  }
}

module.exports = {
  generateCompatibility,
  calculateRuleBasedScore,
  generateListingDescription
};
