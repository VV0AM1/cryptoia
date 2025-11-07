

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<'login' | 'otp'>('login');
  const [tempToken, setTempToken] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || 'Login failed');
      return;
    }

    setTempToken(data.tempToken);
    setStage('otp');
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, code: otp, tempToken }),
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok || !data.otpToken) {
      setError(data?.message || "Invalid code");
      return;
    }

    const loginResult = await signIn("credentials", {
      redirect: false,
      email: form.email,
      otpToken: data.otpToken, 
    });

    if (loginResult?.error) {
      setError(loginResult.error || "Failed to log in after verification");
      return;
    }

    router.replace("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white px-4">
      <div className="bg-zinc-800 p-6 rounded-lg w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Login</h1>

        {stage === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-2 rounded bg-zinc-700 text-white"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full p-2 rounded bg-zinc-700 text-white"
              required
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded">
              Sign In
            </button>

            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="flex items-center justify-center w-full gap-2 border border-gray-600 py-2 rounded hover:bg-zinc-700"
            >
              <FcGoogle className="text-xl" />
              Continue with Google
            </button>
          </form>
        )}

        {stage === 'otp' && (
          <form onSubmit={handleOtpVerify} className="space-y-3">
            <p className="text-sm text-gray-300">Enter the OTP sent to your email:</p>
            <input
              type="text"
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 rounded bg-zinc-700 text-white"
              required
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 py-2 rounded">
              Verify OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
}