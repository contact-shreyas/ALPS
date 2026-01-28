/**
 * Comprehensive Email Testing Suite
 * Tests email functionality with mocked nodemailer
 * 
 * Run with: npm run test tests/email.comprehensive.test.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import nodemailer from 'nodemailer';

// Mock nodemailer
vi.mock('nodemailer', () => ({
  default: {
    createTransporter: vi.fn(),
    createTransport: vi.fn()
  }
}));

// Mock prisma
vi.mock('../src/lib/prisma', () => ({
  prisma: {
    // Mock prisma client if needed
  }
}));

describe('Email System Tests', () => {
  let mockTransporter: any;
  let mockSendMail: any;
  let mockVerify: any;
  
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Create mock transporter methods
    mockSendMail = vi.fn();
    mockVerify = vi.fn();
    
    mockTransporter = {
      sendMail: mockSendMail,
      verify: mockVerify
    };
    
    // Mock nodemailer.createTransporter to return our mock
    vi.mocked(nodemailer.createTransporter || nodemailer.createTransport).mockReturnValue(mockTransporter);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('Environment Configuration Tests', () => {
    it('should use SMTP transport when all credentials are provided', async () => {
      // Set up environment variables
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'test@gmail.com';
      process.env.SMTP_PASS = 'valid_app_password';
      
      // Mock successful verification
      mockVerify.mockResolvedValue(true);
      mockSendMail.mockResolvedValue({
        messageId: 'test-message-id',
        response: '250 Message queued'
      });
      
      // Import after setting env vars
      const { sendMail } = await import('../src/lib/mailer-debug');
      
      const result = await sendMail({
        to: 'recipient@example.com',
        subject: 'Test Email',
        html: '<h1>Test</h1>'
      });
      
      expect(result.success).toBe(true);
      expect(result.transport).toBe('smtp');
      expect(mockSendMail).toHaveBeenCalledWith({
        from: expect.stringContaining('test@gmail.com'),
        to: 'recipient@example.com',
        subject: 'Test Email',
        html: '<h1>Test</h1>',
        headers: expect.any(Object)
      });
    });
    
    it('should fall back to JSON transport when SMTP credentials are missing', async () => {
      // Clear environment variables
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;
      
      // Mock JSON transport
      const jsonTransporter = {
        sendMail: vi.fn().mockResolvedValue({
          messageId: 'json-message-id',
          message: 'JSON transport message'
        })
      };
      
      vi.mocked(nodemailer.createTransporter || nodemailer.createTransport).mockReturnValue(jsonTransporter);
      
      const { sendMail } = await import('../src/lib/mailer-debug');
      
      const result = await sendMail({
        to: 'recipient@example.com',
        subject: 'Test Email',
        html: '<h1>Test</h1>'
      });
      
      expect(result.success).toBe(true);
      expect(result.transport).toBe('json');
    });
  });
  
  describe('SMTP Error Handling Tests', () => {
    beforeEach(() => {
      // Set up valid environment for these tests
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'test@gmail.com';
      process.env.SMTP_PASS = 'valid_app_password';
    });
    
    it('should handle authentication errors and fall back to JSON transport', async () => {
      // Mock authentication error
      const authError: any = new Error('Invalid login');
      authError.code = 'EAUTH';
      authError.responseCode = 535;
      
      mockVerify.mockResolvedValue(true);
      mockSendMail.mockRejectedValue(authError);
      
      // Mock JSON fallback transport
      const jsonTransporter = {
        sendMail: vi.fn().mockResolvedValue({
          messageId: 'fallback-message-id',
          message: 'JSON fallback'
        })
      };
      
      // First call returns SMTP transporter, second call returns JSON transporter
      vi.mocked(nodemailer.createTransporter || nodemailer.createTransport)
        .mockReturnValueOnce(mockTransporter)
        .mockReturnValueOnce(jsonTransporter);
      
      const { sendMail } = await import('../src/lib/mailer-debug');
      
      const result = await sendMail({
        to: 'recipient@example.com',
        subject: 'Test Email',
        html: '<h1>Test</h1>'
      });
      
      expect(result.success).toBe(true);
      expect(result.transport).toBe('json-fallback');
      expect(result.originalError).toContain('Invalid login');
    });
    
    it('should handle connection errors', async () => {
      const connectionError: any = new Error('Connection failed');
      connectionError.code = 'ECONNECTION';
      
      mockVerify.mockResolvedValue(true);
      mockSendMail.mockRejectedValue(connectionError);
      
      // Mock failed fallback
      const jsonTransporter = {
        sendMail: vi.fn().mockRejectedValue(new Error('JSON also failed'))
      };
      
      vi.mocked(nodemailer.createTransporter || nodemailer.createTransport)
        .mockReturnValueOnce(mockTransporter)
        .mockReturnValueOnce(jsonTransporter);
      
      const { sendMail } = await import('../src/lib/mailer-debug');
      
      await expect(
        sendMail({
          to: 'recipient@example.com',
          subject: 'Test Email',
          html: '<h1>Test</h1>'
        })
      ).rejects.toThrow('Email sending failed');
    });
    
    it('should validate email addresses', async () => {
      const { sendMail } = await import('../src/lib/mailer-debug');
      
      await expect(
        sendMail({
          to: 'invalid-email',
          subject: 'Test Email',
          html: '<h1>Test</h1>'
        })
      ).rejects.toThrow('Invalid email address');
    });
  });
  
  describe('Email Content Tests', () => {
    beforeEach(() => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_USER = 'test@gmail.com';
      process.env.SMTP_PASS = 'valid_app_password';
      
      mockVerify.mockResolvedValue(true);
      mockSendMail.mockResolvedValue({
        messageId: 'test-message-id',
        response: '250 Message queued'
      });
    });
    
    it('should send email with correct headers and content', async () => {
      const { sendMail } = await import('../src/lib/mailer-debug');
      
      await sendMail({
        to: 'recipient@example.com',
        subject: 'Important Alert',
        html: '<h1>Alert</h1><p>This is important.</p>'
      });
      
      expect(mockSendMail).toHaveBeenCalledWith({
        from: expect.stringContaining('Agentic Light Pollution Sentinel'),
        to: 'recipient@example.com',
        subject: 'Important Alert',
        html: '<h1>Alert</h1><p>This is important.</p>',
        headers: {
          'X-Mailer': 'Agentic Light Pollution Sentinel',
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal'
        }
      });
    });
    
    it('should include performance metrics in response', async () => {
      const { sendMail } = await import('../src/lib/mailer-debug');
      
      const result = await sendMail({
        to: 'recipient@example.com',
        subject: 'Test Email',
        html: '<h1>Test</h1>'
      });
      
      expect(result).toEqual({
        messageId: 'test-message-id',
        success: true,
        transport: 'smtp',
        duration: expect.any(Number),
        response: '250 Message queued'
      });
    });
  });
  
  describe('Test Utility Functions', () => {
    it('should test email connection', async () => {
      mockVerify.mockResolvedValue(true);
      
      const { testEmailConnection } = await import('../src/lib/mailer-debug');
      
      const result = await testEmailConnection();
      
      expect(result.success).toBe(true);
      expect(mockVerify).toHaveBeenCalled();
    });
    
    it('should send test email with correct format', async () => {
      mockVerify.mockResolvedValue(true);
      mockSendMail.mockResolvedValue({
        messageId: 'test-message-id',
        response: '250 Message queued'
      });
      
      const { sendTestEmail } = await import('../src/lib/mailer-debug');
      
      const result = await sendTestEmail('test@example.com');
      
      expect(result.success).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Test Email'),
          html: expect.stringContaining('Email Test')
        })
      );
    });
  });
  
  describe('Integration Test Scenarios', () => {
    it('should handle multiple consecutive email sends', async () => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_USER = 'test@gmail.com';
      process.env.SMTP_PASS = 'valid_app_password';
      
      mockVerify.mockResolvedValue(true);
      mockSendMail
        .mockResolvedValueOnce({ messageId: 'msg-1', response: '250 OK' })
        .mockResolvedValueOnce({ messageId: 'msg-2', response: '250 OK' })
        .mockResolvedValueOnce({ messageId: 'msg-3', response: '250 OK' });
      
      const { sendMail } = await import('../src/lib/mailer-debug');
      
      const emails = [
        { to: 'user1@example.com', subject: 'Email 1', html: '<h1>1</h1>' },
        { to: 'user2@example.com', subject: 'Email 2', html: '<h1>2</h1>' },
        { to: 'user3@example.com', subject: 'Email 3', html: '<h1>3</h1>' }
      ];
      
      const results = await Promise.all(emails.map(email => sendMail(email)));
      
      expect(results).toHaveLength(3);
      expect(results.every(result => result.success)).toBe(true);
      expect(mockSendMail).toHaveBeenCalledTimes(3);
    });
    
    it('should handle mixed success/failure scenarios', async () => {
      process.env.SMTP_HOST = 'smtp.gmail.com';
      process.env.SMTP_USER = 'test@gmail.com';
      process.env.SMTP_PASS = 'valid_app_password';
      
      mockVerify.mockResolvedValue(true);
      
      // First email succeeds, second fails with auth error, third succeeds with fallback
      mockSendMail
        .mockResolvedValueOnce({ messageId: 'msg-1', response: '250 OK' })
        .mockRejectedValueOnce(Object.assign(new Error('Auth failed'), { code: 'EAUTH' }))
        .mockResolvedValueOnce({ messageId: 'msg-3', response: '250 OK' });
      
      // Mock JSON fallback for second email
      const jsonTransporter = {
        sendMail: vi.fn().mockResolvedValue({
          messageId: 'json-msg-2',
          message: 'JSON transport'
        })
      };
      
      vi.mocked(nodemailer.createTransporter || nodemailer.createTransport)
        .mockReturnValue(mockTransporter)
        .mockReturnValueOnce(jsonTransporter); // For fallback
      
      const { sendMail } = await import('../src/lib/mailer-debug');
      
      const results = await Promise.allSettled([
        sendMail({ to: 'user1@example.com', subject: 'Email 1', html: '<h1>1</h1>' }),
        sendMail({ to: 'user2@example.com', subject: 'Email 2', html: '<h1>2</h1>' }),
        sendMail({ to: 'user3@example.com', subject: 'Email 3', html: '<h1>3</h1>' })
      ]);
      
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled'); // Should succeed with fallback
      expect(results[2].status).toBe('fulfilled');
    });
  });
});