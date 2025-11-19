// components/AuthModal.jsx
'use client';
import { useState } from 'react';
import { supabaseClient } from '@/lib/supabaseClient';
import { X, XCircle } from 'lucide-react';

export default function AuthModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Invalid email');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be 6+ characters');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        // setSent(true);
      } else {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
        window.location.reload();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // if (sent) {
  //   return (
  //     <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-[20px] z-50">
  //       <div className="bg-white rounded-[15px] max-w-[500px] w-full p-[20px] text-center">
  //         <h2 className="font-bold text-[24px]">Check Your Email</h2>
  //         <p className="mt-4">We sent a verification link to:</p>
  //         <p className="font-bold">{email}</p>
  //         <p className="text-sm mt-4">Click it to get your free analysis.</p>
  //         <button onClick={onClose} className="mt-6 text-[#414141] underline">Close</button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="fixed inset-0 bg-[#c7c7c7b4] backdrop-blur-[3px] bg-opacity-80 flex items-center justify-center p-[20px] z-50">
      <div className="bg-[#f5f5f5] relative backdrop-blur-md rounded-[15px] max-w-[500px] w-full p-[20px] ">
        <h2 className="font-bold text-[28px] text-center mb-[24px]">
          {isSignUp ? 'Create Account' : 'Log In'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-[20px]">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-[10px] border rounded-[14px] bg-white"
            required
          />
          <input
            type="password"
            placeholder="Password (6+ chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-[10px] border rounded-[14px] bg-white"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full shadow-[0px_2px_10px_rgba(0,0,0,0.25)] mb-[20px] mt-[10px] p-[10px] bg-[#fafafa] rounded-[15px] font-bold disabled:opacity-50"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
          <button>

          </button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full text-[#414141] text-[15px] underline"
        >
          {isSignUp ? 'Already have account? Log in' : "Don't have account? Sign up"}
        </button>

        <button onClick={onClose} className="w-full mt-[5px] text-[#414141] text-[15px] underline">
          Cancel
        </button>
      </div>
    </div>
  );
}