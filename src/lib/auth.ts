import { cookies } from "next/headers";

const COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  return process.env.APP_SECRET || "default-dev-secret";
}

function getPin(): string {
  return process.env.APP_PIN || "123456";
}

async function hmacSign(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  return Buffer.from(signature).toString("hex");
}

async function hmacVerify(
  payload: string,
  signature: string
): Promise<boolean> {
  const expected = await hmacSign(payload);
  return expected === signature;
}

export function verifyPin(pin: string): boolean {
  return pin === getPin();
}

export async function createToken(): Promise<string> {
  const payload = JSON.stringify({
    authenticated: true,
    iat: Date.now(),
  });
  const signature = await hmacSign(payload);
  const token = Buffer.from(payload).toString("base64") + "." + signature;
  return token;
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return false;

    const payload = Buffer.from(payloadB64, "base64").toString();
    const valid = await hmacVerify(payload, signature);
    if (!valid) return false;

    const data = JSON.parse(payload);
    const age = Date.now() - data.iat;
    if (age > COOKIE_MAX_AGE * 1000) return false;

    return true;
  } catch {
    return false;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;
    return verifyToken(token);
  } catch {
    return false;
  }
}
