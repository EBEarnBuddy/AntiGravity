"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import { usePathname, useRouter } from 'next/navigation';

export interface TourStep {
    id: string;
    targetId: string;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'bottom-end' | 'top-end' | 'bottom-start' | 'top-start';
    page: string; // The route where this step should appear
    action?: 'next' | 'back' | 'close';
    onNext?: () => void;
}

interface TourContextType {
    isActive: boolean;
    isSkipped: boolean;
    isCompleted: boolean;
    currentStepIndex: number;
    steps: TourStep[];
    startTour: () => void;
    endTour: () => void;
    dismissForever: () => void;
    nextStep: () => void; // Made available for manual control if needed
    prevStep: () => void; // Made available for manual control if needed
    skipTour: () => void;
    resetTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const useTour = () => {
    const context = useContext(TourContext);
    if (!context) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
};

// Define the Tour Steps Configuration here for centrality
const TOUR_STEPS: TourStep[] = [
    {
        id: 'welcome',
        targetId: 'tour-dashboard-welcome',
        title: 'Welcome to EarnBuddy!',
        content: 'This is your new home for building, collaborating, and earning. Let\'s show you around.',
        position: 'bottom',
        page: '/discover'
    },
    {
        id: 'startups-nav',
        targetId: 'tour-startups-link',
        title: 'Launchpad',
        content: 'Head here to find opportunities or post your own startup.',
        position: 'bottom',
        page: '/discover'
    },
    {
        id: 'startups-create',
        targetId: 'tour-startup-create',
        title: 'Post Opportunities',
        content: 'Looking for a co-founder or early team members? Post your startup opportunity here.',
        position: 'bottom',
        page: '/startups'
    },
    {
        id: 'freelance-nav',
        targetId: 'tour-freelance-link',
        title: 'CoLancing',
        content: 'Find freelance gigs or team up with others to tackle larger projects together.',
        position: 'bottom',
        page: '/startups'
    },
    {
        id: 'freelance-notify',
        targetId: 'tour-freelance-notify',
        title: 'Coming Soon',
        content: 'We are building a new way to freelance. Get notified when we launch!',
        position: 'top',
        page: '/freelance'
    },
    {
        id: 'circles-nav',
        targetId: 'tour-circles-link',
        title: 'Circles',
        content: 'Join specialized communities and "Pods" to network, chat, and collaborate.',
        position: 'bottom',
        page: '/freelance'
    },
    {
        id: 'circles-sidebar',
        targetId: 'tour-circles-sidebar',
        title: 'Circle Types',
        content: 'Switch between Community Circles and your own Collaboration Circles here.',
        position: 'right',
        page: '/circles'
    },
    {
        id: 'circles-create',
        targetId: 'tour-circles-create',
        title: 'Create Your Own',
        content: 'Start a new circle to gather people around a topic or project.',
        position: 'bottom',
        page: '/circles'
    },
    {
        id: 'profile',
        targetId: 'tour-navbar-profile',
        title: 'Your Profile',
        content: 'Manage your account, settings, and view your reputation from here.',
        position: 'bottom-end', // Custom position we'll handle in UI
        page: '/discover' // Back to home for final step
    }
];

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, userProfile, updateProfile } = useAuth();
    const [isActive, setIsActive] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [hasCompletedThisSession, setHasCompletedThisSession] = useState(false);
    const [isSkipped, setIsSkipped] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const isCompleted = userProfile?.hasCompletedTour || false;
    const isSkippedDB = userProfile?.hasSkippedOnboarding || false;

    // Check if tour should start
    useEffect(() => {
        if (currentUser && userProfile) {
            // Logic: Must have completed onboarding AND NOT completed tour
            // We can treat isNewUser as optional extra check or just rely on tour flag
            const shouldStart = userProfile.hasCompletedOnboarding && !userProfile.hasCompletedTour;

            if (shouldStart && !isActive && !hasCompletedThisSession && !isSkipped) {
                // Determine if we are on the right page
                if (pathname === '/discover') {
                    setIsActive(true);
                }
            }
        }
    }, [currentUser, userProfile, pathname, hasCompletedThisSession, isSkipped, isActive]);

    const startTour = () => {
        setIsActive(true);
        setIsSkipped(false);
        setCurrentStepIndex(0);
        if (pathname !== '/discover') router.push('/discover');
    };

    const dismissForever = async () => {
        setIsActive(false);
        setIsSkipped(false);
        setHasCompletedThisSession(true);

        if (currentUser && userProfile && !userProfile.hasCompletedTour) {
            try {
                // Mark tour as done and isNewUser as false (fully graduated from onboarding)
                await updateProfile({ hasCompletedTour: true, isNewUser: false });

            } catch (error) {
                console.error("Failed to mark tour as completed:", error);
            }
        }
    };

    const endTour = () => {
        dismissForever();
    };

    const skipTour = async () => {
        setIsActive(false);
        setIsSkipped(true);
        // Persist skip
        if (currentUser && userProfile) {
            try {
                // If skipped, we still mark onboarding as skipped, but maybe keep isNewUser?
                // Or just mark tour done to stop pestering? Let's assume skipping means "no tour"
                await updateProfile({ hasCompletedTour: true });

            } catch (error) {
                console.error("Failed to mark tour as skipped:", error);
            }
        }
    };

    const resetTour = () => {
        setCurrentStepIndex(0);
        setIsActive(true);
        setIsSkipped(false);
        router.push('/discover');
    };

    const nextStep = () => {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
            const nextStepConfig = TOUR_STEPS[currentStepIndex + 1];

            // Handle Navigation
            if (nextStepConfig.page && nextStepConfig.page !== pathname && nextStepConfig.page !== window.location.pathname) {
                router.push(nextStepConfig.page);
            }
            setCurrentStepIndex(prev => prev + 1);
        } else {
            endTour();
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            const prevStepConfig = TOUR_STEPS[currentStepIndex - 1];
            if (prevStepConfig.page && prevStepConfig.page !== pathname) {
                router.push(prevStepConfig.page);
            }
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    return (
        <TourContext.Provider value={{
            isActive,
            isSkipped,
            isCompleted,
            currentStepIndex,
            steps: TOUR_STEPS,
            startTour,
            endTour,
            dismissForever,
            nextStep,
            prevStep,
            skipTour,
            resetTour
        }}>
            {children}
        </TourContext.Provider>
    );
};
