"use client";
import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { XIcon, ExternalLink, Lock, Zap } from "lucide-react";

const accuracyColor = (val) => {
  if (val < 30) return "#F2C94C";
  if (val < 50) return "#6FCF97";
  if (val < 70) return "#56CCF2";
  if (val < 85) return "#EB7AB1";
  return "#9B51E0";
};

const accuracyLabel = (val) => {
  if (val < 41) return "Low";
  if (val < 71) return "Medium";
  return "High";
};

export default function ShowResults({ aiResponse, isPaid, onUpgrade }) {
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);

  const parsed = useMemo(() => {
    if (!aiResponse) return null;
    try {
      if (typeof aiResponse === "string") {
        const cleaned = aiResponse.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
        return JSON.parse(cleaned);
      }
      return aiResponse;
    } catch {
      return null;
    }
  }, [aiResponse]);

  if (!parsed) return null;

  const { short_result, accuracy, full_details, sources = [] } = parsed;
  const acc = Math.max(0, Math.min(100, Number(accuracy) || 0));
  const color = accuracyColor(acc);
  const label = accuracyLabel(acc);

  return (
    <div className="w-full result-block">
      {/* Result */}
      <div className="response_box">
        <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-2">Result</h3>
        <p className="text-[14px] leading-relaxed text-[#333]">{short_result}</p>
      </div>

      {/* Accuracy */}
      <div className="response_box">
        <div className="flex items-baseline gap-2">
          <h3 className="text-[18px] font-bold text-[#1a1a1a]">Accuracy</h3>
          <span style={{ color }} className="text-[20px] font-bold">{acc}%</span>
          <span style={{ color }} className="text-[13px] font-medium">({label})</span>
        </div>
        <div className="w-full mt-3 rounded-full bg-[#e8e8e8] h-[6px] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${acc}%`, backgroundColor: color }}
          />
        </div>
        {!isPaid && (
          <div className="mt-4 rounded-[12px] overflow-hidden border border-[#e2d0ff]">
            <div className="bg-gradient-to-br from-[#faf5ff] to-[#f3e8ff] px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Zap size={13} className="text-[#9333ea] shrink-0" fill="#9333ea" />
                <span className="text-[11px] font-bold text-[#7c3aed] uppercase tracking-[0.9px]">Limited free result</span>
              </div>
              <p className="text-[12.5px] text-[#555] leading-[1.5]">
                Paid users get <strong className="text-[#1a1a1a]">deeper research</strong>, verified sources & accuracy up to <strong className="text-[#1a1a1a]">90%+</strong>
              </p>
            </div>
            <button
              onClick={onUpgrade}
              className="w-full h-[46px] text-white font-bold text-[13px] uppercase tracking-[1.5px] transition-all active:scale-[0.99]"
              style={{
                background: "linear-gradient(90deg, #C76CFF 0%, #9333ea 100%)",
                boxShadow: "0 4px 16px rgba(147,51,234,0.28)",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.92"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              Unlock Higher Accuracy →
            </button>
          </div>
        )}
      </div>

      {/* Full details */}
      <div className="response_box relative overflow-hidden">
        <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-3">Full details & research</h3>

        {isPaid ? (
          full_details ? (
            <div className="prose prose-sm max-w-none text-[14px] leading-relaxed text-[#333] [&_h2]:text-[15px] [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_strong]:font-semibold [&_li]:mt-1 [&_ul]:pl-4 [&_ol]:pl-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {full_details}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-[14px] text-[#888]">No detailed data available.</p>
          )
        ) : (
          <div className="relative min-h-[170px]">
            <div className="flex flex-col gap-3 py-2">
              <div className="skeleton w-[92%] h-[10px] rounded-full" />
              <div className="skeleton w-[78%] h-[10px] rounded-full" />
              <div className="skeleton w-[85%] h-[10px] rounded-full" />
              <div className="skeleton w-[68%] h-[10px] rounded-full" />
              <div className="skeleton w-[90%] h-[10px] rounded-full" />
              <div className="skeleton w-[72%] h-[10px] rounded-full" />
              <div className="skeleton w-[80%] h-[10px] rounded-full" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[14px] py-[20px] bg-[#ffffff3f] backdrop-blur-[4px]">
              <Lock size={28} className="text-[#888] mb-3" />
              <p className="font-bold text-[18px] text-[#1a1a1a] mb-1">Get full breakdown</p>
              <p className="text-[13px] text-[#888] mb-4">Upgrade to unlock detailed research</p>
              <button
                onClick={onUpgrade}
                className="h-[42px] px-8 rounded-[10px] bg-[#1a1a1a] text-white font-bold text-[14px] uppercase tracking-[1.5px] hover:bg-[#333] active:scale-[0.98] transition-all"
              >
                Upgrade
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sources button */}
      {sources.length > 0 && (
        <button
          onClick={() => setIsSourcesOpen(true)}
          className="submit_button mt-[20px] text-white text-[18px] font-bold w-full rounded-[14px] bg-[#C76CFF] h-[50px] tracking-[1px] hover:bg-[#b85ee8] active:scale-[0.98] transition-all"
        >
          SEE THE SOURCES
        </button>
      )}

      {/* Sources modal — portaled to body so it's always screen-centered */}
      {isSourcesOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5 fade-in"
          onClick={() => setIsSourcesOpen(false)}
        >
          <div
            className="modal-card bg-white rounded-[16px] max-w-[500px] w-full p-6 text-[#1a1a1a] max-h-[80vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-[20px]">Sources</h3>
              <button
                onClick={() => setIsSourcesOpen(false)}
                className="text-[#aaa] hover:text-[#333] transition-colors"
                aria-label="Close sources"
              >
                <XIcon size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex flex-col gap-2 -mr-2 pr-2">
              {sources.length === 0 ? (
                <p className="text-[#888] text-center text-[14px] py-8">No sources available</p>
              ) : (
                sources.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-[10px] bg-[#f7f7f7] border border-[#eee] px-4 py-3 hover:bg-[#f0f0f0] hover:border-[#ddd] transition-all group"
                  >
                    <ExternalLink size={14} className="text-[#aaa] group-hover:text-blue-500 shrink-0 transition-colors" />
                    <span className="text-blue-600 text-[13px] break-all group-hover:underline">{url}</span>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
