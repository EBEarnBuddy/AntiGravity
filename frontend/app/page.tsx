"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LanderPage from './lander/page';
import BrutalistLoader from '@/components/ui/BrutalistLoader';

export default function Home() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && currentUser) {
      router.push('/discover');
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <BrutalistLoader />
      </div>
    );
  }

  // If user is logged in, we are redirecting, so don't show Lander
  if (currentUser) {
    return null;
  }

  return <LanderPage />;
}
