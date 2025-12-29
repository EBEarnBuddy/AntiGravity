"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

const PUBLIC_PATHS = ['/login', '/register', '/lander', '/', '/forgot-password'];

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
    const { userProfile, loading, currentUser } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (loading) return;

        const checkOnboarding = () => {
            // If not logged in, stick to public paths or let AuthGuard handle it
            if (!currentUser) {
                setIsChecking(false);
                return;
            }

            // If logged in but valid profile hasn't loaded yet (or failed), wait
            if (!userProfile) {
                // Maybe still loading profile? AuthContext says loading=false implies profile attempt done.
                // If really null, maybe sync failed. Allow access or show error?
                // For now, assume if currentUser exists, userProfile should eventually exist.
                // But if loading is false and userProfile is null, we might be in a weird state.
                // Let's assume we proceed to avoid blocking if profile fetch failed.
                setIsChecking(false);
                return;
            }

            const isOnboardingPage = pathname?.startsWith('/onboarding');
            const isPublicPage = PUBLIC_PATHS.includes(pathname || '');

            if (userProfile.onboardingCompleted) {
                // User has finished onboarding
                if (isOnboardingPage) {
                    // Prevent re-entry
                    router.replace('/dashboard');
                }
            } else {
                // User has NOT finished onboarding
                if (!isOnboardingPage && !isPublicPage) {
                    // Force to onboarding
                    router.replace('/onboarding');
                }
            }
            setIsChecking(false);
        };

        checkOnboarding();
    }, [userProfile, loading, currentUser, pathname, router]);

    if (loading || isChecking) {
        // Optional: Return a spinner or skeleton here
        return null;
    }

    return <>{children}</>;
}
