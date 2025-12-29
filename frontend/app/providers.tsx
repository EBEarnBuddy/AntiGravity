"use client";

import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import OnboardingGuard from "@/components/OnboardingGuard";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <OnboardingGuard>
                {children}
            </OnboardingGuard>
        </AuthProvider>
    );
}
