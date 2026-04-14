import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const TOKEN_NAME = 'simple_payroll_token';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function signToken(userId: string, email: string) {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

export async function verifyToken(token: string) {
  const result = await jwtVerify(token, getJwtSecret());
  return result.payload as { userId: string; email: string };
}

export const authCookieName = TOKEN_NAME;
