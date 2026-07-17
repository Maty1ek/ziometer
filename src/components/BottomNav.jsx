"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ScanBarcode, HeartHandshake } from "lucide-react";

// Persistent bottom navigation — three tabs. Account lives in the header corner,
// not here. Hidden on auth / share routes where a nav bar makes no sense.
const HIDE_ON = ["/auth", "/s/"];

const ITEMS = [
  { href: "/", label: "Home", icon: Home, match: (p) => p === "/" },
  { href: "/boycott", label: "Boycott", icon: ScanBarcode, match: (p) => p.startsWith("/boycott") },
  { href: "/fundraisers", label: "Donate", icon: HeartHandshake, match: (p) => p.startsWith("/fundraisers") },
];

export default function BottomNav() {
  const pathname = usePathname() || "/";
  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className="pointer-events-auto mb-[14px] flex w-[calc(100%-28px)] max-w-[440px] items-center justify-around rounded-[26px] bg-[#ffffffe0] px-[10px] h-[68px] shadow-[0_8px_30px_rgba(36,51,68,0.18)] backdrop-blur-[10px]">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={`flex flex-1 flex-col items-center justify-center gap-[3px] text-[11px] font-semibold transition-colors ${
                active ? "text-[#243344]" : "text-[#8a97a4]"
              }`}
            >
              <Icon size={23} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
