'use client'

import { createWhopCheckout } from "@/app/actions/createWhopCheckout";
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { X } from 'lucide-react'
import GoogleButton from "@/components/GoogleButton";
import { normalizeUsername, usernameToEmail } from "@/lib/account";

export function LoginForm({
  className,
  ...props
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: usernameToEmail(normalizeUsername(username)),
        password,
      })
      if (error) throw error

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (props.selectedPlanKey) {
        if (!user?.id) {
          throw new Error("Logged in, but checkout could not start automatically. Please try again.");
        }

        const checkoutUrl = await createWhopCheckout(props.selectedPlanKey)
        window.location.href = checkoutUrl
        return
      }

      props.onAuthSuccess?.(user ?? null)
      props.onClose()

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6 fixed inset-0 bg-[#c7c7c7c4] backdrop-blur-[3px] bg-opacity-80  items-center justify-center p-[20px] z-50', className)} {...props}>
      <Card className="relative">
        <X className='absolute top-[12px] right-[12px]' onClick={props.onClose}/>
        <CardHeader>

          <CardTitle className="text-2xl text-center">Login</CardTitle>
          {/* <CardDescription>Enter your email below to login to your account</CardDescription> */}
        </CardHeader>
        <CardContent>
          <GoogleButton selectedPlanKey={props.selectedPlanKey} disabled={isLoading} />
          <div className="my-4 flex items-center gap-3 text-[11px] text-[#999]">
            <span className="h-px flex-1 bg-[#e5e5e5]" />
            or
            <span className="h-px flex-1 bg-[#e5e5e5]" />
          </div>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)} />
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
                  onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : props.selectedPlanKey ? 'Login & continue' : 'Login'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <button type="button" onClick={() => {props.onClose(), props.onAuth(props.selectedPlanKey)}} className="underline underline-offset-4">
                Sign up
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
