"use client";

import React, { useMemo, useState } from "react";
import { Search, ChevronDown, ExternalLink, Info } from "lucide-react";
import { COMPANIES, STATUS_META, LIST_EXPLAINER } from "@/lib/boycott-data";
import { searchCompanies } from "@/lib/boycott";

const toneStyles = {
  avoid: { bg: "#ffe5e5", text: "#b3261e", dot: "#e5484d" },
  caution: { bg: "#fff2d9", text: "#a5670a", dot: "#f5a623" },
  clear: { bg: "#e2f5e9", text: "#1a7f4b", dot: "#2fae67" },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status];
  const s = toneStyles[meta.tone] || toneStyles.caution;
  return (
    <span
      className="inline-flex items-center gap-[6px] rounded-full px-[10px] py-[3px] text-[12px] font-bold"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      <span className="h-[7px] w-[7px] rounded-full" style={{ backgroundColor: s.dot }} />
      {meta.label}
    </span>
  );
}

function CompanyCard({ company }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full rounded-[15px] bg-[#ffffff70] backdrop-blur-[4px] shadow-[0_4px_16px_rgba(36,51,68,0.10)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-[10px] px-[16px] py-[14px] text-left"
      >
        <div className="min-w-0">
          <h3 className="text-[17px] font-extrabold text-[#243344] truncate">{company.name}</h3>
          <p className="text-[13px] text-[#5c6b7a]">{company.category}</p>
        </div>
        <div className="flex items-center gap-[8px] shrink-0">
          <StatusBadge status={company.status} />
          <ChevronDown
            size={18}
            className={`text-[#8a97a4] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="px-[16px] pb-[16px] pt-[2px] text-[#3a4a5a]">
          <p className="text-[14px] leading-[1.5]">{company.reason}</p>

          {company.note && (
            <div className="mt-[10px] flex gap-[8px] rounded-[10px] bg-[#eaf1f8] px-[11px] py-[9px] text-[13px] text-[#41576d]">
              <Info size={15} className="mt-[1px] shrink-0" />
              <span>{company.note}</span>
            </div>
          )}

          {company.alternatives?.length > 0 && (
            <p className="mt-[10px] text-[13px]">
              <span className="font-bold text-[#243344]">Instead try: </span>
              {company.alternatives.join(", ")}
            </p>
          )}

          {company.listedBy?.length > 0 && (
            <div className="mt-[10px] flex flex-wrap gap-[8px]">
              {company.listedBy.map((src, i) =>
                src.url ? (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-[5px] rounded-full bg-[#ffffff] px-[10px] py-[4px] text-[12px] font-medium text-[#2f6bb3] hover:underline"
                  >
                    <ExternalLink size={12} /> {src.org}
                  </a>
                ) : (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full bg-[#ffffff] px-[10px] py-[4px] text-[12px] font-medium text-[#5c6b7a]"
                  >
                    {src.org}
                  </span>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BoycottPage() {
  const [query, setQuery] = useState("");
  const [showExplainer, setShowExplainer] = useState(false);

  const results = useMemo(() => searchCompanies(query), [query]);

  return (
    <div className="relative min-h-screen flex justify-center pt-[20px]">
      <div className="w-full max-w-[500px] px-[20px] pb-[110px]">
        <h1 className="text-[30px] font-black text-[#243344]">Boycott list</h1>
        <p className="mt-[6px] text-[15px] text-[#41576d]">
          Search a brand or company to see if it&apos;s on a boycott list, who listed it, and why.
        </p>

        {/* Explainer */}
        <button
          type="button"
          onClick={() => setShowExplainer((v) => !v)}
          className="mt-[14px] flex w-full items-center justify-between rounded-[12px] bg-[#ffffff70] px-[14px] py-[11px] text-left"
        >
          <span className="flex items-center gap-[8px] text-[14px] font-bold text-[#243344]">
            <Info size={16} /> {LIST_EXPLAINER.title}
          </span>
          <ChevronDown size={16} className={`text-[#8a97a4] transition-transform ${showExplainer ? "rotate-180" : ""}`} />
        </button>
        {showExplainer && (
          <p className="mt-[8px] rounded-[12px] bg-[#ffffff55] px-[14px] py-[12px] text-[13.5px] leading-[1.55] text-[#41576d]">
            {LIST_EXPLAINER.body}
          </p>
        )}

        {/* Search */}
        <div className="mt-[16px] flex items-center gap-[10px] rounded-[14px] bg-white px-[14px] h-[50px] shadow-[0_4px_16px_rgba(36,51,68,0.10)]">
          <Search size={20} className="text-[#8a97a4]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search e.g. Coca-Cola, HP, McDonald's"
            className="w-full bg-transparent text-[16px] text-[#243344] outline-none placeholder-[#9aa7b4]"
          />
        </div>

        <p className="mt-[14px] mb-[8px] text-[13px] font-semibold text-[#5c6b7a]">
          {results.length} {results.length === 1 ? "result" : "results"}
        </p>

        <div className="flex flex-col gap-[10px]">
          {results.map((c) => (
            <CompanyCard key={c.slug} company={c} />
          ))}
          {results.length === 0 && (
            <div className="rounded-[15px] bg-[#ffffff70] px-[16px] py-[22px] text-center">
              <p className="text-[15px] font-bold text-[#243344]">No match on our lists</p>
              <p className="mt-[4px] text-[13px] text-[#5c6b7a]">
                Absence from the list is not an endorsement — we only track a curated set of companies.
              </p>
            </div>
          )}
        </div>

        <p className="mt-[20px] text-[12px] leading-[1.5] text-[#5c6b7a]">
          Listings reflect the positions of the organizations cited, not our own claims. Found an error?
          Report it and we&apos;ll review the source.
        </p>
      </div>
    </div>
  );
}
