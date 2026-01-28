import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock nodemailer with proper hoisting
const mockSendMail = vi.fn();

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: mockSendMail
    }))
  }
}));

// Mock the prisma module for EmailLog operations
vi.mock('../src/lib/prisma', () => ({
  prisma: {
    $executeRaw: vi.fn(),
    $disconnect: vi.fn()
  }
}));

import { sendAlertEmail, AlertEmail } from '../src/lib/mail-improved';

describe('Email Alert System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendMail.mockResolvedValue({
      messageId: 'test-message-id',
      response: 'Email sent successfully'
    });
    // Reset environment variables
    process.env.MUNICIPALITY_EMAIL = 'test@example.com';
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASS = 'password';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Mock alert data using realistic Indian district information
  const mockAlertData: AlertEmail = {
    district: 'Mumbai Suburban, Maharashtra',
    severity: 'high',
    location: {
      lat: 19.076,
      lng: 72.8777
    },
    radiance: 45.8,
    yearOverYearChange: 12.5,
    timestamp: '2024-01-15T10:30:00Z',
    hotspotCount: 23,
    districtCode: 'MH_MUM_SUB'
  };

  describe('sendAlertEmail', () => {
    it('should generate professional email template with realistic data', async () => {
      const result = await sendAlertEmail(mockAlertData);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      const emailCall = mockSendMail.mock.calls[0][0];

      expect(emailCall.subject).toContain('Light Pollution Alert - Mumbai Suburban, Maharashtra');
      expect(emailCall.html).toContain('Mumbai Suburban, Maharashtra');
      expect(emailCall.html).toContain('High Priority');
      expect(emailCall.html).toContain('45.8 nW/(cm²⋅sr)');
      expect(emailCall.html).toContain('12.5% increase');
      expect(emailCall.html).toContain('23 hotspots');
      expect(result.success).toBe(true);
    });

    it('should handle extreme severity alerts with urgent messaging', async () => {
      const extremeAlert: AlertEmail = {
        ...mockAlertData,
        severity: 'extreme',
        yearOverYearChange: 35.2
      };

      await sendAlertEmail(extremeAlert);

      const emailCall = mockSendMail.mock.calls[0][0];

      expect(emailCall.subject).toContain('[URGENT]');
      expect(emailCall.html).toContain('🚨 Extreme Priority');
      expect(emailCall.html).toContain('35.2% increase');
      expect(emailCall.html).toContain('Critical light pollution increase');
    });

    it('should handle low severity alerts with standard messaging', async () => {
      const lowAlert: AlertEmail = {
        ...mockAlertData,
        severity: 'low',
        yearOverYearChange: 3.1
      };

      await sendAlertEmail(lowAlert);

      const emailCall = mockSendMail.mock.calls[0][0];

      expect(emailCall.subject).toContain('[STANDARD]');
      expect(emailCall.html).toContain('⚠️ Standard Priority');
      expect(emailCall.html).toContain('3.1% increase');
    });

    it('should include Google Maps link with correct coordinates', async () => {
      await sendAlertEmail(mockAlertData);

      const emailCall = mockSendMail.mock.calls[0][0];
      const expectedMapsUrl = 'https://www.google.com/maps?q=19.076,72.8777';

      expect(emailCall.html).toContain(expectedMapsUrl);
    });

    it('should calculate surface brightness correctly', async () => {
      await sendAlertEmail(mockAlertData);

      const emailCall = mockSendMail.mock.calls[0][0];

      // Surface brightness calculation: mag/arcsec² = 22.0 - 2.5 * log10(radiance)
      // For radiance 45.8: 22.0 - 2.5 * log10(45.8) ≈ 18.0 mag/arcsec²
      expect(emailCall.html).toContain('18.0 mag/arcsec²');
    });

    it('should handle missing optional fields gracefully', async () => {
      const minimalAlert: AlertEmail = {
        district: 'Test District',
        severity: 'medium',
        location: {
          lat: 20.0,
          lng: 75.0
        },
        radiance: 30.0,
        timestamp: '2024-01-15T10:30:00Z'
      };

      const result = await sendAlertEmail(minimalAlert);

      expect(result.success).toBe(true);
      const emailCall = mockSendMail.mock.calls[0][0];

      expect(emailCall.html).toContain('Test District');
      expect(emailCall.html).toContain('Data not available');
    });

    it('should use Indian district data when district code is provided', async () => {
      const bengaluruAlert: AlertEmail = {
        ...mockAlertData,
        district: 'Bengaluru Urban, Karnataka',
        districtCode: 'KA_BEN_URB',
        location: {
          lat: 12.9716,
          lng: 77.5946
        }
      };

      await sendAlertEmail(bengaluruAlert);

      const emailCall = mockSendMail.mock.calls[0][0];

      expect(emailCall.subject).toContain('Bengaluru Urban, Karnataka');
      expect(emailCall.html).toContain('Bengaluru Urban, Karnataka');
      expect(emailCall.html).toContain('https://www.google.com/maps?q=12.9716,77.5946');
    });

    it('should handle email sending failures', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP connection failed'));

      const result = await sendAlertEmail(mockAlertData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('SMTP connection failed');
    });

    it('should log email attempt with proper error handling', async () => {
      mockSendMail.mockResolvedValue({
        messageId: 'test-message-id',
        response: 'Email sent successfully'
      });

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await sendAlertEmail(mockAlertData);

      expect(consoleSpy).toHaveBeenCalledWith(
        '✅ Alert email sent for Mumbai Suburban, Maharashtra:',
        expect.objectContaining({ success: true })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Email Template Content Validation', () => {
    it('should include all required professional elements', async () => {
      const alertData: AlertEmail = {
        district: 'New Delhi, Delhi',
        severity: 'high',
        location: {
          lat: 28.6139,
          lng: 77.2090
        },
        radiance: 67.3,
        yearOverYearChange: 18.7,
        timestamp: '2024-01-15T10:30:00Z',
        hotspotCount: 45,
        districtCode: 'DL_NEW_DEL'
      };

      await sendAlertEmail(alertData);

      const emailCall = mockSendMail.mock.calls[0][0];

      // Check professional elements
      expect(emailCall.html).toContain('Ministry of Environment, Forest and Climate Change');
      expect(emailCall.html).toContain('Government of India');
      expect(emailCall.html).toContain('National Light Pollution Monitoring');
      expect(emailCall.html).toContain('Immediate Action Required');
      expect(emailCall.html).toContain('Report Number:');
      expect(emailCall.html).toContain('Alert Timestamp:');
      expect(emailCall.html).toContain('Priority Level: High');
    });

    it('should format timestamps correctly for Indian timezone', async () => {
      const alertData: AlertEmail = {
        district: 'Chennai',
        severity: 'medium',
        location: {
          lat: 13.0827,
          lng: 80.2707
        },
        radiance: 38.9,
        timestamp: '2024-01-15T10:30:00Z'
      };

      await sendAlertEmail(alertData);

      const emailCall = mockSendMail.mock.calls[0][0];

      // Should contain Indian timezone formatted date
      expect(emailCall.html).toMatch(/January 15, 2024.*IST/);
    });
  });
});