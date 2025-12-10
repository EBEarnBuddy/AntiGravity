"use client";

import React, { useState, useEffect } from "react";
import { SignInPage, Testimonial } from "@/components/ui/sign-in";
import { useRouter } from "next/navigation";
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

export default function AuthPage() {
    const router = useRouter();
    const { signInWithEmail, signUpWithEmail, signInWithGoogle, currentUser } = useAuth();
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [error, setError] = useState<string | null>(null);

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
            if (mode === 'signin') {
                await signInWithEmail(email, password);
                router.push('/discover');
            } else {
                const displayName = email.split('@')[0];
                await signUpWithEmail(email, password, displayName);
                router.push('/onboarding');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Authentication failed");
        }
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        try {
            await signInWithGoogle();
            router.push('/discover');
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Google Sign In failed");
        }
    };

    const toggleMode = () => {
        setMode(prev => prev === 'signin' ? 'signup' : 'signin');
        setError(null);
    };

    return (
        <div className="bg-background text-foreground relative">
            {error && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg max-w-sm w-full text-center animate-in fade-in slide-in-from-top-2">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <SignInPage
                heroImageSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=2160&q=80"
                testimonials={testimonials}
                onSignIn={handleAuth}
                onGoogleSignIn={handleGoogleSignIn}
                onCreateAccount={toggleMode}
                mode={mode}
                title={<span className="text-slate-900">{mode === 'signin' ? 'Welcome Back' : 'Get Started'}</span>}
                description={mode === 'signin' ? "Access your account and continue your journey" : "Join thousands of students and founders building the future."}
            />
        </div>
    );
};
