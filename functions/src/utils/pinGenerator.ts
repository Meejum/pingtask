import { randomBytes } from 'crypto';

// 30 chars, excluding ambiguous: 0/O, 1/I/L
const PIN_CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const PIN_LENGTH = 8;

export function generatePin(): string {
  let pin = '';
  const bytes = randomBytes(PIN_LENGTH);
  for (let i = 0; i < PIN_LENGTH; i++) {
    pin += PIN_CHARSET[bytes[i] % PIN_CHARSET.length];
  }
  return pin;
}
