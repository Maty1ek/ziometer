"use client";

import { createWhopCheckout } from "@/app/actions/createWhopCheckout";
import { PENDING_PLAN_STORAGE_KEY } from "@/lib/account";
import { PLANS } from "@/lib/plans";
import { Check, X } from "lucide-react";
import { useState } from "react";

export default function BuyModal({ user, onClose, onSelectPlan }) {
  const planEntries = Object.entries(PLANS);
  const defaultPlanKey = planEntries[1]?.[0] ?? planEntries[0]?.[0] ?? null;

  const [selectedPlan, setSelectedPlan] = useState(defaultPlanKey);
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleBuy = async (planKey) => {
    if (!planKey) return;

    if (!user?.id) {
      onSelectPlan?.(planKey);
      return;
    }

    setLoadingPlan(planKey);

    try {
      localStorage.setItem(PENDING_PLAN_STORAGE_KEY, planKey);
      const checkoutUrl = await createWhopCheckout(planKey);
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Checkout failed – try again");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#a9c0db40] px-[8px] pt-[28px] backdrop-blur-[12px] sm:items-center sm:p-[18px] pb-[0px] ">
      <div className="relative min-h-[78vh] max-h-[calc(100vh-16px)] w-full max-w-[640px] overflow-y-auto rounded-t-[30px] border border-[#ffffff94] bg-[linear-gradient(180deg,rgba(250,252,255,0.98),rgba(236,244,252,0.96))] p-[18px] text-[#2f3b4a] shadow-[0_30px_90px_rgba(53,86,120,0.18)] sm:min-h-0 sm:rounded-[28px] sm:p-[22px] pb-[0px] ">
        <div className="pointer-events-none absolute left-[-70px] top-[-90px] h-[150px] w-[150px] rounded-full bg-[#8fc4ff57] blur-3xl sm:h-[180px] sm:w-[180px] pb-[0px] " />
        <div className="pointer-events-none absolute bottom-[-100px] right-[-70px] h-[180px] w-[180px] rounded-full bg-[#ffffffb0] blur-3xl sm:h-[220px] sm:w-[220px] pb-[0px] " />

        <div className="relative z-10 flex min-h-[calc(78vh-36px)] flex-col sm:min-h-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 top-0 flex h-[40px] w-[40px] items-center justify-center rounded-full border border-[#d7e6f7] bg-[#ffffffcc] text-[#4e657d] transition hover:bg-white hover:text-[#243344]"
            aria-label="Close plans modal"
          >
            <X size={18} />
          </button>

          <div className="pr-[50px]">
            <h2 className="text-[24px] font-black leading-[1] tracking-[-0.04em] text-[#243344] sm:text-[30px]">
              Choose your plan
            </h2>
            <p className="mt-[8px] max-w-[420px] text-[14px] leading-[1.45] text-[#587089] sm:text-[15px] sm:leading-[1.5]">
              Pick the access level that fits you best and continue to the full
              experience.
            </p>
          </div>

          <div className="mt-[24px] grid gap-[16px] sm:mt-[28px] sm:gap-[16px] md:grid-cols-2">
            {planEntries.map(([key, plan]) => {
              const isSelected = selectedPlan === key;
              const isLoading = loadingPlan === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (!user?.id) {
                      onSelectPlan?.(key);
                      return;
                    }

                    setSelectedPlan(key);
                  }}
                  disabled={Boolean(loadingPlan)}
                  className={`relative overflow-hidden rounded-[22px] border p-[18px] text-left transition duration-200 sm:rounded-[24px] sm:p-[20px] ${
                    isSelected
                      ? "border-[#5aa7ff] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(233,244,255,0.96))] shadow-[0_20px_45px_rgba(84,146,214,0.20)]"
                      : "border-[#d9e6f2] bg-[#ffffffbf] hover:border-[#b7d7fa] hover:bg-white"
                  } ${loadingPlan ? "cursor-not-allowed opacity-80" : "hover:-translate-y-[2px]"}`}
                >
                  <div
                    className={`pointer-events-none absolute inset-0 transition ${
                      isSelected
                        ? "bg-[radial-gradient(circle_at_top_right,rgba(124,187,255,0.24),transparent_48%)]"
                        : "bg-transparent"
                    }`}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-[12px]">
                      <div className="min-w-0">
                        <h3 className="text-[20px] font-black uppercase leading-[1.02] tracking-[-0.04em] text-[#223245] sm:text-[24px]">
                          {plan.title}
                        <span className="ml-[20px] text-[0px] sm:text-[18px] font-semibold">({key})</span>

                        </h3>
                        <span className="sm:hidden text-[18px] font-semibold">({key})</span>

                        <p className="mt-[12px] text-[26px] font-black leading-none tracking-[-0.05em] text-[#111f2e] sm:text-[30px]">
                          {plan.price}
                        </p>
                      </div>

                      <span
                        className={`mt-[2px] flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-[#5aa7ff] bg-[#5aa7ff] text-white"
                            : "border-[#bfd0df] bg-white/50 text-transparent"
                        }`}
                      >
                        <Check size={14} />
                      </span>
                    </div>

                    <div className="mt-[18px] space-y-[10px]">
                      {plan.desc.map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-[10px] text-[14px] leading-[1.45] text-[#42576c] sm:text-[15px]"
                        >
                          <span className="mt-[2px] font-bold text-[#1f7ae8]">
                            -
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-[18px] text-[12px] font-semibold uppercase tracking-[0.08em] text-[#2d6fbd] sm:text-[13px]">
                      {isSelected
                        ? isLoading
                          ? "Preparing checkout..."
                          : "Selected plan"
                        : "Tap to choose"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-[18px] sm:pt-[22px]">
            <div className="rounded-t-[24px] border border-[#d9e5f0] bg-[#f7fbffea] p-[14px] backdrop-blur-xl sm:rounded-[22px] sm:p-[16px]">
              <button
                type="button"
                onClick={() => handleBuy(selectedPlan)}
                disabled={!selectedPlan || Boolean(loadingPlan)}
                className="submit_button flex h-[54px] w-full items-center justify-center rounded-[16px] bg-[#13202f] px-[18px] text-[18px] font-black text-white transition hover:bg-[#1b2d42] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[58px] sm:rounded-[18px] sm:text-[20px]"
              >
                {loadingPlan
                  ? "Redirecting to checkout..."
                  : user?.id
                    ? "Continue to Checkout"
                    : "Create Account to Continue"}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="mt-[12px] w-full text-center text-[14px] text-[#5e738a] underline underline-offset-2 transition hover:text-[#243344]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
