import { cookies } from 'next/headers';
import { db } from './db';
import { authCookieName, verifyToken } from './auth';

export async function getCurrentUserOrThrow() {
  const token = cookies().get(authCookieName)?.value;
  if (!token) {
    throw new Error('Unauthorized');
  }

  const payload = await verifyToken(token);
  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true }
  });

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}
