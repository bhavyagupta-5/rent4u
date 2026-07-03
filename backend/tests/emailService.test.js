const emailService = require('../services/emailService');

describe('Email Service Notification Templates', () => {
  test('should trigger sendInterestReceivedEmail without crashing', async () => {
    const res = await emailService.sendInterestReceivedEmail(
      'owner@gmail.com',
      'Sarah Connor',
      'Peter Parker',
      'Astoria Loft Room',
      92
    );
    expect(res).toBeDefined();
    expect(res.messageId).toBeDefined();
  });

  test('should trigger sendInterestAcceptedEmail without crashing', async () => {
    const res = await emailService.sendInterestAcceptedEmail(
      'tenant@gmail.com',
      'Peter Parker',
      'Sarah Connor',
      '+1 (555) 123-4567',
      'Astoria Loft Room'
    );
    expect(res).toBeDefined();
    expect(res.messageId).toBeDefined();
  });

  test('should trigger sendInterestDeclinedEmail without crashing', async () => {
    const res = await emailService.sendInterestDeclinedEmail(
      'tenant@gmail.com',
      'Peter Parker',
      'Astoria Loft Room'
    );
    expect(res).toBeDefined();
    expect(res.messageId).toBeDefined();
  });
});
