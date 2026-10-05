"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/lib/auth";

/**
 * PROTOTYPE FRIENDS — people come from a hard-coded directory below and the
 * relationships live in localStorage. Friends only ever share *consistency*
 * (streak, today's log status, last six days) — never calories, weight or
 * macros — which keeps the focus on logging honesty, per the PRD.
 */

export type DayMark = "crown" | "logged" | "partial" | "missed";
export type TodayStatus = "complete" | "logging" | "none";

export type Person = {
  id: string;
  name: string;
  handle: string;
  streak: number;
  today: TodayStatus;
  /** The six days before today, oldest first. */
  lastSix: DayMark[];
};

export const DIRECTORY: Person[] = [
  { id: "maya", name: "Maya Chen", handle: "mayac", streak: 21, today: "complete", lastSix: ["crown", "crown", "logged", "crown", "crown", "crown"] },
  { id: "jordan", name: "Jordan Reyes", handle: "jreyes", streak: 9, today: "logging", lastSix: ["logged", "crown", "crown", "logged", "crown", "logged"] },
  { id: "priya", name: "Priya Nair", handle: "priyan", streak: 4, today: "none", lastSix: ["missed", "missed", "logged", "logged", "crown", "logged"] },
  { id: "sam", name: "Sam Okafor", handle: "samo", streak: 2, today: "logging", lastSix: ["partial", "missed", "logged", "logged", "logged", "crown"] },
  { id: "leo", name: "Leo Fischer", handle: "leof", streak: 33, today: "complete", lastSix: ["crown", "crown", "crown", "crown", "logged", "crown"] },
  { id: "ana", name: "Ana Souza", handle: "anasouza", streak: 6, today: "none", lastSix: ["logged", "logged", "partial", "logged", "logged", "logged"] },
];

type FriendsState = {
  friendIds: string[];
  incomingIds: string[];
  outgoingIds: string[];
  /** person id -> YYYY-MM-DD of the last cheer sent. */
  cheered: Record<string, string>;
};

const INITIAL: FriendsState = {
  friendIds: ["maya", "jordan", "priya"],
  incomingIds: ["sam"],
  outgoingIds: [],
  cheered: {},
};

const STORAGE_KEY = "eazylog:friends:v1";

function dayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export type AddResult = { ok: true; message: string } | { ok: false; error: string };

type FriendsContextType = {
  friends: Person[];
  incoming: Person[];
  outgoing: Person[];
  addByHandle: (handle: string) => AddResult;
  accept: (id: string) => void;
  decline: (id: string) => void;
  cancelRequest: (id: string) => void;
  remove: (id: string) => void;
  cheer: (id: string) => void;
  hasCheeredToday: (id: string) => boolean;
};

const FriendsContext = createContext<FriendsContextType | null>(null);

const byId = (id: string) => DIRECTORY.find((p) => p.id === id);
const resolve = (ids: string[]) => ids.map(byId).filter((p): p is Person => !!p);

export function FriendsProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [state, setState] = useState<FriendsState>(INITIAL);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...INITIAL, ...JSON.parse(raw) });
    } catch {
      // ignore malformed/missing storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // fail silently
    }
  }, [state, hydrated]);

  const addByHandle: FriendsContextType["addByHandle"] = (input) => {
    const handle = input.trim().replace(/^@/, "").toLowerCase();
    if (!handle) return { ok: false, error: "Enter a username to search for." };
    if (session && handle === session.handle) return { ok: false, error: "That's your own username." };

    const person = DIRECTORY.find((p) => p.handle === handle);
    if (!person) return { ok: false, error: `No one with the username @${handle}. Check the spelling and try again.` };
    if (state.friendIds.includes(person.id)) return { ok: false, error: `You and ${person.name} are already friends.` };
    if (state.outgoingIds.includes(person.id)) return { ok: false, error: `You already sent ${person.name} a request.` };

    // They already asked us — adding them back is the same as accepting.
    if (state.incomingIds.includes(person.id)) {
      setState((s) => ({
        ...s,
        incomingIds: s.incomingIds.filter((x) => x !== person.id),
        friendIds: [...s.friendIds, person.id],
      }));
      return { ok: true, message: `You and ${person.name} are now friends.` };
    }

    setState((s) => ({ ...s, outgoingIds: [...s.outgoingIds, person.id] }));
    return { ok: true, message: `Request sent to ${person.name}.` };
  };

  const accept = (id: string) =>
    setState((s) => ({
      ...s,
      incomingIds: s.incomingIds.filter((x) => x !== id),
      friendIds: s.friendIds.includes(id) ? s.friendIds : [...s.friendIds, id],
    }));

  const decline = (id: string) => setState((s) => ({ ...s, incomingIds: s.incomingIds.filter((x) => x !== id) }));
  const cancelRequest = (id: string) => setState((s) => ({ ...s, outgoingIds: s.outgoingIds.filter((x) => x !== id) }));
  const remove = (id: string) => setState((s) => ({ ...s, friendIds: s.friendIds.filter((x) => x !== id) }));
  const cheer = (id: string) => setState((s) => ({ ...s, cheered: { ...s.cheered, [id]: dayKey() } }));
  const hasCheeredToday = (id: string) => state.cheered[id] === dayKey();

  return (
    <FriendsContext.Provider
      value={{
        friends: resolve(state.friendIds).sort((a, b) => b.streak - a.streak),
        incoming: resolve(state.incomingIds),
        outgoing: resolve(state.outgoingIds),
        addByHandle,
        accept,
        decline,
        cancelRequest,
        remove,
        cheer,
        hasCheeredToday,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends() {
  const ctx = useContext(FriendsContext);
  if (!ctx) throw new Error("useFriends must be used inside <FriendsProvider>");
  return ctx;
}
