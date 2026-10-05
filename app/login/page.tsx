"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, MIN_PASSWORD } from "@/lib/auth";
import { useLog, DEFAULT_PROFILE } from "@/lib/store";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const { saveProfile } = useLog();

  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === "signup";

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = isSignup ? signUp(name, email, password) : signIn(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    // A brand-new account starts with the goal-first onboarding, not someone else's diary.
    if (isSignup) saveProfile({ ...DEFAULT_PROFILE, onboarded: false });
    router.replace("/");
  }

  return (
    <div className="flex-1 scroll-region px-6 pt-14 pb-8 flex flex-col">
      <div className="mb-10">
        <p className="font-display font-medium text-[22px] tracking-tight text-ink mb-8">
          Eazy<span className="text-gold">Log</span>
        </p>
        <h1 className="font-display text-[30px] leading-[1.1] font-medium text-ink mb-3">
          {isSignup ? "Start with your goal." : "Welcome back."}
        </h1>
        <p className="text-[14px] text-dim leading-relaxed">
          {isSignup
            ? "Make an account to save your log and add friends. Setting up your targets takes about a minute."
            : "Sign in to pick up your streak where you left it."}
        </p>
      </div>

      <form onSubmit={submit} noValidate className="flex flex-col">
        {isSignup && (
          <label className="block mb-3">
            <span className="block text-[12px] text-faint mb-1.5">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Alex Morgan"
              className="field-input"
            />
          </label>
        )}

        <label className="block mb-3">
          <span className="block text-[12px] text-faint mb-1.5">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            className="field-input"
          />
        </label>

        <label className="block mb-2">
          <span className="block text-[12px] text-faint mb-1.5">Password</span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={isSignup ? `At least ${MIN_PASSWORD} characters` : "Your password"}
              className="field-input pr-14"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-dim"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <div className="min-h-[40px] mb-3" aria-live="polite">
          {error && <p className="text-[12.5px] text-red leading-snug pt-1.5">{error}</p>}
        </div>

        <button
          type="submit"
          className="w-full text-center text-[14px] font-medium text-bg bg-gold rounded-card py-3.5 active:scale-[0.99] transition-transform"
        >
          {isSignup ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="text-[13px] text-dim text-center mt-6">
        {isSignup ? "Already have an account?" : "New to EazyLog?"}{" "}
        <button
          type="button"
          onClick={() => switchMode(isSignup ? "signin" : "signup")}
          className="text-gold"
        >
          {isSignup ? "Sign in" : "Create an account"}
        </button>
      </p>

      <p className="text-[11.5px] text-faint text-center mt-auto pt-10 leading-relaxed">
        Prototype: no server yet. Any valid email and a {MIN_PASSWORD}+ character password will sign you in.
      </p>
    </div>
  );
}
