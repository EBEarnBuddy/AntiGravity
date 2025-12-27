"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

// Inner component to access auth context
import { TourProvider } from "@/components/tour/TourContext";
import { ProductTour } from "@/components/tour/ProductTour";

function ProtectedShell({ children }: { children: React.ReactNode }) {
    const { currentUser, userProfile, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!currentUser) {
                router.push('/auth');
            } else if (userProfile && !userProfile.hasCompletedOnboarding) {
                router.push('/onboarding');
            }
        }
    }, [currentUser, userProfile, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!currentUser) return null;

    // Check if we're on the circles page
    const isCirclesPage = pathname === '/circles';

    return (
        <TourProvider>
            <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-600">
                <Navbar />
                <main className={isCirclesPage ? "flex-1 w-full" : "flex-1 w-full max-w-7xl mx-auto p-8 pt-8"}>
                    {children}
                </main>
                <ProductTour />
            </div>
        </TourProvider>
    );
}

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedShell>{children}</ProtectedShell>
    );
}
