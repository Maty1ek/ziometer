"use client";

import React, { useMemo, useState } from "react";
import { ExternalLink, BadgeCheck, ShieldQuestion, Heart } from "lucide-react";
import { FUNDRAISERS, FUNDRAISER_CATEGORIES } from "@/lib/fundraisers-data";

export default function FundraisersPage() {
  const [cat, setCat] = useState("all");

  const list = useMemo(
    () => (cat === "all" ? FUNDRAISERS : FUNDRAISERS.filter((f) => f.category === cat)),
    [cat]
  );

  return (
    <div className="relative min-h-screen flex justify-center pt-[20px]">
      <div className="w-full max-w-[500px] px-[20px] pb-[110px]">
        <div className="flex items-center gap-[10px] text-[#243344]">
          <Heart size={26} className="fill-[#243344]" />
          <h1 className="text-[30px] font-black">Fundraisers</h1>
        </div>
        <p className="mt-[6px] text-[15px] text-[#41576d]">
          Vetted organizations getting aid to Palestinians. Tapping a card opens the organization&apos;s own
          donation page — we never handle your money.
        </p>

        {/* Category filter */}
        <div className="mt-[16px] flex flex-wrap gap-[8px]">
          {FUNDRAISER_CATEGORIES.map((c) => {
            const active = cat === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className={`rounded-full px-[14px] h-[36px] text-[13px] font-bold transition-colors ${
                  active ? "bg-[#243344] text-white" : "bg-[#ffffff70] text-[#41576d]"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="mt-[16px] flex flex-col gap-[10px]">
          {list.map((f) => (
            <a
              key={f.name}
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-[15px] bg-[#ffffff70] backdrop-blur-[4px] px-[16px] py-[14px] shadow-[0_4px_16px_rgba(36,51,68,0.10)] transition-transform active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-[10px]">
                <h3 className="text-[17px] font-extrabold text-[#243344] leading-[1.2]">{f.name}</h3>
                <ExternalLink size={16} className="mt-[3px] shrink-0 text-[#8a97a4] group-hover:text-[#2f6bb3]" />
              </div>
              <p className="mt-[6px] text-[14px] leading-[1.5] text-[#3a4a5a]">{f.blurb}</p>
              <div className="mt-[10px] flex items-center gap-[6px] text-[12px] font-semibold">
                {f.verified ? (
                  <span className="inline-flex items-center gap-[5px] text-[#1a7f4b]">
                    <BadgeCheck size={15} /> {f.verifier}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-[5px] text-[#a5670a]">
                    <ShieldQuestion size={15} /> {f.verifier}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>

        <p className="mt-[20px] text-[12px] leading-[1.5] text-[#5c6b7a]">
          We link to third-party organizations and don&apos;t process donations ourselves. Please review each
          organization before giving. &ldquo;Vetted&rdquo; reflects public registration status, not a guarantee.
        </p>
      </div>
    </div>
  );
}
