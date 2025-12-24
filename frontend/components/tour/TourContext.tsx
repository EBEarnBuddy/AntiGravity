"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FirestoreService } from '@/lib/firestore';
import { usePathname, useRouter } from 'next/navigation';

export interface TourStep {
    id: string;
    targetId: string;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    page: string; // The route where this step should appear
    action?: 'next' | 'back' | 'close';
    onNext?: () => void;
}

interface TourContextType {
    isActive: boolean;
    currentStepIndex: number;
    steps: TourStep[];
    startTour: () => void;
    endTour: () => void;
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
        id: 'startups',
        targetId: 'tour-startups-link',
        title: 'Launchpad',
        content: 'Browse innovative startups, or post your own opportunity to find co-founders and team members.',
        position: 'bottom',
        page: '/discover' // Showing this while on discover, pointing to nav
    },
    {
        id: 'freelance',
        targetId: 'tour-freelance-link',
        title: 'CoLancing',
        content: 'Find freelance gigs or team up with others to tackle larger projects together.',
        position: 'bottom',
        page: '/discover'
    },
    {
        id: 'circles',
        targetId: 'tour-circles-link',
        title: 'Circles',
        content: 'Join specialized communities and "Pods" to network, chat, and collaborate in real-time.',
        position: 'bottom',
        page: '/discover'
    },
    {
        id: 'workbench',
        targetId: 'tour-dashboard-workbench',
        title: 'My Workbench',
        content: 'Track your active applications and saved opportunities right here.',
        position: 'top',
        page: '/discover'
    },
    {
        id: 'profile',
        targetId: 'tour-navbar-profile',
        title: 'Your Profile',
        content: 'Build your reputation. Your contributions and history help you stand out.',
        position: 'bottom',
        page: '/discover'
    }
];

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, userProfile, updateProfile } = useAuth();
    const [isActive, setIsActive] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const pathname = usePathname();
    const router = useRouter();

    // Check if tour should start
    useEffect(() => {
        if (currentUser && userProfile && !userProfile.productTourCompleted) {
            // Only auto-start if we are on the discovery page or if we handle multi-page routing
            // For simplicity, we start it when they land on dashboard/discover
            if (pathname === '/discover') {
                setIsActive(true);
            }
        }
    }, [currentUser, userProfile, pathname]);

    const startTour = () => {
        setIsActive(true);
        setCurrentStepIndex(0);
    };

    const endTour = async () => {
        setIsActive(false);
        if (currentUser && userProfile && !userProfile.productTourCompleted) {
            try {
                // Update local state optimistic if needed, but Context updates via auth sync
                const updated = { ...userProfile, productTourCompleted: true };
                await updateProfile({ productTourCompleted: true });
                // Also hard update firestore just in case
                await FirestoreService.updateUserProfile(currentUser.uid, { productTourCompleted: true });
            } catch (error) {
                console.error("Failed to mark tour as completed:", error);
            }
        }
    };

    const skipTour = () => {
        endTour();
    };

    const resetTour = () => {
        setCurrentStepIndex(0);
        setIsActive(true);
    };

    const nextStep = () => {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
            const nextStepConfig = TOUR_STEPS[currentStepIndex + 1];
            // If next step is on a different page, we might need to route (not implemented for simple version yet)
            // Current design assumes all targets are visible from /discover (nav items + feed)
            setCurrentStepIndex(prev => prev + 1);
        } else {
            endTour();
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    return (
        <TourContext.Provider value={{
            isActive,
            currentStepIndex,
            steps: TOUR_STEPS,
            startTour,
            endTour,
            nextStep,
            prevStep,
            skipTour,
            resetTour
        }}>
            {children}
        </TourContext.Provider>
    );
};
