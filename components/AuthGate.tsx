"use client";

import { useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

/** Sends signed-out visitors to /login and signed-in ones away from it. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { session, hydrated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const onLogin = pathname === "/login";

  useEffect(() => {
    if (!hydrated) return;
    if (!session && !onLogin) router.replace("/login");
    if (session && onLogin) router.replace("/");
  }, [hydrated, session, onLogin, router]);

  // Render nothing until we know who is here, so protected screens never flash.
  if (!hydrated) return null;
  if (!session && !onLogin) return null;
  if (session && onLogin) return null;
  return <>{children}</>;
}
