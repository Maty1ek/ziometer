"use client";
import Image from "next/image";
import bgCircles from "../../public/bg_circles.svg";
import { CircleUserRound, Plus, XIcon, Zap } from "lucide-react";
import MainInputs from "@/components/main-inputs";
import BuyModal from "@/components/BuyModal";
import { useState, useEffect, Suspense } from "react";
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


export default function Home() {
  // const searchParams = useSearchParams(); // HOOK FOR URL PARAMS
  // const router = useRouter();

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
  const [warning, setWarning] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [showAccount, setShowAccount] = useState(false);

  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [isFetchingTokens, setIsFetchingTokens] = useState(false);

  const [authLoading, setAuthLoading] = useState(true);

  const [isPollingPayment, setIsPollingPayment] = useState(false);

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

    if (isPollingPayment && user) {
      console.log("Polling for tokens started...");

      const checkTokens = async () => {
        // Initial quick check
        const response = await fetch("/api/tokens/getTokens", {
          method: "GET",
          credentials: "include", // Important for cookies
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tokens");
        }

        const { tokens: userTokens } = await response.json();

        const currentTokens = userTokens ?? 0;

        if (currentTokens > 0) {
          setTokens(currentTokens);
          setIsPollingPayment(false); // Stop polling triggers the cleanup
        }
      };

      checkTokens(); // Run once immediately

      // Run every 2 seconds
      intervalId = setInterval(checkTokens, 2000);

      // Stop automatically after 30 seconds to save resources
      setTimeout(() => {
        if (isPollingPayment) setIsPollingPayment(false);
      }, 30000);
    }

    // Cleanup: This runs when isPollingPayment becomes false OR component unmounts
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPollingPayment, user]);

  // NEW: Effect for fetching initial session and setting up listener
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth");
        const data = await res.json();

        data.session?.user && setUser(data.session?.user );
      } catch (err) {
        console.error("Error fetching session:", err);
      } finally {
        setAuthLoading(false);
      }
    };

    fetchSession();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      session?.user && setUser(session?.user );
    });

    // Cleanup listener on unmount
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("pendingCountries");
    if (saved) setCountries(JSON.parse(saved));

    const savedPending = localStorage.getItem("pendingSubmit");
    if (savedPending) {
      setPendingSubmit(JSON.parse(savedPending));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pendingSubmit", JSON.stringify(pendingSubmit));
  }, [pendingSubmit]);

  const fetchTokens = async (isDeduct) => {
    if (!user) return;
    isDeduct ? "" : setIsFetchingTokens(true);
    try {
      const response = await fetch("/api/tokens/getTokens", {
        method: "GET",
        credentials: "include", // Important for cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tokens");
      }

      const { tokens: userTokens } = await response.json();
      setTokens(userTokens);
    } finally {
      isDeduct ? "" : setIsFetchingTokens(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTokens();
    } else {
      setTokens(0);
    }
  }, [user]);

  useEffect(() => {
    // Only proceed if we are NOT currently verifying a payment
    if (isPollingPayment) return;

    if (pendingSubmit && user && !authLoading && !isFetchingTokens) {
      if (tokens >= 1) {
        // Success case: We have tokens and a pending job -> Submit
        doSubmit();
        setShowBuy(false);
      } else if (!showBuy) {
        // Fail case: No tokens -> Show buy modal
        setShowBuy(true);
      }
    }
  }, [
    user,
    pendingSubmit,
    authLoading,
    isFetchingTokens,
    tokens,
    isPollingPayment,
  ]);

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

      // 2. Clear pending storage
      localStorage.removeItem("pendingCountries");
      localStorage.removeItem("pendingSubmit");

      // 3. IMPORTANT: Update State to prevent infinite loop
      setPendingSubmit(false);

      // 4. Deduct Token
      response && (await fetchTokens(true));
    } catch (err) {
      if (err.message && err.message.includes("Unauthorized")) {
        setUser(null);
        setShowAuth(true);
      }
      setError(err.message || "Error processing request.");
      console.log(err.message);
    } finally {
      setIsLoading(false);
      // Ensure state is cleared in case of error too
      localStorage.removeItem("pendingSubmit");
      setPendingSubmit(false);
    }
  };

  const handleSubmit = async () => {
    const validCountries = countries.filter(
      (row) => row.country.trim() && row.years.trim()
    );
    if (validCountries.length === 0) {
      setError("Please enter at least one country and years.");
      return;
    }

    // Save pending
    localStorage.setItem("pendingCountries", JSON.stringify(countries));

    // CHANGED: Add authLoading check to prevent submit during initial load
    if (authLoading) {
      setError("Authenticating... please wait.");
      return;
    }

    setPendingSubmit(true);

    if (!user) {
      setShowAuth(true);
      return;
    }

    if (tokens < 1) {
      setShowBuy(true);
      return;
    }

    await doSubmit();
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
      setTokens(0);
      setAiResponse(null);
      setWarning(false);
      setError(null);
      localStorage.removeItem("pendingCountries");

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
      setTokens(0);
      setAiResponse(null);
      setWarning(false);
      setError(null);
      localStorage.removeItem("pendingCountries");

      // Close modal first
      setShowAccount(false);

      // Force full reload — most reliable in App Router to clear server cache
      window.location.href = "/";
    } catch (err) {
      console.error("Unexpected delete error:", err);
      setError("Deleting failed.");
    }
  };

  // NEW: Show loading UI during initial auth check
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading authentication...
      </div>
    );
  }
