"use client";

import React, { useState, useEffect, Suspense } from "react";
import { SignInPage, Testimonial } from "@/components/ui/sign-in";
import BrutalistLoader from '@/components/ui/BrutalistLoader';
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const testimonials: Testimonial[] = [
    {
        avatarSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
        name: "Aditi Bansal",
        handle: "Full-Stack Dev",
        text: "EarnBuddy solved a problem I faced. Excited to build this together."
    },
    {
        avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
        name: "Jay Agarwal",
        handle: "Founder, Ganges",
        text: "Reviewing portfolios has never been easier. I found my lead dev here."
    }
];

function AuthPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signInWithEmail, signUpWithEmail, signInWithGoogle, currentUser } = useAuth();

    const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
    const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const paramMode = searchParams.get('mode');
        if (paramMode === 'signup' || paramMode === 'signin') {
            setMode(paramMode);
        }
    }, [searchParams]);

    useEffect(() => {
        if (currentUser) {
            router.push('/discover');
        }
    }, [currentUser, router]);

    const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        try {
            setLoading(true);
            if (mode === 'signin') {
                await signInWithEmail(email, password);
                router.push('/discover');
            } else {
                const displayName = email.split('@')[0];
                await signUpWithEmail(email, password, displayName);
                router.push('/discover');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        if (loading) return;
        try {
            setLoading(true);
            await signInWithGoogle();
            router.push('/discover');
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Google Sign In failed");
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(prev => prev === 'signin' ? 'signup' : 'signin');
        setError(null);
    };

    return (
        <div className="bg-background text-foreground relative min-h-screen w-full overflow-y-auto flex flex-col">
            {error && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border-4 border-slate-900 text-slate-900 px-6 py-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] max-w-sm w-full text-center animate-in fade-in slide-in-from-top-2">
                    <span className="block sm:inline font-black uppercase text-red-600">{error}</span>
                </div>
            )}
            <SignInPage
                heroImageSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=2160&q=80"
                testimonials={testimonials}
                onSignIn={handleAuth}
                onGoogleSignIn={handleGoogleSignIn}
                onCreateAccount={toggleMode}
                mode={mode}
                isLoading={loading}
                title={<span className="text-slate-900">{mode === 'signin' ? 'Welcome Back' : 'Get Started'}</span>}
                description={mode === 'signin' ? "Access your account and continue your journey" : "Join thousands of students and founders building the future."}
            />
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><BrutalistLoader /></div>}>
            <AuthPageContent />
        </Suspense>
    );
}
