"use client";
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import BrutalistLoader from "@/components/ui/BrutalistLoader";

export default function Profile() {
    const { currentUser } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (currentUser) {
            // Use username if available, else firebaseUid
            const handle = (currentUser as any).username || (currentUser as any).firebaseUid || currentUser.uid;
            router.replace(`/u/${handle}`);
        }
    }, [currentUser, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <BrutalistLoader />
        </div>
    );
}
