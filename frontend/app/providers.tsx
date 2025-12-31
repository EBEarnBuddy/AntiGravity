"use client";

import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import { NotificationListener } from "@/components/NotificationListener";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <NotificationListener />
            <Toaster position="bottom-right" toastOptions={{ duration: 5000 }} />
            {children}
        </AuthProvider>
    );
}
