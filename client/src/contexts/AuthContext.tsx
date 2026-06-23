import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ─── Admin whitelist ──────────────────────────────────────────────────────────
// Add/remove emails here to control who gets admin access
export const ADMIN_EMAILS: string[] = [
  'pranav@classhub.com',
  'admin@classhub.com',
  'teacher@classhub.com',
];

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AdminUser {
  email: string;
  name: string;
  loginTime: Date;
}

interface AuthContextValue {
  admin: AdminUser | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

// ─── Demo passwords (email → password) ───────────────────────────────────────
// In a real app these would live server-side. For this static app they're
// intentionally kept here and can be changed freely.
const ADMIN_PASSWORDS: Record<string, string> = {
  'pranav@classhub.com': 'Pranav@2026',
  'admin@classhub.com': 'Admin@2026',
  'teacher@classhub.com': 'Teacher@2026',
};

const ADMIN_NAMES: Record<string, string> = {
  'pranav@classhub.com': 'Pranav',
  'admin@classhub.com': 'Admin',
  'teacher@classhub.com': 'Teacher',
};

const SESSION_KEY = 'classhub_admin_session';

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  // Restore session on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.email && ADMIN_EMAILS.includes(saved.email)) {
          setAdmin({ ...saved, loginTime: new Date(saved.loginTime) });
        }
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ ok: boolean; error?: string }> => {
    const normalised = email.trim().toLowerCase();

    if (!ADMIN_EMAILS.includes(normalised)) {
      return { ok: false, error: 'This email is not authorised for admin access.' };
    }

    if (ADMIN_PASSWORDS[normalised] !== password) {
      return { ok: false, error: 'Incorrect password.' };
    }

    const user: AdminUser = {
      email: normalised,
      name: ADMIN_NAMES[normalised] ?? normalised.split('@')[0],
      loginTime: new Date(),
    };

    setAdmin(user);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { ok: true };
  };

  const logout = () => {
    setAdmin(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ admin, isAdmin: admin !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
