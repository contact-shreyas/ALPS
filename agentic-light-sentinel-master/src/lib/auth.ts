import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';

export async function auth() {
  return getServerSession(authConfig);
}