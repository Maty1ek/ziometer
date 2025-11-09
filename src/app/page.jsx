"use client";
import Image from "next/image";
import bgCircles from "../../public/bg_circles.svg";
import { CircleUserRound, Menu, XIcon } from "lucide-react";
import MainInputs from "@/components/main-inputs";
import BuyModal from "@/components/BuyModal";
import { useState, useEffect } from "react";
import { submitToGrok } from "@/app/actions/submitToGrok";
import { createClient } from "@supabase/supabase-js";
import AuthModal from "@/components/AuthModal";
import { supabaseClient } from "@/lib/supabaseClient";
import { getUserTokens, addTokens } from "@/lib/supabaseServer"; // Wait, addTokens is server, but get is ok client if RLS allows
import { marked } from "marked";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [countries, setCountries] = useState([{ country: "", years: "" }]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [showBuy, setShowBuy] = useState(false);
  const [warning, setWarning] = useState(false)

  // Auth listener
  // useEffect(() => {
  //   const session = supabase.auth.getSession();
  //   setUser(session?.user ?? null);
  //   supabase.auth.onAuthStateChange((_event, session) => {
  //     setUser(session?.user ?? null);
  //   });
  // }, []);

  // Fetch tokens on user change
  // useEffect(() => {
  //   if (!user) {
  //     setTokens(0);
  //     return;
  //   }
  //   const fetchTokens = async () => {
  //     const res = await fetch("/api/getTokens", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ userId: user.id }),
  //     });
  //     const data = await res.json();
  //     setTokens(data.tokens);
  //   };
  //   fetchTokens();
  // }, [user]);

  // Load pending countries from localStorage
  // useEffect(() => {
  //   const saved = localStorage.getItem("pendingCountries");
  //   if (saved) setCountries(JSON.parse(saved));
  // }, []);

  const handleSubmit = async () => {
    const validCountries = countries.filter(
      (row) => row.country.trim() && row.years.trim()
    );
    if (validCountries.length === 0) {
      setError("Please enter at least one country and years.");
      return;
    }

    // Save pending
    // localStorage.setItem("pendingCountries", JSON.stringify(countries));

    // if (!user) {
    //   setShowAuth(true);
    //   return;
    // }

    // if (tokens < 1) {
    //   setShowBuy(true);
    //   return;
    // }

    setIsLoading(true);
    setError(null);
    setAiResponse(null);

    try {
      const response = await submitToGrok(validCountries);
      // Deduct token server-side (add to submitToGrok or separate action)
      // await addTokens(user.id, -1); // Negative for deduct
      setAiResponse(response);
      setWarning(true)

      // localStorage.removeItem("pendingCountries"); // Clear on success
      setTokens(tokens - 1); // Update local
    } catch (err) {
      setError(err.message || "Error processing request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex justify-center items-center">
      <div className="bg_circles absolute flex justify-center top-[-10px] w-full overflow-hidden">
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
          {/* <div className="heading_buttons w-full px-[0px] flex justify-between text-white">
            <div className="burger_button">
              <Menu size={36} />
            </div>
            <div className="account_button">
              <CircleUserRound size={36} />
            </div>
          </div> */}

          <div className="headings mt-[30px] flex flex-col justify-center items-center text-white">
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
              {isLoading ? "Processing..." : "SUBMIT"}
            </button>
          )}

          { aiResponse && warning &&
           (
            <div className="err_warn relative w-full mt-[20px] h-[100px] text-[#fff] px-[12px] py-[10px] border border-[#ff2d2d30]">
              <h4 className="text-[#FF3737] font-semibold">Warning!!!</h4>

              <p className="text-white text-[12px]">
                This app is built with AI. There can be mistakes, the results
                are not 100% accurate. Please do not trust this app completely.
              </p>
              <XIcon size="18" className="absolute right-[10px] top-[10px]" onClick={() => setWarning(false)} />
            </div>
          ) }

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
              {/* <div className="money_spent text-[18px]">
                <h3 className=" font-semibold">
                  Total amount of money sent to Israel in your lifespan by your
                  residences:
                </h3>
                <h4 className="font-black mt-[20px] text-[20px]">5 billion $USD</h4>
              </div>
              <div className="divider"></div> */}
              <div className="breakdown">
                <h3 className="font-semibold text-[22px]">Breakdown:</h3>
                <p
                  className="prose prose-sm mt-[10px]"
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(
                      JSON.parse(aiResponse).breakdownMD || ""
                    ),
                  }}
                />
              </div>
            </div>
          )}

{aiResponse && (
  <button
              onClick={() => setAiResponse(null)}
              // disabled={isLoading}
              className="submit_button mt-[30px] text-[#0f0f0f] text-[26px] font-bold w-full rounded-[14px] bg-white h-[50px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              USE AGAIN
            </button>
)}
          {/* {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
          {showBuy && (
            <BuyModal user={user} onClose={() => setShowBuy(false)} />
          )} */}

          {/* Token display */}
          {/* <div className="absolute top-[10px] right-[10px] flex items-center text-white">
            <span className="mr-[5px]">Tokens:</span>
            <span className="font-bold">{tokens}</span>
          </div> */}
        </div>
      </div>
    </div>
  );
}

// const AuthModal = ({ onClose }) => {
//   const signIn = async () => {
//     await supabase.auth.signInWithPassword({ email: 'test@email.com', password: 'pass' }); // Replace with form
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-[20px]">
//       <div className="bg-white rounded-[15px] max-w-[500px] w-full p-[20px]">
//         <h2 className="font-bold text-[24px] text-center">Log In or Sign Up</h2>
//         <button onClick={signIn} className="w-full p-[10px] bg-blue-500 text-white rounded-[10px] mt-[20px]">Log In</button>
//         <button onClick={onClose} className="w-full text-[#414141] text-[15px] underline mt-[10px]">Cancel</button>
//       </div>
//     </div>
//   );
// };
