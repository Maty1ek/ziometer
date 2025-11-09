// app/success/page.js
'use client';
import { useEffect } from 'react';

export default function Success() {
  useEffect(() => {
    setTimeout(() => window.location.href = '/', 2000);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fafafa] text-[#414141] p-[20px] max-w-[500px] mx-auto">
      <h1 className="font-bold text-[24px] mb-[10px]">Tokens Added!</h1>
      <p className="text-[15px]">Redirecting back to your analysis...</p>
    </div>
  );
}