console.log(user,'ko');

  return (
    <div className="relative min-h-screen flex justify-center pt-[15px]">
      <Suspense fallback={null}>
        <SearchParamsHandler
          onPaymentSuccess={() => {
            setIsPollingPayment(true);

            // const savedPending = localStorage.getItem("pendingSubmit");
            // if (savedPending === "false") {
            //   setPendingSubmit(true);
            // }
          }}
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
              onClick={() => {
                user ? setShowBuy(true) : setShowLogin(true);
              }}
            >
              <div className="flex text-[30px] cursor-pointer items-center justify-center bg-[#ffffff76] rounded-[30px] h-[48px] w-[90px]">
                <Zap size={30} className="mr-[4px]" /> {tokens}
              </div>
              <div className="flex cursor-pointer text-[30px] leading-none items-center justify-center font-mdeium bg-[#ffffff76] rounded-[100%] w-[45px] h-[45px]">
                <Plus />
              </div>
            </div>
            <div
              className="account_button flex cursor-pointer justify-center items-center bg-[#ffffff76] rounded-[100px] h-[48px] w-[48px]"
              onClick={() => setShowAccount(true)}
            >
              <CircleUserRound size={36} />
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

          {!aiResponse && (
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
                  <span className="ml-[15px] flex items-center font-semibold">
                    <Zap className="mr-[2px]" />1
                  </span>
                </span>
              )}
            </button>
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
                <div className="prose prose-sm mt-[10px] text-[#414141]">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]} // Optional: enables tables, task lists, etc.
                    rehypePlugins={[rehypeSanitize]} // Critical for extra safety
                  >
                    {JSON.parse(aiResponse).breakdownMD || ""}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {aiResponse && (
            <button
              onClick={() => setAiResponse(null)}
              className="submit_button flex items-center justify-center mt-[30px] text-[#0f0f0f] text-[26px] font-bold w-full rounded-[14px] bg-white h-[50px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              USE AGAIN{" "}
              <span className="ml-[15px] flex items-center font-semibold">
                <Zap className="mr-[2px]" />1
              </span>
            </button>
          )}

          {showAuth && (
            <SignUpForm
              onLogin={() => setShowLogin(true)}
              onClose={() => {
                setShowAuth(false);
                if (!user) setPendingSubmit(false);
                localStorage.removeItem("pendingSubmit");
              }}
            />
          )}
          {showLogin && (
            <LoginForm
              onAuth={() => setShowAuth(true)}
              onClose={() => {
                setShowLogin(false);
                if (!user) setPendingSubmit(false);
                localStorage.removeItem("pendingSubmit");
              }}
              onReset={() => setResetPassword(true)}
            />
          )}
          {resetPassword && (
            <ForgotPasswordForm
              onLogin={() => setShowLogin(true)}
              onClose={() => {
                setResetPassword(false);
                if (!user) setPendingSubmit(false);
                localStorage.removeItem("pendingSubmit");
              }}
            />
          )}
          {showBuy && (
            <BuyModal
              user={user}
              onClose={() => {
                setShowBuy(false);
              }}
              onBuySuccess={async () => {
                await fetchTokens();
                await doSubmit();
              }}
            /> // Add onBuySuccess prop
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
              onAuth={() => setShowAuth(true)}
              onClose={() => {
                setShowLogin(false);
                setShowAccount(false);
                if (!user) setPendingSubmit(false);
                localStorage.removeItem("pendingSubmit");
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
        </div>
      </div>
    </div>
  );
}
