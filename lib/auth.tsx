"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

/**
 * PROTOTYPE AUTH — there is no server. A "session" is just a record in
 * localStorage, and any well-formed email + password (6+ chars) is accepted.
 * Swap `signIn` / `signUp` for real calls (NextAuth, Supabase, Clerk…) later;
 * the rest of the app only depends on `useAuth()`.
 */

export type Session = {
  name: string;
  email: string;
  /** Public username other people use to add you, without the @. */
  handle: string;
};

const SESSION_KEY = "eazylog:session:v1";

export type AuthResult = { ok: true } | { ok: false; error: string };

type AuthContextType = {
  session: Session | null;
  /** True once the saved session has been read from localStorage. */
  hydrated: boolean;
  signIn: (email: string, password: string) => AuthResult;
  signUp: (name: string, email: string, password: string) => AuthResult;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MIN_PASSWORD = 6;

export function handleFrom(text: string): string {
  const base = text.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16);
  return base || "eazyuser";
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0].replace(/[._-]+/g, " ").trim();
  return local ? local.replace(/\b\w/g, (c) => c.toUpperCase()) : "You";
}

function validate(email: string, password: string): string | null {
  if (!EMAIL_RE.test(email.trim())) return "Enter a valid email address, like you@example.com.";
  if (password.length < MIN_PASSWORD) return `Use a password with at least ${MIN_PASSWORD} characters.`;
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Session;
        if (s && typeof s.email === "string" && typeof s.handle === "string") setSession(s);
      }
    } catch {
      // ignore malformed/missing storage
    }
    setHydrated(true);
  }, []);

  function persist(next: Session | null) {
    setSession(next);
    try {
      if (next) window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      else window.localStorage.removeItem(SESSION_KEY);
    } catch {
      // storage may be unavailable — session just won't survive a reload
    }
  }

  const signIn: AuthContextType["signIn"] = (email, password) => {
    const problem = validate(email, password);
    if (problem) return { ok: false, error: problem };
    const clean = email.trim().toLowerCase();
    const name = nameFromEmail(clean);
    persist({ name, email: clean, handle: handleFrom(name) });
    return { ok: true };
  };

  const signUp: AuthContextType["signUp"] = (name, email, password) => {
    if (name.trim().length < 2) return { ok: false, error: "Enter your name so friends can recognize you." };
    const problem = validate(email, password);
    if (problem) return { ok: false, error: problem };
    const clean = email.trim().toLowerCase();
    persist({ name: name.trim(), email: clean, handle: handleFrom(name) });
    return { ok: true };
  };

  const signOut = () => persist(null);

  return (
    <AuthContext.Provider value={{ session, hydrated, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
