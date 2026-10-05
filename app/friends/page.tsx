"use client";

import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Crown } from "@/components/Crown";
import { streak } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { useFriends, type DayMark, type Person, type TodayStatus } from "@/lib/friends";

const TODAY_LABEL: Record<TodayStatus, string> = {
  complete: "Finished today's log",
  logging: "Logging today",
  none: "Hasn't logged yet today",
};

export default function FriendsPage() {
  const { session, signOut } = useAuth();
  const { friends, incoming, outgoing, addByHandle, accept, decline, cancelRequest } = useFriends();

  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    const result = addByHandle(query);
    if (result.ok) {
      setFeedback({ ok: true, text: result.message });
      setQuery("");
    } else {
      setFeedback({ ok: false, text: result.error });
    }
  }

  async function copyHandle() {
    if (!session) return;
    try {
      await navigator.clipboard.writeText(`@${session.handle}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — the handle is still shown on screen
    }
  }

  return (
    <>
      <TopBar streak={streak.loggingStreak} />

      <div className="flex-1 scroll-region px-5 pb-8">
        <h1 className="font-display text-[26px] font-medium text-ink mt-2 mb-1">Friends</h1>
        <p className="text-[13px] text-dim mb-5">
          Friends see your streak and whether you've logged today. They never see your calories or weight.
        </p>

        {/* Add by username */}
        <form onSubmit={submitAdd} className="mb-2" noValidate>
          <label className="block">
            <span className="block text-[12px] text-faint mb-1.5">Add a friend by username</span>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-faint pointer-events-none">@</span>
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setFeedback(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="username"
                  className="field-input pl-7"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 px-4 rounded-card bg-gold text-bg text-[14px] font-medium active:scale-95 transition-transform"
              >
                Add
              </button>
            </div>
          </label>
        </form>
        <div className="min-h-[22px] mb-4" aria-live="polite">
          {feedback && (
            <p className={`text-[12.5px] leading-snug ${feedback.ok ? "text-green" : "text-red"}`}>{feedback.text}</p>
          )}
        </div>

        {/* Incoming requests */}
        {incoming.length > 0 && (
          <section className="mb-6" aria-label="Friend requests">
            <h2 className="text-[13px] text-dim mb-2">Requests ({incoming.length})</h2>
            <div className="flex flex-col gap-2">
              {incoming.map((p) => (
                <div key={p.id} className="flex items-center gap-3 bg-surface border hairline rounded-card px-3 py-3">
                  <Avatar person={p} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-ink truncate">{p.name}</p>
                    <p className="text-[12px] text-faint truncate">@{p.handle}</p>
                  </div>
                  <button
                    onClick={() => decline(p.id)}
                    className="text-[13px] text-dim px-2.5 py-2 border hairline rounded-card"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => accept(p.id)}
                    className="text-[13px] font-medium text-bg bg-gold px-3 py-2 rounded-card"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Friend list */}
        <section className="mb-6" aria-label="Your friends">
          <h2 className="text-[13px] text-dim mb-2">
            {friends.length > 0 ? `Your friends (${friends.length})` : "Your friends"}
          </h2>
          {friends.length === 0 ? (
            <div className="bg-surface border hairline rounded-card px-4 py-6 text-center">
              <p className="text-[14px] text-ink mb-1">No friends yet</p>
              <p className="text-[12.5px] text-faint leading-relaxed">
                Add someone by username above, or share yours so they can add you. Logging is easier with company.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {friends.map((p) => (
                <FriendRow key={p.id} person={p} />
              ))}
            </div>
          )}
        </section>

        {/* Sent requests */}
        {outgoing.length > 0 && (
          <section className="mb-6" aria-label="Sent requests">
            <h2 className="text-[13px] text-dim mb-2">Waiting for a reply</h2>
            <div className="flex flex-col gap-2">
              {outgoing.map((p) => (
                <div key={p.id} className="flex items-center gap-3 bg-surface border hairline rounded-card px-3 py-3">
                  <Avatar person={p} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-ink truncate">{p.name}</p>
                    <p className="text-[12px] text-faint truncate">@{p.handle}</p>
                  </div>
                  <button onClick={() => cancelRequest(p.id)} className="text-[13px] text-dim px-2.5 py-2 border hairline rounded-card">
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Your account */}
        {session && (
          <section className="border-t hairline pt-5" aria-label="Your account">
            <p className="text-[13px] text-dim mb-2">Your username</p>
            <div className="flex items-center justify-between bg-surface border hairline rounded-card px-4 py-3 mb-4">
              <span className="font-display text-[16px] text-ink">@{session.handle}</span>
              <button onClick={copyHandle} className="text-[13px] text-gold">
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[12.5px] text-faint truncate pr-3">Signed in as {session.email}</p>
              <button onClick={signOut} className="text-[13px] text-dim border hairline rounded-card px-3 py-2 shrink-0">
                Sign out
              </button>
            </div>
          </section>
        )}
      </div>

      <BottomNav />
    </>
  );
}

function FriendRow({ person }: { person: Person }) {
  const { remove, cheer, hasCheeredToday } = useFriends();
  const [open, setOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const cheered = hasCheeredToday(person.id);

  return (
    <div className="bg-surface border hairline rounded-card">
      <button
        onClick={() => {
          setOpen((o) => !o);
          setConfirmRemove(false);
        }}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-3 py-3 text-left"
      >
        <Avatar person={person} />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] text-ink truncate">{person.name}</p>
          <p className="text-[12px] text-faint flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-pill inline-block shrink-0 ${
                person.today === "complete" ? "bg-green" : person.today === "logging" ? "bg-gold" : "bg-faint"
              }`}
            />
            <span className="truncate">{TODAY_LABEL[person.today]}</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Flame />
          <span className="font-display text-[15px] font-medium text-ink font-tabular">{person.streak}</span>
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 border-t hairline">
          <p className="text-[12px] text-faint mt-3 mb-2">@{person.handle} · last 7 days</p>
          <div className="flex items-center gap-2 mb-4">
            {person.lastSix.map((m, i) => (
              <DayDot key={i} mark={m} />
            ))}
            <DayDot mark={person.today === "complete" ? "logged" : person.today === "logging" ? "partial" : "missed"} today />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => cheer(person.id)}
              disabled={cheered}
              className="flex-1 text-[13px] font-medium text-bg bg-gold rounded-card py-2.5 disabled:bg-surface2 disabled:text-dim"
            >
              {cheered ? "Cheer sent" : `Cheer ${person.name.split(" ")[0]} on`}
            </button>
            {confirmRemove ? (
              <button
                onClick={() => remove(person.id)}
                className="text-[13px] text-red border border-red/50 rounded-card px-3 py-2.5"
              >
                Confirm remove
              </button>
            ) : (
              <button
                onClick={() => setConfirmRemove(true)}
                className="text-[13px] text-dim border hairline rounded-card px-3 py-2.5"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DayDot({ mark, today = false }: { mark: DayMark; today?: boolean }) {
  const label =
    mark === "crown" ? "Perfect day" : mark === "logged" ? "Fully logged" : mark === "partial" ? "Partly logged" : "Missed";
  return (
    <span
      role="img"
      aria-label={`${today ? "Today: " : ""}${label}`}
      className={`w-6 h-6 rounded-pill flex items-center justify-center ${
        today ? "border border-gold" : "border hairline"
      }`}
    >
      {mark === "crown" ? (
        <Crown size={12} />
      ) : (
        <span
          className={`w-1.5 h-1.5 rounded-pill ${
            mark === "logged" ? "bg-green" : mark === "partial" ? "bg-faint" : "bg-red/70"
          }`}
        />
      )}
    </span>
  );
}

function Avatar({ person }: { person: Person }) {
  const initials = person.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      aria-hidden
      className="w-10 h-10 shrink-0 rounded-pill bg-surface2 border hairline flex items-center justify-center font-display text-[13px] text-ink"
    >
      {initials}
    </span>
  );
}

function Flame() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2c1 3-3 4-3 8a3 3 0 006 0c1.5 1 2 2.8 2 4.3A6.3 6.3 0 0112 21a6.3 6.3 0 01-5-9.7C8.5 8.5 11 7 12 2z"
        fill="#E8B23D"
      />
    </svg>
  );
}
