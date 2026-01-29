import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth-config';

const handler = NextAuth(authConfig);
export { handler as GET, handler as POST };

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}