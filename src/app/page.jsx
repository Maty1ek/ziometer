"use client";
import Image from "next/image";
import bgCircles from "../../public/bg_circles.svg";
import { CircleUserRound, Instagram, Plus, XIcon, Zap } from "lucide-react";
import MainInputs from "@/components/main-inputs";
import BuyModal from "@/components/BuyModal";
import DonateWindow from "@/components/DonateWindow";
import { useState, useEffect, Suspense } from "react";
import { submitToGrok } from "@/app/actions/submitToGrok";
// import { SignUpForm } from "@/components/sign-up-form";
// import { LoginForm } from "@/components/login-form";
// import { ForgotPasswordForm } from "@/components/forgot-password-form";
// // import { useRouter } from "next/navigation";
// import AccountModal from "@/components/AccountModal";
// import ConfirmDelete from "@/components/ConfirmDelete";
// import { supabaseClient } from "@/lib/supabaseClient";
import SearchParamsHandler from "@/components/SearchParamsHandler";
import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import tiktok from "../../public/tiktok_icon.svg";
import twitter from "../../public/twitter_icon.webp";

export default function Home() {
  // const searchParams = useSearchParams(); // HOOK FOR URL PARAMS
  // const router = useRouter();
  const igLink = process.env.NEXT_PUBLIC_SOCIAL_INSTA_LINK;
  const tiktokLink = process.env.NEXT_PUBLIC_SOCIAL_TIKTOK_LINK;
  const xLink = process.env.NEXT_PUBLIC_SOCIAL_X_LINK;

  const [countries, setCountries] = useState([{ country: "", years: "" }]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [showBuy, setShowBuy] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [warning, setWarning] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const doSubmit = async () => {
    if (isLoading) return; // Prevent double clicks

    setIsLoading(true);
    setError(null);
    setAiResponse(null);

    try {
      // 1. Run your AI Logic
      const response = await submitToGrok(countries);
      setAiResponse(response); // Mock response
      setWarning(true);
      setShowDonate(true);
    } catch (err) {
      setError(err.message || "Error processing request.");
      console.log(err.message);
    } finally {
      setIsLoading(false);
      // Ensure state is cleared in case of error too
      // localStorage.removeItem("pendingSubmit");
      // setPendingSubmit(false);
    }
  };

  const handleSubmit = async () => {
    const validCountries = countries.filter(
      (row) => row.country.trim() && row.years.trim(),
    );
    if (validCountries.length === 0) {
      setError("Please enter at least one country and years.");
      return;
    }

    await doSubmit();
  };

  // NEW: Show loading UI during initial auth check

  console.log(user, "ko");

  return (
    <div className="relative min-h-screen flex justify-center pt-[5px]">
      <Suspense fallback={null}>
        <SearchParamsHandler
        // onPaymentSuccess={() => {
        //   setIsPollingPayment(true);

        //   const savedPending = localStorage.getItem("pendingSubmit");
        //   if (savedPending === "false") {
        //     setPendingSubmit(true);
        //   }
        // }}
        ></SearchParamsHandler>
      </Suspense>
      <div className="bg_circles absolute flex justify-center top-[-15px] w-full overflow-hidden">
        <div className="min-w-[760px]">
          <Image
            src={bgCircles}
            width={760}
            height={2000}
            className=""
            alt="Background circles"
          />
        </div>
      </div>
      <div className="flex flex-col justify-center items-center relative w-full max-w-[500px] mx-auto">
        <div className="mainCon z-10 flex flex-col px-[20px] items-center w-full min-w-[308px] pt-[26px] h-full pb-[40px]">
          <div className="heading_buttons w-full flex justify-between items-center text-[#414141]">
            <button
              type="button"
              onClick={() => setShowDonate(true)}
              className="submit_button flex items-center justify-center  text-[#0f0f0f] text-[17px] font-bold w-[190px] rounded-[34px] bg-white h-[45px]"
            >
              Donate (50% for 🇵🇸)
            </button>
            <div className="socials flex justify-center items-center gap-[12px] submit_button   bg-[#ffffff71] h-[45px] px-[15px]  rounded-[34px]">
              {igLink && (
                <a href={igLink} target="_blank" rel="noopener noreferrer">
                  <Instagram size={31} className="text-black" />
                </a>
              )}
              {tiktokLink && (
                <a href={tiktokLink} target="_blank" rel="noopener noreferrer">
                  <Image src={tiktok} width={31} height={31} alt="TikTok" />
                </a>
              )}
              {xLink && (
                <a href={xLink} target="_blank" rel="noopener noreferrer">
                  <Image src={twitter} width={31} height={31} alt="X" />
                </a>
              )}
            </div>
          </div>

          <div className="headings mt-[55px] flex flex-col justify-center items-center text-white">
            <div className="heading_title flex flex-col items-center">
              <h1 className="font-black text-[92px]">GREAT</h1>
              <h2 className="font-black text-[61px]">NOTICING</h2>
            </div>
            <p className="heading_text text-center text-[18px] w-[300px] mt-[25px]">
              Find out how much of your life has been affected by Israel
            </p>
          </div>

          <MainInputs countries={countries} setCountries={setCountries} />

          {error && (
            <div className="err_warn w-full mt-[20px] h-[70px] text-[#fff] px-[12px] py-[10px] border border-[#ff2d2d30]">
              {error}
            </div>
          )}

          {!aiResponse && (
            <>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="submit_button mt-[30px] text-[#0f0f0f] text-[26px] font-bold w-full rounded-[14px] bg-white h-[50px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  "Processing..."
                ) : (
                  <span className="flex items-center justify-center">
                    SUBMIT{" "}
                    {/* <span className="ml-[15px] flex items-center font-semibold">
                      <Zap className="mr-[2px]" />1
                    </span> */}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowDonate(true)}
                className="submit_button flex items-center justify-center mt-[15px] text-white text-[26px] font-bold w-full rounded-[14px] bg-[#0f0f0f] h-[50px]"
              >
                Support Us (50% to 🇵🇸)
              </button>
            </>
          )}

          {aiResponse && warning && (
            <div className="err_warn relative w-full mt-[20px] h-[100px] text-[#fff] px-[12px] py-[10px] border border-[#ff2d2d30]">
              <h4 className="text-[#FF3737] font-semibold">Warning!!!</h4>

              <p className="text-white text-[12px]">
                This app is built with AI. There can be mistakes, the results
                are not 100% accurate. Please do not trust this app completely.
              </p>
              <XIcon
                size="18"
                className="absolute right-[10px] top-[10px]"
                onClick={() => setWarning(false)}
              />
            </div>
          )}

          {aiResponse && (
            <div className="response_box w-full text-[#414141]">
              <div className="life_affection">
                <h3 className="text-[22px] font-semibold">
                  Your life has been affected by Israel for:{" "}
                  <span className="font-black">
                    {JSON.parse(aiResponse).percentage}%
                  </span>
                </h3>
              </div>
              <div className="divider"></div>
              <div className="breakdown">
                <h3 className="font-semibold text-[22px]">Breakdown:</h3>
                {/* <p className="font-medium text-[#6f6f6f] mt-[10px]">
                  Breakdown is currently not available cuz im broke to afford AI
                  tokens. Support project to get the breakdown in the future.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDonate(true)}
                  className="submit_button flex items-center justify-center mt-[30px] text-[#0f0f0f] text-[24px] font-bold w-full rounded-[14px] bg-white h-[45px]"
                >
                  Support Us (50% for 🇵🇸)
                </button> */}
                <div className="prose prose-sm mt-[10px] text-[#414141]">
                  <ReactMarkdown
                    rehypePlugins={[rehypeSanitize]} // Critical for extra safety
                  >
                    {JSON.parse(aiResponse).breakdownMD || ""}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {aiResponse && (
            <>
              <button
                type="button"
                onClick={() => setShowDonate(true)}
                className="submit_button flex items-center justify-center mt-[30px] text-white text-[26px] font-bold w-full rounded-[14px] bg-[#0f0f0f] h-[50px]"
              >
                Support Us (50% to 🇵🇸)
              </button>
              <button
                onClick={() => setAiResponse(null)}
                className="submit_button flex items-center justify-center mt-[15px] text-[#0f0f0f] text-[26px] font-bold w-full rounded-[14px] bg-white h-[50px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                USE AGAIN{" "}
                {/* <span className="ml-[15px] flex items-center font-semibold">
                  <Zap className="mr-[2px]" />1
                </span> */}
              </button>
            </>
          )}
        </div>
      </div>
      {showDonate && <DonateWindow onClose={() => setShowDonate(false)} />}
    </div>
  );
}
