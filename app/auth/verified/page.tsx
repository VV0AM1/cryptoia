import { Suspense } from 'react';
import VerifiedMessage from '@/components/VerifiedMessage';

export const dynamic = 'force-dynamic';

export default function VerifiedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
      <VerifiedMessage />
    </Suspense>
  );
}