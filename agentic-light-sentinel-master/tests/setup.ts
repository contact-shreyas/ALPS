import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables for tests
Object.assign(process.env, {
  NODE_ENV: 'test',
  DATABASE_URL: 'file:./test.db',
  SMTP_HOST: 'localhost',
  SMTP_PORT: '587',
  SMTP_USER: 'test@example.com',
  SMTP_PASS: 'test-password',
});

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    query: {},
    pathname: '/',
  }),
}));

// Mock Prisma client for tests
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    district: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    hotspot: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    agentLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  })),
}));

// Mock nodemailer
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({ messageId: 'test-id' }),
      verify: vi.fn().mockResolvedValue(true),
    }),
  },
}));