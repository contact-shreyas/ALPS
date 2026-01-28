import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

// Security configuration
export const SECURITY_CONFIG = {
  // Rate limiting
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // CORS configuration
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL!, 'https://your-domain.com']
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    credentials: true,
  },
  
  // Content Security Policy
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:'],
    'connect-src': ["'self'", 'wss:', 'ws:'],
  },
  
  // Security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
};

// JWT configuration
export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || generateSecureSecret(),
  expiresIn: '24h',
  issuer: 'infinity-loop',
  audience: 'api-users',
};

// API Key configuration
export const API_KEY_CONFIG = {
  headerName: 'X-API-Key',
  length: 32,
  prefix: 'il_', // INFINITY LOOP prefix
};

// Generate secure secret if not provided
function generateSecureSecret(): string {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be provided in production');
  }
  return randomBytes(64).toString('hex');
}

// Security utilities
export class SecurityUtils {
  // Generate API key
  static generateApiKey(): string {
    const key = randomBytes(API_KEY_CONFIG.length).toString('hex');
    return `${API_KEY_CONFIG.prefix}${key}`;
  }
  
  // Hash password with salt
  static hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const actualSalt = salt || randomBytes(16).toString('hex');
    const hash = createHash('sha256')
      .update(password + actualSalt)
      .digest('hex');
    return { hash, salt: actualSalt };
  }
  
  // Verify password
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const { hash: newHash } = this.hashPassword(password, salt);
    return newHash === hash;
  }
  
  // Generate CSRF token
  static generateCSRFToken(): string {
    return randomBytes(32).toString('hex');
  }
  
  // Validate input against XSS
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>\"']/g, (match) => {
        const map: { [key: string]: string } = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
        };
        return map[match];
      });
  }
  
  // Generate nonce for CSP
  static generateNonce(): string {
    return randomBytes(16).toString('base64');
  }
}

// Input validation schemas
export const ValidationSchemas = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  apiKey: new RegExp(`^${API_KEY_CONFIG.prefix}[a-f0-9]{${API_KEY_CONFIG.length * 2}}$`),
  coordinates: {
    latitude: (lat: number) => lat >= -90 && lat <= 90,
    longitude: (lng: number) => lng >= -180 && lng <= 180,
  },
};

// Security middleware
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_CONFIG.headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Set CSP header
  const cspHeader = Object.entries(SECURITY_CONFIG.csp)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
  response.headers.set('Content-Security-Policy', cspHeader);
  
  return response;
}

// CORS middleware
export function applyCORS(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin');
  const { cors } = SECURITY_CONFIG;
  
  if (origin && cors.origin.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', cors.methods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', cors.allowedHeaders.join(', '));
  
  if (cors.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  return response;
}

// Authentication middleware
export async function authenticateRequest(request: NextRequest): Promise<{
  authenticated: boolean;
  user?: any;
  error?: string;
}> {
  const authHeader = request.headers.get('authorization');
  const apiKey = request.headers.get(API_KEY_CONFIG.headerName);
  
  // Check API key authentication
  if (apiKey) {
    if (!ValidationSchemas.apiKey.test(apiKey)) {
      return { authenticated: false, error: 'Invalid API key format' };
    }
    
    // Here you would validate the API key against your database
    // For now, we'll assume it's valid if it matches the format
    return { authenticated: true, user: { type: 'api-key', key: apiKey } };
  }
  
  // Check JWT authentication
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      // Here you would verify the JWT token
      // For now, we'll do basic validation
      if (token.length > 10) {
        return { authenticated: true, user: { type: 'jwt', token } };
      }
    } catch (error) {
      return { authenticated: false, error: 'Invalid JWT token' };
    }
  }
  
  return { authenticated: false, error: 'No authentication provided' };
}

// Request logging for security
export function logSecurityEvent(
  type: 'auth_success' | 'auth_failure' | 'rate_limit' | 'suspicious_activity',
  details: Record<string, any>,
  request: NextRequest
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type,
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    url: request.url,
    method: request.method,
    ...details,
  };
  
  // In production, you'd send this to your logging service
  console.log('Security Event:', JSON.stringify(logEntry, null, 2));
}

// Security audit utilities
export class SecurityAudit {
  static async checkPasswordStrength(password: string): Promise<{
    score: number;
    feedback: string[];
  }> {
    const feedback: string[] = [];
    let score = 0;
    
    if (password.length >= 8) score += 2;
    else feedback.push('Password should be at least 8 characters long');
    
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Password should contain lowercase letters');
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Password should contain uppercase letters');
    
    if (/\d/.test(password)) score += 1;
    else feedback.push('Password should contain numbers');
    
    if (/[@$!%*?&]/.test(password)) score += 1;
    else feedback.push('Password should contain special characters');
    
    if (password.length >= 12) score += 1;
    
    return { score, feedback };
  }
  
  static detectSuspiciousActivity(request: NextRequest): {
    suspicious: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    const userAgent = request.headers.get('user-agent') || '';
    const url = request.url;
    
    // Check for common bot patterns
    if (/bot|crawler|spider|scraper/i.test(userAgent)) {
      reasons.push('Bot-like user agent detected');
    }
    
    // Check for suspicious URL patterns
    if (url.includes('..') || url.includes('<script>')) {
      reasons.push('Suspicious URL pattern detected');
    }
    
    // Check for rapid requests (would need rate tracking in real implementation)
    // This is a simplified check
    if (request.headers.get('x-forwarded-for')?.includes(',')) {
      reasons.push('Multiple proxy headers detected');
    }
    
    return {
      suspicious: reasons.length > 0,
      reasons,
    };
  }
}

export default {
  SECURITY_CONFIG,
  JWT_CONFIG,
  API_KEY_CONFIG,
  SecurityUtils,
  ValidationSchemas,
  applySecurityHeaders,
  applyCORS,
  authenticateRequest,
  logSecurityEvent,
  SecurityAudit,
};