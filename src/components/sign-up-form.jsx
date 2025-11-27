"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";

export function SignUpForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSocialLogin = async (e) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const {error} = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/oauth?next=/`,
        },
      });

      console.log('hello', data);
      

      if (error) throw error;

      // if (data.session) {
        // Immediate session (rare if confirmation enabled)
        await supabase.auth.getSession(); 
        props.onClose();
      // } else {
      //   // Confirmation pending – show UI message
      //   setError("Check your email to confirm signup!"); // Or use a success toast/state
      //   props.onClose(); // Still close modal
      // }
    
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const data = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      console.log('hello', data);


      if (error) throw error;

      const dataSD = await supabase.auth.getSession();
      console.log(dataSD, 'IOIOIO');
      
      props.onClose();

      // router.push('/auth/sign-up-success')
    } catch (error) {
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
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
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating an account..." : "Sign up"}
              </Button>
              <Button
                type="button"
                onClick={handleSocialLogin}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Continue with Google"}
              </Button>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <button
                  onClick={() => {
                    props.onClose();
                    props.onLogin();
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
