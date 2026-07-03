const { calculateRuleBasedScore } = require('../services/grokService');

describe('Grok Service - Rule-Based Fallback Scorer', () => {
  const mockTenantProfile = {
    budgetMin: 1000,
    budgetMax: 2000,
    preferredLocation: 'Brooklyn',
    moveInDate: '2026-08-01',
    smoking: 'No',
    pets: 'No',
    foodPreference: 'Veg'
  };

  const mockListing = {
    rent: 1500,
    location: '123 Flatbush Ave, Brooklyn',
    city: 'Brooklyn',
    state: 'NY',
    availableFrom: '2026-07-15',
    roomType: 'Single',
    description: 'Beautiful non-smoking quiet room in Brooklyn.'
  };

  test('should return a perfect score for matching parameters', () => {
    const result = calculateRuleBasedScore(mockTenantProfile, mockListing);
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.explanation).toContain('Rent is perfectly within your budget range');
    expect(result.explanation).toContain('Listing matches preferred location');
  });

  test('should penalize rent exceeding maximum budget limit', () => {
    const expensiveListing = {
      ...mockListing,
      rent: 2600 // Exceeds by 30%
    };
    const result = calculateRuleBasedScore(mockTenantProfile, expensiveListing);
    expect(result.score).toBeLessThan(70);
    expect(result.explanation).toContain('Rent is significantly above your maximum budget');
  });

  test('should penalize conflicting smoking and pets preferences', () => {
    const badLifestyleListing = {
      ...mockListing,
      description: 'Smoking allowed. Friendly dogs in the house.'
    };
    const result = calculateRuleBasedScore(mockTenantProfile, badLifestyleListing);
    expect(result.score).toBeLessThan(95);
    expect(result.explanation).toContain('allows smoking');
    expect(result.explanation).toContain('allows pets');
  });
});
