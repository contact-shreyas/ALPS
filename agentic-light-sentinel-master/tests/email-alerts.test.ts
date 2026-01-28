import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendAlertEmail, AlertEmail } from '../src/lib/mail-improved';
import { prisma } from '../src/lib/prisma';

// Mock nodemailer's createTransporter  
const mockSendMail = vi.fn().mockResolvedValue({
  messageId: 'test-message-id',
  response: 'Email sent successfully'
});

vi.mock('nodemailer', () => ({
  createTransporter: vi.fn(() => ({
    sendMail: mockSendMail
  }))
}));

// Mock the prisma module for EmailLog operations
vi.mock('../src/lib/prisma', () => ({
  prisma: {
    $executeRaw: vi.fn(),
    $disconnect: vi.fn()
  }
}));

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

  describe('sendAlertEmail', () => {
    const mockAlertData: AlertEmail = {
      district: 'Mumbai Suburban',
      severity: 'high',
      radiance: 25.5,
      timestamp: '2025-09-21T12:00:00.000Z',
      location: {
        lat: 19.0760,
        lng: 72.8777
      },
      districtCode: 'MH',
      hotspotCount: 12,
      yearOverYearChange: 15.3
    };

    it('should generate professional email template with realistic data', async () => {
      const { sendMail } = await import('../src/lib/mailer');
      const mockSendMail = vi.mocked(sendMail);
      
      mockSendMail.mockResolvedValue({
        success: true,
        messageId: 'test-message-id',
        transport: 'smtp'
      });

      const result = await sendAlertEmail(mockAlertData);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      const emailCall = mockSendMail.mock.calls[0][0];
      
      // Check email structure
      expect(emailCall.to).toBe('test@example.com');
      expect(emailCall.subject).toContain('[HIGH PRIORITY]');
      expect(emailCall.subject).toContain('Mumbai Suburban, Maharashtra');
      expect(emailCall.subject).toContain('HIGH detected');
      
      // Check HTML content includes realistic data
      expect(emailCall.html).toContain('Mumbai Suburban, Maharashtra');
      expect(emailCall.html).toContain('25.5'); // Radiance value
      expect(emailCall.html).toContain('19.076000°N, 72.877700°E'); // Coordinates
      expect(emailCall.html).toContain('+15.3%'); // Year-over-year change
      expect(emailCall.html).toContain('12'); // Hotspot count
      expect(emailCall.html).toContain('District Code: MH');
      
      // Check text content within HTML
      expect(emailCall.html).toContain('Mumbai Suburban, Maharashtra');
      expect(emailCall.html).toContain('25.5 nW/cm²/sr');
      expect(emailCall.html).toContain('+15.3%');
      
      expect(result.success).toBe(true);
    });

    it('should handle extreme severity alerts with urgent messaging', async () => {
      const { sendMail } = await import('../src/lib/mailer');
      const mockSendMail = vi.mocked(sendMail);
      
      mockSendMail.mockResolvedValue({
        success: true,
        messageId: 'test-message-id',
        transport: 'smtp'
      });

      const extremeAlert: AlertEmail = {
        ...mockAlertData,
        severity: 'extreme',
        radiance: 35.2
      };

      await sendAlertEmail(extremeAlert);

      const emailCall = mockSendMail.mock.calls[0][0];
      
      expect(emailCall.subject).toContain('[URGENT]');
      expect(emailCall.subject).toContain('EXTREME detected');
      expect(emailCall.html).toContain('IMMEDIATE ACTIONS REQUIRED');
      expect(emailCall.html).toContain('Deploy field inspection team within 24 hours');
      expect(emailCall.html).toContain('IMMEDIATE ACTIONS REQUIRED');
    });

    it('should handle low severity alerts with standard messaging', async () => {
      const { sendMail } = await import('../src/lib/mailer');
      const mockSendMail = vi.mocked(sendMail);
      
      mockSendMail.mockResolvedValue({
        success: true,
        messageId: 'test-message-id',
        transport: 'smtp'
      });

      const lowAlert: AlertEmail = {
        ...mockAlertData,
        severity: 'low',
        radiance: 18.1
      };

      await sendAlertEmail(lowAlert);

      const emailCall = mockSendMail.mock.calls[0][0];
      
      expect(emailCall.subject).toContain('[STANDARD]');
      expect(emailCall.subject).toContain('LOW detected');
      expect(emailCall.html).toContain('STANDARD MITIGATION PROTOCOL');
      expect(emailCall.html).toContain('Schedule nighttime field survey within 7 days');
    });

    it('should include Google Maps link with correct coordinates', async () => {
      const { sendMail } = await import('../src/lib/mailer');
      const mockSendMail = vi.mocked(sendMail);
      
      mockSendMail.mockResolvedValue({
        success: true,
        messageId: 'test-message-id',
        transport: 'smtp'
      });

      await sendAlertEmail(mockAlertData);

      const emailCall = mockSendMail.mock.calls[0][0];
      const expectedMapsUrl = 'https://www.google.com/maps?q=19.076,72.8777';
      
      expect(emailCall.html).toContain(expectedMapsUrl);
    });

    it('should calculate surface brightness correctly', async () => {
      const { sendMail } = await import('../src/lib/mailer');
      const mockSendMail = vi.mocked(sendMail);
      
      mockSendMail.mockResolvedValue({
        success: true,
        messageId: 'test-message-id',
        transport: 'smtp'
      });

      await sendAlertEmail(mockAlertData);

      const emailCall = mockSendMail.mock.calls[0][0];
      
      // Surface brightness calculation: mag/arcsec² = 22.0 - 2.5 * log10(radiance)
      const expectedMag = 22.0 - 2.5 * Math.log10(25.5);
      const expectedMagStr = expectedMag.toFixed(1);
      
      expect(emailCall.html).toContain(expectedMagStr);
      expect(emailCall.html).toContain('mag/arcsec²');
    });

    it('should handle missing optional fields gracefully', async () => {
      const { sendMail } = await import('../src/lib/mailer');
      const mockSendMail = vi.mocked(sendMail);
      
      mockSendMail.mockResolvedValue({
        success: true,
        messageId: 'test-message-id',
        transport: 'smtp'
      });

      const minimalAlert: AlertEmail = {
        district: 'Test District',
        severity: 'medium',
        radiance: 22.0,
        timestamp: '2025-09-21T12:00:00.000Z',
        location: { lat: 20.0, lng: 77.0 }
      };

      const result = await sendAlertEmail(minimalAlert);

      expect(result.success).toBe(true);
      const emailCall = mockSendMail.mock.calls[0][0];
      
      expect(emailCall.subject).toContain('Test District');
      expect(emailCall.html).toContain('District Code: N/A');
      // Should not break when optional fields are missing
      expect(emailCall.html).not.toContain('undefined');
      expect(emailCall.html).not.toContain('NaN');
    });

    it('should use Indian district data when district code is provided', async () => {
      const { sendMail } = await import('../src/lib/mailer');
      const mockSendMail = vi.mocked(sendMail);
      
      mockSendMail.mockResolvedValue({
        success: true,
        messageId: 'test-message-id',
        transport: 'smtp'
      });

      const bengaluruAlert: AlertEmail = {
        ...mockAlertData,
        district: 'Bengaluru Urban',
        districtCode: 'KA'
      };

      await sendAlertEmail(bengaluruAlert);

      const emailCall = mockSendMail.mock.calls[0][0];
      
      expect(emailCall.subject).toContain('Bengaluru Urban, Karnataka');
      expect(emailCall.html).toContain('Bengaluru Urban, Karnataka');
    });

    it('should handle email sending failures', async () => {
      const { sendMail } = await import('../src/lib/mailer');
      const mockSendMail = vi.mocked(sendMail);
      
      mockSendMail.mockRejectedValue(new Error('SMTP connection failed'));

      await expect(sendAlertEmail(mockAlertData)).rejects.toThrow('SMTP connection failed');
    });

    it('should log email attempt with proper error handling', async () => {
      const { sendMail } = await import('../src/lib/mailer');
      const mockSendMail = vi.mocked(sendMail);
      
      mockSendMail.mockResolvedValue({
        success: true,
        messageId: 'test-message-id',
        transport: 'smtp'
      });

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await sendAlertEmail(mockAlertData);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ Alert email sent for Mumbai Suburban, Maharashtra:')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Email Template Content Validation', () => {
    it('should include all required professional elements', async () => {
      const { sendMail } = await import('../src/lib/mailer');
      const mockSendMail = vi.mocked(sendMail);
      
      mockSendMail.mockResolvedValue({
        success: true,
        messageId: 'test-message-id',
        transport: 'smtp'
      });

      const alertData: AlertEmail = {
        district: 'New Delhi',
        severity: 'high',
        radiance: 28.5,
        timestamp: '2025-09-21T14:30:00.000Z',
        location: { lat: 28.6139, lng: 77.2090 },
        districtCode: 'DL',
        hotspotCount: 8,
        yearOverYearChange: -5.2
      };

      await sendAlertEmail(alertData);

      const emailCall = mockSendMail.mock.calls[0][0];
      
      // Check professional elements
      expect(emailCall.html).toContain('Ministry of Environment, Forest and Climate Change');
      expect(emailCall.html).toContain('Light Pollution Monitoring System');
      expect(emailCall.html).toContain('Immediate Action Plan');
      expect(emailCall.html).toContain('Technical Information');
      expect(emailCall.html).toContain('VIIRS/DMSP Night-time Lights');
      expect(emailCall.html).toContain('Automated AI Analysis');
      expect(emailCall.html).toContain('lightpollution@gov.in');
      
      // Check data accuracy
      expect(emailCall.html).toContain('28.5'); // Radiance
      expect(emailCall.html).toContain('-5.2%'); // Negative YoY change
      expect(emailCall.html).toContain('8'); // Hotspot count
      expect(emailCall.html).toContain('28.613900°N, 77.209000°E'); // Coordinates
      
      // Check severity-specific thresholds
      expect(emailCall.html).toContain('25-30 nW/cm²/sr'); // High severity threshold
    });

    it('should format timestamps correctly for Indian timezone', async () => {
      const { sendMail } = await import('../src/lib/mailer');
      const mockSendMail = vi.mocked(sendMail);
      
      mockSendMail.mockResolvedValue({
        success: true,
        messageId: 'test-message-id',
        transport: 'smtp'
      });

      const alertData: AlertEmail = {
        district: 'Chennai',
        severity: 'medium',
        radiance: 22.0,
        timestamp: '2025-09-21T06:30:00.000Z', // UTC time
        location: { lat: 13.0827, lng: 80.2707 }
      };

      await sendAlertEmail(alertData);

      const emailCall = mockSendMail.mock.calls[0][0];
      
      // Should contain Indian timezone formatted date
      expect(emailCall.html).toMatch(/Detection:.*21.*September.*2025/);
      expect(emailCall.html).toContain('Asia/Kolkata');
    });
  });
});