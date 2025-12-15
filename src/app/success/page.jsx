// app/success/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabase';

export default function Success() {
  // const [tokens, setTokens] = useState(null);
  // const router = useRouter();

  // useEffect(() => {
  //   const fetchTokens = async () => {
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (user) {
  //       const { data, error } = await supabase
  //         .from('profiles')
  //         .select('tokens')
  //         .eq('id', user.id)
  //         .single();
  //       if (!error) setTokens(data?.tokens ?? 0);
  //     }
  //   };

  //   fetchTokens();

  //   // Auto-redirect to home after 5s
  //   const timer = setTimeout(() => router.push('/'), 5000);
  //   return () => clearTimeout(timer);
  // }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
      <p className="text-lg mb-2">Your tokens have been added. Current balance:</p>
      <p className="text-sm text-gray-600">Redirecting to home in 5 seconds...</p>
    </div>
  );
}
