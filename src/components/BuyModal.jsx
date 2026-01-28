// components/BuyModal.jsx
"use client";
import { createWhopCheckout } from "@/app/actions/createWhopCheckout";
import { PLANS } from "@/lib/plans";
import { WhopCheckoutEmbed } from "@whop/checkout/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BuyModal({ user, onClose, onBuySuccess }) {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const router = useRouter()
  

  const handleBuy = async (planKey) => {
    if (!user?.id) {
      alert("User not authenticated – log in first");
      return;
    }

    setLoadingPlan(planKey);

    try {
     
      const checkoutUrl = await createWhopCheckout(planKey);

      // Redirect user to Whop
      window.location.href = checkoutUrl; // Redirect to Whop checkout
      // setSessionId(id);
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Checkout failed – try again");
    } finally {
      setLoadingPlan(null);
    }
  };

  // if (sessionId) {
  //   return (
  //     <WhopCheckoutEmbed
  //       sessionId={sessionId}
  //       onComplete={(paymentId) => console.log("Paid:", paymentId)}
  //     />
  //   );
  // }

  return (
    <div className="flex flex-col gap-6 fixed inset-0 bg-[#c7c7c723] backdrop-blur-[3px] bg-opacity-80 items-center justify-center p-[20px] z-50">
      <div className="bg-white rounded-[15px] max-w-[500px] w-full p-[20px] space-y-[15px] text-[#414141]">
        <h2 className="font-bold text-[24px] text-center">
          Choose a Token Pack
        </h2>

        {/* Iterate over your PLANS object */}
        {Object.entries(PLANS).map(([key, p]) => (
          <button
            key={key}
            onClick={() => handleBuy(key)} // Passing the KEY ('starter', etc)
            disabled={loadingPlan === key}
            className="w-full p-[10px] bg-[#fafafa] rounded-[10px] text-left hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-gray-200"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-[18px]">
                {p.price} – {p.tokens} tokens
              </span>
              {loadingPlan === key && (
                <span className="text-xs text-blue-500 animate-pulse">
                  Redirecting...
                </span>
              )}
            </div>
            <div className="text-[15px] text-gray-500">{p.desc}</div>
          </button>
        ))}

        <button
          onClick={onClose}
          className="w-full text-[#414141] text-[15px] underline hover:text-black mt-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
