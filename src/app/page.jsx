"use client";
import Image from "next/image";
import bgCircles from "../../public/bg_circles.svg";
import { CircleUserRound, Instagram, InstagramIcon, Menu, XIcon, Zap } from "lucide-react";
import MainInputs from "@/components/main-inputs";
// import BuyModal from "@/components/BuyModal";
import { useState, useEffect } from "react";
import { submitToGrok } from "@/app/actions/submitToGrok";
import { createClient } from "@supabase/supabase-js";
import AuthModal from "@/components/AuthModal";
// import { supabaseClient } from "@/lib/supabaseClient";
// import { getUserTokens, addTokens } from "@/lib/supabaseServer"; // Wait, addTokens is server, but get is ok client if RLS allows
import { marked } from "marked";
import { SignUpForm } from "@/components/sign-up-form";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
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
    localStorage.setItem("pendingCountries", JSON.stringify(countries));

    if (!user) {
      setShowAuth(true);
      return;
    }

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
    <div className="relative min-h-screen flex justify-center pt-[15px]">
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
            <div className="burger_button flex text-[30px] items-center justify-center bg-[#ffffff76] rounded-[30px] h-[48px] w-[78px]">
              {/* <Menu size={36} /> */}
              <Zap size={30} className="mr-[4px]"/> {tokens}
            </div>
            <div className="account_button flex justify-center items-center bg-[#ffffff76] rounded-[100px] h-[48px] w-[48px]">
              <CircleUserRound size={36} />
            </div>
          </div>
          {/* <div className="text-[#414141] heading_buttons w-full flex justify-between  ">
            <a href="https://www.instagram.com/g.zhann/" target="blank" className="bg-[#ffffff76] rounded-[10px] p-[5px]">
              <InstagramIcon size={32}/>
            </a>
            <a href="https://www.tiktok.com/@g.zhann1" target="blank" className="bg-[#ffffff76] rounded-[10px] p-[5px] ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#414141"
                width="32px"
                height="32px"
                viewBox="0 0 32 32"
                version="1.1"
              >
                <title>tiktok</title>
                <path d="M16.656 1.029c1.637-0.025 3.262-0.012 4.886-0.025 0.054 2.031 0.878 3.859 2.189 5.213l-0.002-0.002c1.411 1.271 3.247 2.095 5.271 2.235l0.028 0.002v5.036c-1.912-0.048-3.71-0.489-5.331-1.247l0.082 0.034c-0.784-0.377-1.447-0.764-2.077-1.196l0.052 0.034c-0.012 3.649 0.012 7.298-0.025 10.934-0.103 1.853-0.719 3.543-1.707 4.954l0.020-0.031c-1.652 2.366-4.328 3.919-7.371 4.011l-0.014 0c-0.123 0.006-0.268 0.009-0.414 0.009-1.73 0-3.347-0.482-4.725-1.319l0.040 0.023c-2.508-1.509-4.238-4.091-4.558-7.094l-0.004-0.041c-0.025-0.625-0.037-1.25-0.012-1.862 0.49-4.779 4.494-8.476 9.361-8.476 0.547 0 1.083 0.047 1.604 0.136l-0.056-0.008c0.025 1.849-0.050 3.699-0.050 5.548-0.423-0.153-0.911-0.242-1.42-0.242-1.868 0-3.457 1.194-4.045 2.861l-0.009 0.030c-0.133 0.427-0.21 0.918-0.21 1.426 0 0.206 0.013 0.41 0.037 0.61l-0.002-0.024c0.332 2.046 2.086 3.59 4.201 3.59 0.061 0 0.121-0.001 0.181-0.004l-0.009 0c1.463-0.044 2.733-0.831 3.451-1.994l0.010-0.018c0.267-0.372 0.45-0.822 0.511-1.311l0.001-0.014c0.125-2.237 0.075-4.461 0.087-6.698 0.012-5.036-0.012-10.060 0.025-15.083z" />
              </svg>
            </a>
          </div> */}

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
              {isLoading ? "Processing..." : (
                <span className="flex items-center justify-center">
                SUBMIT <span className="ml-[15px] flex items-center font-semibold"><Zap className="mr-[2px]"/>1</span>
                </span>
              )}
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
              className="submit_button flex items-center justify-center mt-[30px] text-[#0f0f0f] text-[26px] font-bold w-full rounded-[14px] bg-white h-[50px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              USE AGAIN <span className="ml-[15px] flex items-center font-semibold"><Zap className="mr-[2px]"/>1</span>
            </button>
)}
          {showAuth && <SignUpForm onClose={() => setShowAuth(false)} />}
          {/* {showBuy && (
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
