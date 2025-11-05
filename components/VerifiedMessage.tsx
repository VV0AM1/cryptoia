'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VerifiedMessage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get('email');

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 text-white">
      <div className="bg-zinc-800 p-6 rounded-lg text-center shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-green-400 mb-3">Email Verified 🎉</h1>
        <p className="text-gray-300 mb-1">
          {email ? `Your account (${email}) has been successfully verified.` : 'Your account has been verified.'}
        </p>
        <p className="text-gray-400 text-sm">Redirecting to home page in 5 seconds...</p>
        <div className="mt-4 animate-bounce text-green-400 text-xl">✓</div>
      </div>
    </div>
  );
}