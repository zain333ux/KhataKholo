import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPin(pin: string): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = (await scrypt(pin, salt, KEY_LENGTH)) as Buffer;

  return `scrypt$${salt}$${derivedKey.toString("base64url")}`;
}

export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  const [algorithm, salt, expectedKey] = storedHash.split("$");

  if (algorithm !== "scrypt" || !salt || !expectedKey) {
    return false;
  }

  const actualKey = (await scrypt(pin, salt, KEY_LENGTH)) as Buffer;
  const expectedBuffer = Buffer.from(expectedKey, "base64url");

  if (actualKey.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualKey, expectedBuffer);
}

