import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/api/auth/[...nextauth]/route';

export async function auth() {
  return getServerSession(authConfig);
}