"use client";

import { createWhopCheckout } from "@/app/actions/createWhopCheckout";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  isValidUsername,
  normalizeUsername,
  usernameToEmail,
} from "@/lib/account";

export function SignUpForm({ className, ...props }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [acknowledgeNoReset, setAcknowledgeNoReset] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const normalizedUsername = normalizeUsername(username);

    if (!normalizedUsername) {
      setUsernameStatus("idle");
      return;
    }

    if (!isValidUsername(normalizedUsername)) {
      setUsernameStatus("invalid");
      return;
    }

    let isCancelled = false;
    const timeoutId = setTimeout(async () => {
      try {
        setUsernameStatus("checking");

        const response = await fetch(
          `/api/auth/check-username?username=${encodeURIComponent(
            normalizedUsername
          )}`
        );
        const data = await response.json();

        if (isCancelled) {
          return;
        }

        setUsernameStatus(response.ok && data.available ? "available" : "taken");
      } catch {
        if (!isCancelled) {
          setUsernameStatus("error");
        }
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [username]);

  const usernameStatusMeta = {
    idle: null,
    checking: {
      label: "Checking...",
      labelClass: "text-[#6b7b8d]",
    },
    available: {
      label: "Available",
      labelClass: "text-[#1c9b63]",
    },
    taken: {
      label: "Taken",
      labelClass: "text-red-500",
      detail: "This username is already taken.",
    },
    invalid: {
      label: "Invalid",
      labelClass: "text-[#c47a1a]",
      detail:
        "Username must be 3-30 characters and use only letters, numbers, dots, dashes, or underscores.",
    },
    error: {
      label: "Retry",
      labelClass: "text-red-500",
      detail: "Could not check username right now.",
    },
  };

  const validateUsername = async () => {
    const normalizedUsername = normalizeUsername(username);

    if (!isValidUsername(normalizedUsername)) {
      throw new Error(
        "Username must be 3-30 characters and use only letters, numbers, dots, dashes, or underscores."
      );
    }

    const response = await fetch(
      `/api/auth/check-username?username=${encodeURIComponent(normalizedUsername)}`
    );
    const data = await response.json();

    if (!response.ok || !data.available) {
      throw new Error(data.error || "Username is already taken.");
    }

    return normalizedUsername;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (!acknowledgeNoReset) {
      setError("You must confirm that the password cannot be reset.");
      setIsLoading(false);
      return;
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const normalizedUsername = await validateUsername();
      const generatedEmail = usernameToEmail(normalizedUsername);

      const { error: signUpError } = await supabase.auth.signUp({
        email: generatedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: normalizedUsername,
          },
        },
      });

      if (signUpError) throw signUpError;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (props.selectedPlanKey) {
        if (!user?.id) {
          throw new Error(
            "Account created, but checkout could not start automatically. Please log in and try again."
          );
        }

        const checkoutUrl = await createWhopCheckout(props.selectedPlanKey);
        window.location.href = checkoutUrl;
        return;
      }

      props.onAuthSuccess?.(user ?? null);
      props.onClose();

      // router.push('/auth/sign-up-success')
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("already") &&
        error.message.toLowerCase().includes("registered")
      ) {
        setError("Username is already taken.");
        return;
      }

      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-6 fixed inset-0 bg-[#c7c7c7c4] backdrop-blur-[3px] bg-opacity-80  items-center justify-center p-[20px] z-50",
        className
      )}
      {...props}
    >
      <Card className="relative">
        <X
          className="absolute top-[12px] right-[12px]"
          onClick={props.onClose}
        />
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          {/* <CardDescription>Create a new account</CardDescription> */}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex items-center gap-[10px]">
                  <Input
                    id="username"
                    type="text"
                    placeholder="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1"
                  />
                  {usernameStatusMeta[usernameStatus] && (
                    <span
                      className={`min-w-[72px] text-right text-[12px] font-semibold ${usernameStatusMeta[usernameStatus].labelClass}`}
                    >
                      {usernameStatusMeta[usernameStatus].label}
                    </span>
                  )}
                </div>
                {usernameStatusMeta[usernameStatus]?.detail && (
                  <p
                    className={`text-[12px] ${usernameStatusMeta[usernameStatus].labelClass}`}
                  >
                    {usernameStatusMeta[usernameStatus].detail}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Repeat Password</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              <label className="flex items-start gap-[10px] rounded-[10px] border border-[#e5e7eb] bg-[#f8fafc] px-[12px] py-[10px] text-[13px] leading-[1.45] text-[#4a5565]">
                <input
                  type="checkbox"
                  checked={acknowledgeNoReset}
                  onChange={(e) => setAcknowledgeNoReset(e.target.checked)}
                  className="mt-[2px] h-[15px] w-[15px] shrink-0"
                />
                <span>I understand that the password cannot be reset later.</span>
              </label>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={
                  isLoading ||
                  !acknowledgeNoReset ||
                  !username.trim() ||
                  usernameStatus === "checking" ||
                  usernameStatus === "taken" ||
                  usernameStatus === "invalid" ||
                  usernameStatus === "error"
                }
              >
                {isLoading
                  ? "Creating an account..."
                  : props.selectedPlanKey
                    ? "Create account & continue"
                    : "Sign up"}
              </Button>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    props.onClose();
                    props.onLogin(props.selectedPlanKey);
                  }}
                  className="underline underline-offset-4"
                >
                  Login
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
