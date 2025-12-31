"use client";

import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationListener } from "@/components/NotificationListener";
import { NotificationProvider } from "@/contexts/NotificationContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <NotificationProvider>
                <NotificationListener />
                {children}
            </NotificationProvider>
        </AuthProvider>
    );
}
