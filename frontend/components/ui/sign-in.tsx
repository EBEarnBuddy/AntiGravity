import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
    </svg>
);


// --- TYPE DEFINITIONS ---

export interface Testimonial {
    avatarSrc: string;
    name: string;
    handle: string;
    text: string;
}

interface SignInPageProps {
    title?: React.ReactNode;
    description?: React.ReactNode;
    heroImageSrc?: string;
    testimonials?: Testimonial[];
    onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
    onGoogleSignIn?: () => void;
    onResetPassword?: () => void;
    onCreateAccount?: () => void;
    mode?: 'signin' | 'signup';
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-green-400/70 focus-within:bg-green-500/10">
        {children}
    </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
    <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 p-5 w-64 text-white`}>
        <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-full border border-white/20" alt="avatar" />
        <div className="text-sm leading-snug">
            <p className="flex items-center gap-1 font-bold">{testimonial.name}</p>
            <p className="text-white/60 text-xs">{testimonial.handle}</p>
            <p className="mt-1 text-white/90 italic">"{testimonial.text}"</p>
        </div>
    </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
    title = <span className="font-light text-slate-900 tracking-tighter">Welcome</span>,
    description = "Access your account and continue your journey with us",
    heroImageSrc,
    testimonials = [],
    onSignIn,
    onGoogleSignIn,
    onResetPassword,
    onCreateAccount,
    mode = 'signin',
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="h-[100dvh] flex flex-col md:flex-row font-sans w-[100dvw] bg-white">
            {/* Left column: sign-in form */}
            <section className="flex-1 flex items-center justify-center p-8 z-10 bg-white">
                <div className="w-full max-w-md">
                    <div className="flex flex-col gap-6">
                        <div className="mb-4 animate-element animate-delay-100 flex items-center gap-2 font-bold text-2xl text-primary">
                            {/* Logo */}
                            <div className="bg-green-50 p-1 rounded-lg border border-green-100">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 17L17 7M17 7H9M17 7V15" stroke="#2f9e44" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            EarnBuddy
                        </div>

                        <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-bold leading-tight text-slate-900">{title}</h1>
                        <p className="animate-element animate-delay-200 text-slate-500">{description}</p>

                        <form className="space-y-5" onSubmit={onSignIn}>
                            <div className="animate-element animate-delay-300">
                                <label className="text-sm font-medium text-slate-600 ml-1 mb-1 block">Email Address</label>
                                <GlassInputWrapper>
                                    <input name="email" type="email" placeholder="Enter your email address" className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none placeholder:text-slate-400" />
                                </GlassInputWrapper>
                            </div>

                            <div className="animate-element animate-delay-400">
                                <label className="text-sm font-medium text-slate-600 ml-1 mb-1 block">Password</label>
                                <GlassInputWrapper>
                                    <div className="relative">
                                        <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none placeholder:text-slate-400" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center">
                                            {showPassword ? <EyeOff className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors" /> : <Eye className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors" />}
                                        </button>
                                    </div>
                                </GlassInputWrapper>
                            </div>

                            <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" name="rememberMe" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                                    <span className="text-slate-600">Keep me signed in</span>
                                </label>
                                <a href="#" onClick={(e) => { e.preventDefault(); onResetPassword?.(); }} className="hover:underline text-primary transition-colors font-medium">Reset password</a>
                            </div>

                            <button type="submit" className="animate-element animate-delay-600 w-full rounded-2xl bg-primary py-4 font-bold text-white hover:bg-green-700 transition-transform hover:-translate-y-0.5 shadow-lg shadow-green-200">
                                {mode === 'signin' ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>

                        <div className="animate-element animate-delay-700 relative flex items-center justify-center my-2">
                            <span className="w-full border-t border-slate-200"></span>
                            <span className="px-4 text-sm text-slate-400 bg-white absolute">Or continue with</span>
                        </div>

                        <button onClick={onGoogleSignIn} className="animate-element animate-delay-800 w-full flex items-center justify-center gap-3 border border-slate-200 rounded-2xl py-4 hover:bg-slate-50 transition-colors font-medium text-slate-600 bg-white">
                            <GoogleIcon />
                            Continue with Google
                        </button>

                        <p className="animate-element animate-delay-900 text-center text-sm text-slate-500">
                            {mode === 'signin' ? 'New to EarnBuddy? ' : 'Already have an account? '}
                            <a href="#" onClick={(e) => { e.preventDefault(); onCreateAccount?.(); }} className="text-primary hover:underline transition-colors font-bold">
                                {mode === 'signin' ? 'Create Account' : 'Sign In'}
                            </a>
                        </p>
                    </div>
                </div>
            </section>

            {/* Right column: hero image + testimonials */}
            {heroImageSrc && (
                <section className="hidden md:flex flex-1 relative bg-slate-900 overflow-hidden items-center justify-center">
                    {/* Background Layers */}
                    <div className="absolute inset-0 z-0">
                        {/* Gradient Mesh - similar to Landers */}
                        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-green-900/20 to-transparent skew-x-[-12deg] translate-x-32"></div>
                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
                    </div>

                    <div className="animate-slide-right animate-delay-300 absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: `url(${heroImageSrc})` }}></div>

                    {/* Content on Image */}
                    <div className="relative z-10 flex flex-col items-center gap-8 translate-y-20">
                        {testimonials.length > 0 && (
                            <div className="flex flex-col items-center gap-6">
                                <div className="flex gap-6 translate-x-12">
                                    <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
                                </div>
                                <div className="flex gap-6 -translate-x-12">
                                    {testimonials[1] && <TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" />}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="absolute top-12 right-12 text-white/20">
                        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </section>
            )}
        </div>
    );
};
