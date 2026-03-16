
// Secure client-side authentication using Web Crypto API (PBKDF2) + localStorage

const USERS_KEY = 'kurdai_users';
const SESSION_KEY = 'kurdai_session';
const PBKDF2_ITERATIONS = 200_000;

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

// --- Crypto helpers ---

async function deriveKey(password: string, salt: Uint8Array): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return bufToHex(new Uint8Array(bits));
}

function bufToHex(buf: Uint8Array): string {
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToUint8Array(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return arr;
}

// --- Storage helpers ---

function loadUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// --- Public API ---

export async function register(username: string, email: string, password: string): Promise<User> {
  const users = loadUsers();

  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('EMAIL_EXISTS');
  }
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('USERNAME_EXISTS');
  }

  const salt = crypto.getRandomValues(new Uint8Array(32));
  const passwordHash = await deriveKey(password, salt);

  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    username,
    email: email.toLowerCase(),
    createdAt: new Date().toISOString(),
    passwordHash,
    salt: bufToHex(salt),
  };

  saveUsers([...users, newUser]);
  const { passwordHash: _ph, salt: _s, ...publicUser } = newUser;
  return publicUser;
}

export async function login(email: string, password: string): Promise<User> {
  const users = loadUsers();
  const stored = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!stored) throw new Error('INVALID_CREDENTIALS');

  const hash = await deriveKey(password, hexToUint8Array(stored.salt));
  if (hash !== stored.passwordHash) throw new Error('INVALID_CREDENTIALS');

  const { passwordHash: _ph, salt: _s, ...publicUser } = stored;
  return publicUser;
}

export function saveSession(user: User): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function loadSession(): User | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
