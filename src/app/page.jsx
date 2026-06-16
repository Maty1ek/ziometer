"use client";
import Image from "next/image";
import bgCircles from "../../public/bg_circles.svg";
import discordIcon from "../../public/discord.png";
import tiktokIcon from "../../public/tiktok_icon.svg";
import xIcon from "../../public/twitter_icon.webp";
import { CircleUserRound, Instagram, Lock, Plus, XIcon, Zap } from "lucide-react";
import MainInputs from "@/components/main-inputs";
import BuyModal from "@/components/BuyModal";
import { useState, useEffect, Suspense, useCallback } from "react";
import { submitToGrok } from "@/app/actions/submitToGrok";
import { SignUpForm } from "@/components/sign-up-form";
import { LoginForm } from "@/components/login-form";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
// import { useRouter } from "next/navigation";
import AccountModal from "@/components/AccountModal";
import ConfirmDelete from "@/components/ConfirmDelete";
import { supabaseClient } from "@/lib/supabaseClient";
import SearchParamsHandler from "@/components/SearchParamsHandler";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import {
  getPlanDisplayName,
  hasFullBreakdownAccess,
  isPaidPlan,
  PENDING_PLAN_STORAGE_KEY,
} from "@/lib/account";

const stripMarkdownInline = (value = "") =>
  value
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const getBreakdownPreview = (markdown = "") => {
  const normalized = markdown.replace(/\r/g, "").trim();

  if (!normalized) {
    return {
      heading: "",
      body: "",
      hiddenMarkdown: "",
    };
  }

  const lines = normalized.split("\n");
  let heading = "";
  let bodyLines = [];
  let bodyStarted = false;
  let remainingStartIndex = lines.length;

  for (let index = 0; index < lines.length; index += 1) {
    const trimmedLine = lines[index].trim();

    if (!heading && trimmedLine.startsWith("## ")) {
      heading = stripMarkdownInline(trimmedLine.replace(/^##\s+/, ""));
      continue;
    }

    if (!trimmedLine) {
      if (bodyStarted) {
        remainingStartIndex = index + 1;
        break;
      }

      continue;
    }

    if (trimmedLine.startsWith("## ")) {
      remainingStartIndex = index;
      break;
    }

    if (/^[-*+]\s+/.test(trimmedLine)) {
      if (bodyStarted) {
        remainingStartIndex = index;
        break;
      }

      remainingStartIndex = index;
      break;
    }

    bodyStarted = true;
    bodyLines.push(trimmedLine);
  }

  const body = stripMarkdownInline(bodyLines.join(" "));
  const hiddenMarkdown = lines.slice(remainingStartIndex).join("\n").trim();

  return {
    heading,
    body,
    hiddenMarkdown: hiddenMarkdown || normalized,
  };
};

const markdownComponents = {
  h2: ({ children }) => (
    <h2 className="mt-[18px] mb-[8px] text-[20px] font-bold leading-[1.35] text-[#243344]">
      {children}
    </h2>
  ),
};

export default function Home() {
  // const searchParams = useSearchParams(); // HOOK FOR URL PARAMS
  // const router = useRouter();
  const igLink = process.env.NEXT_PUBLIC_SOCIAL_INSTA_LINK;
  const tiktokLink = process.env.NEXT_PUBLIC_SOCIAL_TIKTOK_LINK;
  const xLink = process.env.NEXT_PUBLIC_SOCIAL_X_LINK;
  const discordLink = process.env.NEXT_PUBLIC_SOCIAL_DISCORD_LINK;

  const [countries, setCountries] = useState([{ country: "", years: "" }]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [showLockedResult, setShowLockedResult] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [resetPassword, setResetPassword] = useState(false);
  const [showBuy, setShowBuy] = useState(false);
  const [warning, setWarning] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedPlanKey, setSelectedPlanKey] = useState(null);

  const [showAccount, setShowAccount] = useState(false);

  const [isPollingPayment, setIsPollingPayment] = useState(false);

  const resetMainState = useCallback(() => {
    setCountries([{ country: "", years: "" }]);
    setAiResponse(null);
    setShowLockedResult(false);
    setWarning(false);
    setError(null);
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    resetMainState();
    setShowBuy(false);
    setShowAuth(false);
    setShowLogin(false);
    setIsPollingPayment(true);
  }, [resetMainState]);

  const refreshCurrentUser = async () => {
    const response = await fetch("/api/auth", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to refresh user");
    }

    const data = await response.json();
    const nextUser = data.user ?? null;

    setUser(nextUser);
    return nextUser;
  };

  // useEffect(() => {
  //   if (searchParams.get("payment") === "success") {
  //     setIsPollingPayment(true);

  //     const savedPending = localStorage.getItem("pendingSubmit");
  //     if (savedPending === "false") {
  //       setPendingSubmit(true);
  //     }

  //     router.replace("/");
  //   }
  // }, [searchParams, router]);

  useEffect(() => {
    let intervalId;
    let timeoutId;

    if (isPollingPayment) {
      const pollPaidPlan = async () => {
        try {
          const nextUser = await refreshCurrentUser();

          if (isPaidPlan(nextUser?.user_metadata?.plan)) {
            setIsPollingPayment(false);
            setSelectedPlanKey(null);
            localStorage.removeItem(PENDING_PLAN_STORAGE_KEY);
          }
        } catch (err) {
          console.error("Payment refresh failed:", err);
        }
      };

      pollPaidPlan();
      intervalId = setInterval(pollPaidPlan, 2000);

      timeoutId = setTimeout(() => {
        setIsPollingPayment(false);
      }, 30000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isPollingPayment]);

  // NEW: Effect for fetching initial session and setting up listener
  useEffect(() => {
    const storedPlanKey = localStorage.getItem(PENDING_PLAN_STORAGE_KEY);

    if (storedPlanKey) {
      setSelectedPlanKey(storedPlanKey);
    }

    const fetchSession = async () => {
      try {
        await refreshCurrentUser();
      } catch (err) {
        console.error("Error fetching session:", err);
      }
    };

    fetchSession();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(() => {
      fetchSession().catch((err) => {
        console.error("Error refreshing auth state:", err);
        setUser(null);
      });
    });

    // Cleanup listener on unmount
    return () => subscription.unsubscribe();
  }, []);

  const userPlan = user?.user_metadata?.plan ?? "";
  const planLabel = getPlanDisplayName(userPlan).toUpperCase();
  const showFullBreakdown = hasFullBreakdownAccess(userPlan);
  const shouldBlurBreakdown = !showFullBreakdown;
  const accuracyValue = Number.isFinite(Number(aiResponse?.accuracy))
    ? Math.max(0, Math.min(100, Math.round(Number(aiResponse?.accuracy))))
    : 0;
  const accuracyTone =
    accuracyValue <= 40
      ? { label: "Low", color: "#ff2222" }
      : accuracyValue < 70
        ? { label: "Medium", color: "#fff700" }
        : { label: "High", color: "#00ff91" };

  const doSubmit = async (submissionCountries) => {
    if (isLoading) return; // Prevent double clicks

    setIsLoading(true);
    setError(null);
    setAiResponse(null);

    try {
      const response = await submitToGrok(submissionCountries);
      const parsedResponse =
        response && typeof response === "object" ? response : null;

      if (!parsedResponse) {
        throw new Error(
          "The AI returned an unreadable response. Please try again.",
        );
      }

      setAiResponse({
        percentage: parsedResponse?.percentage ?? 0,
        breakdownMD: parsedResponse?.breakdownMD ?? "",
        accuracy: parsedResponse?.accuracy ?? null,
      });
      setWarning(true);
    } catch (err) {
      setError(
        err.message || "Error processing request. Please try submitting again.",
      );
      console.log(err.message);
    } finally {
      setIsLoading(false);
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

    if (!isPaidPlan(userPlan)) {
      if (isLoading) return;
      setIsLoading(true);
      setError(null);
      setAiResponse(null);
      setShowLockedResult(false);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setShowLockedResult(true);
      setIsLoading(false);
      return;
    }

    await doSubmit(validCountries);
  };

  const handleLogOut = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        console.error("Logout error:", data.error || "Server error");
        setError("Failed to log out. Please try again.");
        return;
      }

      // Clear local state
      setSelectedPlanKey(null);
      localStorage.removeItem(PENDING_PLAN_STORAGE_KEY);
      resetMainState();

      // Close modal first
      setShowAccount(false);

      // Force full reload — most reliable in App Router to clear server cache
      window.location.href = "/";
    } catch (err) {
      console.error("Unexpected logout error:", err);
      setError("Logout failed.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/supa/auth/delete", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        console.error("Delete error:", data.error || "Server error");
        setError("Failed to delete account. Please try again.");
        return;
      }

      // Clear local state
      setSelectedPlanKey(null);
      localStorage.removeItem(PENDING_PLAN_STORAGE_KEY);
      resetMainState();

      // Close modal first
      setShowAccount(false);

      // Force full reload — most reliable in App Router to clear server cache
      window.location.href = "/";
    } catch (err) {
      console.error("Unexpected delete error:", err);
      setError("Deleting failed.");
    }
  };

  const lockedBreakdownPreview = getBreakdownPreview(
    aiResponse?.breakdownMD || "",
  );

  return (
    <div className="relative min-h-screen flex justify-center pt-[15px]">
      <Suspense fallback={null}>
        <SearchParamsHandler
          onPaymentSuccess={handlePaymentSuccess}
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
        <div className="mainCon z-10 flex flex-col px-[20px] items-center w-full min-w-[308px] pt-[15px] h-full pb-[40px]">
          <div className="heading_buttons w-full px-[0px] flex justify-between text-[#414141]">
            <div
              className="burger_button flex items-center gap-[10px]"
              onClick={() => setShowBuy(true)}
            >
              <div className="flex min-w-[118px] cursor-pointer items-center justify-center rounded-[30px] bg-[#ffffff76] px-[16px] text-[17px] font-black tracking-[0.08em] text-[#243344] h-[48px] uppercase">
                <Zap size={20} className="mr-[8px]" /> {planLabel}
              </div>
              {/* <div className="flex cursor-pointer text-[30px] leading-none items-center justify-center font-mdeium bg-[#ffffff76] rounded-[100%] w-[45px] h-[45px]">
                <Plus />
              </div> */}
            </div>
            <div className="flex items-center gap-[8px]">
              <div className="socials hidden md:flex items-center gap-[8px] bg-[#ffffff0f] h-[52px] rounded-[30px] px-[10px]">
                {igLink && (
                  <a
                    href={igLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex h-[35px] w-[35px] items-center justify-center rounded-[999px] bg-[#ffffff80] text-[#243344] transition hover:bg-white"
                  >
                    <Instagram size={18} />
                  </a>
                )}
                {tiktokLink && (
                  <a
                    href={tiktokLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className="flex h-[35px] w-[35px] items-center justify-center rounded-[999px] bg-[#ffffff80] transition hover:bg-white"
                  >
                    <Image src={tiktokIcon} width={18} height={18} alt="TikTok" />
                  </a>
                )}
                {xLink && (
                  <a
                    href={xLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X"
                    className="flex h-[35px] w-[35px] items-center justify-center rounded-[999px] bg-[#ffffff80] transition hover:bg-white"
                  >
                    <Image src={xIcon} width={18} height={18} alt="X" />
                  </a>
                )}
                {discordLink && (
                  <a
                    href={discordLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Discord"
                    className="flex h-[35px] w-[35px] items-center justify-center rounded-[999px] bg-[#ffffff80] transition hover:bg-white"
                  >
                    <Image src={discordIcon} width={18} height={18} alt="Discord" />
                  </a>
                )}
              </div>

              <div
                className="account_button flex cursor-pointer justify-center items-center bg-[#ffffff76] rounded-[100px] h-[48px] w-[48px]"
                onClick={() => setShowAccount(true)}
              >
                <CircleUserRound size={36} />
              </div>
            </div>
          </div>

          <div className="headings mt-[40px] flex flex-col justify-center items-center text-white">
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

          {!aiResponse && !showLockedResult && (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="submit_button mt-[30px] text-[#0f0f0f] text-[26px] font-bold w-full rounded-[14px] bg-white h-[50px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "SUBMIT"}
            </button>
          )}

          {showLockedResult && (
            <div className="w-full result-block mt-[16px]">
              <div className="response_box relative overflow-hidden" style={{ height: 400 }}>
                <h3 className="relative z-10 text-[18px] font-black text-[#1a1a1a] mb-3">Results</h3>

                <div
                  className="flex flex-col gap-3 select-none pointer-events-none"
                  style={{ filter: "blur(2px)", WebkitFilter: "blur(2px)" }}
                  aria-hidden="true"
                >
                  <p className="text-[14px] leading-relaxed text-[#333]">
                    Based on our deep research across public records, social media, interviews, business filings, and verified news sources, we found multiple notable findings about this individual. Connections include documented associations, financial links, recorded public appearances, and statements made across various platforms over the past decade.
                  </p>
                  <p className="text-[14px] leading-relaxed text-[#333]">
                    Additional context from archived sources reveals a pattern of affiliations that warrant further investigation. Cross-referencing with Epstein-related flight logs, donor records, and public political endorsements brings up relevant matches that align with the research categories.
                  </p>
                  <p className="text-[14px] leading-relaxed text-[#333]">
                    Analysis includes verified interviews, social graph relationships, business partnerships, and publicly declared ideological positions. All findings are cross-checked with trusted third-party sources before being surfaced.
                  </p>
                  <p className="text-[14px] leading-relaxed text-[#333]">
                    Our research engine has identified connections to one or more of the following categories: Jews, Zionists, Israelis, pro-Zionists, pro-Israelis, or Jeffrey Epstein&apos;s network.
                  </p>
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[16px] bg-[#ffffff80] backdrop-blur-[14px]">
                  <Lock size={28} className="text-[#555] mb-3" />
                  <p className="font-black text-[20px] text-[#1a1a1a] mb-4 text-center leading-tight">
                    Upgrade to see<br />the full results
                  </p>
                  <button
                    onClick={() => setShowBuy(true)}
                    className="h-[46px] px-10 rounded-[12px] bg-[#1a1a1a] text-white font-bold text-[14px] uppercase tracking-[1.5px] hover:bg-[#333] active:scale-[0.98] transition-all"
                  >
                    Upgrade
                  </button>
                </div>
              </div>
            </div>
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
                  <span className="font-black">{aiResponse.percentage}%</span>
                </h3>
              </div>
              <div className="divider"></div>
              <div>
                <h3 className="text-[22px] font-semibold">Accuracy: <span className="font-black">{accuracyTone.label} - {accuracyValue}% </span></h3>
                <div className="w-full bg-[#ffffff65] border border-[#6a6a6a38] mt-[10px]  rounded-[10px] h-[10px] overflow-hidden">
                  <div className='accuracy_bar h-full rounded-[10px]' style={{ width: `${accuracyValue}%`, backgroundColor: accuracyTone.color }}>
                    
                  </div>
                </div>
                  {!isPaidPlan(userPlan) && (
                    <button
                      type="button"
                      onClick={() => setShowBuy(true)}
                      className="submit_button mt-[25px] flex h-[35px] w-full items-center justify-center rounded-[14px] bg-white px-[20px] text-[20px] font-bold text-[#0f0f0f]"
                    >
                      Get higher accuracy
                    </button>
                  )}
              </div>
              <div className="divider"></div>
              <div className="breakdown">
                <h3 className="font-semibold text-[22px]">Breakdown:</h3>
                {!shouldBlurBreakdown && (
                  <div className="prose prose-sm mt-[10px] text-[#414141]">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeSanitize]}
                      components={markdownComponents}
                    >
                      {aiResponse.breakdownMD || ""}
                    </ReactMarkdown>
                  </div>
                )}

                {shouldBlurBreakdown && (
                  // <div className="prose prose-sm mt-[10px] text-[#414141]">
                  //   <ReactMarkdown
                  //     remarkPlugins={[remarkGfm]}
                  //     rehypePlugins={[rehypeSanitize]}
                  //   >
                  //     {aiResponse.breakdownMD || ""}
                  //   </ReactMarkdown>
                  // </div>
                  <div className="mt-[14px] radius-[30px] overflow-hidden">
                    <div className="relative h-[258px] overflow-hidden  ">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-[120px] " />

                      {/* <div className="relative z-30 max-w-[92%]">
                        {lockedBreakdownPreview.heading && (
                          <p className="text-[15px] font-semibold leading-[1.35] text-[#2f3f50]">
                            {lockedBreakdownPreview.heading}
                          </p>
                        )}
                        {lockedBreakdownPreview.body && (
                          <p
                            className="mt-[8px] text-[15px] leading-[1.65] text-[#45596d]"
                            style={{
                              display: "-webkit-box",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 2,
                              overflow: "hidden",
                            }}
                          >
                            {lockedBreakdownPreview.body}
                          </p>
                        )}
                      </div> */}

                      {/* <div className="absolute inset-x-[20px] top-[88px] bottom-[18px] z-10 overflow-hidden"> */}
                        {/* <div className="prose prose-sm max-w-none text-[#4b6074] opacity-75 blur-[6px]"> */}
                          <div className="p-[10px]">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeSanitize]}
                            components={markdownComponents}
                          >
                            {aiResponse.breakdownMD}
                          </ReactMarkdown>
                          </div>
                        {/* </div> */}
                      {/* </div> */}
                      <div className="bg-[#f5f8fb51] inset-0 radius-[10px] absolute top-0 h-full w-full bd_blur"></div>
                      <div className="bg-[#f5f8fb51] inset-0 radius-[10px] absolute top-0 h-full w-full bd_blur"></div>
                      <div className="bg-[#f5f8fb51] inset-0 radius-[10px] absolute top-0 h-full w-full bd_blur"></div>

                      <div className="absolute inset-0 rounded-[5px] z-30 flex flex-col items-center justify-center ] px-[20px] text-center ">
                        <p className="text-[28px] font-bold  text-[#080808]">
                          Get full breakdown
                        </p>
                        <button
                          onClick={() => setShowBuy(true)}
                          className="submit_button mt-[14px] flex h-[40px] min-w-[176px] items-center justify-center rounded-[16px] bg-white px-[28px] text-[21px] font-bold text-[#0f0f0f] shadow-[0_12px_30px_rgba(73,112,153,0.16)]"
                        >
                          Upgrade
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {(aiResponse || showLockedResult) && (
            <button
              onClick={() => {
                setAiResponse(null);
                setShowLockedResult(false);
              }}
              className="submit_button flex items-center justify-center mt-[30px] text-[#0f0f0f] text-[26px] font-bold w-full rounded-[14px] bg-white h-[50px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              USE AGAIN
            </button>
          )}

          {showAuth && (
            <SignUpForm
              selectedPlanKey={selectedPlanKey}
              onAuthSuccess={(nextUser) => {
                if (nextUser) {
                  setUser(nextUser);
                }
              }}
              onLogin={(planKey) => {
                setShowAuth(false);
                setShowLogin(true);
                setSelectedPlanKey(planKey ?? null);
              }}
              onClose={() => {
                setShowAuth(false);
                if (selectedPlanKey) {
                  setShowBuy(true);
                }
              }}
            />
          )}
          {showLogin && (
            <LoginForm
              selectedPlanKey={selectedPlanKey}
              onAuth={(planKey) => {
                setShowLogin(false);
                setShowAuth(true);
                setSelectedPlanKey(planKey ?? null);
              }}
              onAuthSuccess={async () => {
                await refreshCurrentUser();
              }}
              onClose={() => {
                setShowLogin(false);
                if (selectedPlanKey) {
                  setShowBuy(true);
                }
              }}
              onReset={() => setResetPassword(true)}
            />
          )}
          {resetPassword && (
            <ForgotPasswordForm
              onLogin={() => setShowLogin(true)}
              onClose={() => {
                setResetPassword(false);
              }}
            />
          )}
          {showBuy && (
            <BuyModal
              user={user}
              onSelectPlan={(planKey) => {
                setSelectedPlanKey(planKey);
                localStorage.setItem(PENDING_PLAN_STORAGE_KEY, planKey);
                setShowBuy(false);
                setShowAuth(true);
              }}
              onClose={() => {
                setShowBuy(false);
              }}
            />
          )}

          {showAccount && user ? (
            <AccountModal
              onClose={() => setShowAccount(false)}
              logOut={handleLogOut}
              user={user}
              onDelete={() => setConfirmDelete(true)}
            />
          ) : showAccount && !user ? (
            <LoginForm
              onAuth={() => {
                setSelectedPlanKey(null);
                setShowAuth(true);
              }}
              onClose={() => {
                setShowLogin(false);
                setShowAccount(false);
              }}
              onReset={() => setResetPassword(true)}
            />
          ) : (
            ""
          )}

          {confirmDelete && (
            <ConfirmDelete
              onAccDelete={handleDeleteAccount}
              onClose={() => setConfirmDelete(false)}
            />
          )}

<div className="socials flex md:hidden items-center gap-[11px] bg-[#ffffff0f] h-[62px] rounded-[34px] mt-[20px] px-[14px]">
                {igLink && (
                  <a
                    href={igLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex h-[42px] w-[42px] items-center justify-center rounded-[999px] bg-[#ffffff80] text-[#243344] transition hover:bg-white"
                  >
                    <Instagram size={22} />
                  </a>
                )}
                {tiktokLink && (
                  <a
                    href={tiktokLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className="flex h-[42px] w-[42px] items-center justify-center rounded-[999px] bg-[#ffffff80] transition hover:bg-white"
                  >
                    <Image src={tiktokIcon} width={21} height={21} alt="TikTok" />
                  </a>
                )}
                {xLink && (
                  <a
                    href={xLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X"
                    className="flex h-[42px] w-[42px] items-center justify-center rounded-[999px] bg-[#ffffff80] transition hover:bg-white"
                  >
                    <Image src={xIcon} width={21} height={21} alt="X" />
                  </a>
                )}
                {discordLink && (
                  <a
                    href={discordLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Discord"
                    className="flex h-[42px] w-[42px] items-center justify-center rounded-[999px] bg-[#ffffff80] transition hover:bg-white"
                  >
                    <Image src={discordIcon} width={30} height={30} alt="Discord" />
                  </a>
                )}
              </div>
        </div>
      </div>
    </div>
  );
}
