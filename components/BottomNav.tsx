"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Today", icon: HomeIcon },
  { href: "/history", label: "History", icon: HistoryIcon },
  { href: "/calendar", label: "Calendar", icon: CalendarIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="relative border-t hairline bg-bg">
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center gap-1 py-3"
            >
              <Icon active={active} />
              <span
                className={`text-[11px] tracking-wide ${
                  active ? "text-ink" : "text-faint"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>

      <Link
        href="/log"
        aria-label="Log food"
        className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-pill bg-gold text-bg flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(232,178,61,0.5)] active:scale-95 transition-transform"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </Link>
    </div>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 11.5L12 4l8 7.5M6 10v9h12v-9"
        stroke={active ? "#F1EFE9" : "#5E616B"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HistoryIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 6h16M4 12h10M4 18h7"
        stroke={active ? "#F1EFE9" : "#5E616B"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" stroke={active ? "#F1EFE9" : "#5E616B"} strokeWidth="1.8" />
      <path d="M4 10h16M8 3.5v3M16 3.5v3" stroke={active ? "#F1EFE9" : "#5E616B"} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
