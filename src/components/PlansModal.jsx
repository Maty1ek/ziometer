"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { XIcon, Check, Sparkles } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { PENDING_PLAN_STORAGE_KEY } from "@/lib/account";
import { createWhopCheckout } from "@/app/actions/createWhopCheckout";

// Paywall plan picker. Design mirrors the second folder's PlansModal (white card,
// dark selected plan, POPULAR badge). Same props as the old BuyModal so the page
// wiring is unchanged: logged-out users go to auth first, logged-in users go
// straight to Whop checkout.
export default function PlansModal({ user, onClose, onSelectPlan }) {
  const planEntries = useMemo(() => Object.entries(PLANS), []);
  const defaultKey =
    planEntries.find(([, p]) => p.default)?.[0] ?? planEntries[0]?.[0] ?? null;

  const [selected, setSelected] = useState(defaultKey);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) return;

    // Not logged in → hand back to the page to run the auth flow first.
    if (!user?.id) {
      onSelectPlan?.(selected);
      return;
    }

    setLoading(true);
    try {
      localStorage.setItem(PENDING_PLAN_STORAGE_KEY, selected);
      const checkoutUrl = await createWhopCheckout(selected);
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Checkout failed – please try again.");
      setLoading(false);
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="modal-card relative bg-white rounded-[20px] border border-[#e0e0e0] p-5 sm:p-7 w-full max-w-[420px] shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-[#bbb] hover:text-[#555] transition-colors"
          aria-label="Close"
        >
          <XIcon size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-[22px] font-black text-[#1a1a1a]">Choose your plan</h2>
          <p className="text-[13px] text-[#888] mt-1.5">Unlock your full results</p>
        </div>

        <div className="flex flex-col gap-3">
          {planEntries.map(([key, plan]) => {
            const isSelected = selected === key;
            return (
              <div
                key={key}
                onClick={() => setSelected(key)}
                className={`relative cursor-pointer rounded-[14px] border-2 p-4 transition-all ${
                  isSelected
                    ? "bg-[#1a1a1a] border-[#1a1a1a] text-white shadow-lg"
                    : "bg-white border-[#e8e8e8] text-[#1a1a1a] hover:border-[#ccc]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[17px]">{plan.name}</span>
                    {plan.best && (
                      <span
                        className={`flex items-center gap-0.5 rounded-full text-[9px] font-bold px-2 py-[3px] leading-none ${
                          isSelected ? "bg-white text-black" : "bg-[#f0f0f0] text-[#666]"
                        }`}
                      >
                        <Sparkles size={8} />
                        BEST
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="font-bold text-[18px]">{plan.price}</span>
                    <span className={`text-[12px] ${isSelected ? "text-white/60" : "text-[#999]"}`}>
                      {plan.period}
                    </span>
                  </div>
                </div>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {plan.desc.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[13px]">
                      <Check size={14} className="text-[#22c55e] shrink-0" />
                      <span className={isSelected ? "text-white/90" : "text-[#555]"}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="mt-5 w-full h-[50px] rounded-[12px] bg-[#1a1a1a] text-white font-bold text-[15px] uppercase tracking-[2px] hover:bg-[#333] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? "Redirecting…"
            : user?.id
              ? "Continue to payment"
              : "Register and continue"}
        </button>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
