import React, { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';

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
    isLoading?: boolean;
}

// --- SUB-COMPONENTS ---

const FlatInputWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="border-4 border-slate-900 bg-white transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus-within:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] focus-within:translate-x-[2px] focus-within:translate-y-[2px]">
        {children}
    </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
    <div className={`animate-testimonial ${delay} flex items-start gap-3 bg-white border-4 border-slate-900 p-5 w-72 text-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
        <img src={testimonial.avatarSrc} className="h-12 w-12 object-cover border-2 border-slate-900" alt="avatar" />
        <div className="text-sm leading-snug">
            <p className="flex items-center gap-1 font-black uppercase text-slate-900">{testimonial.name}</p>
            <p className="text-slate-500 text-xs font-bold">{testimonial.handle}</p>
            <p className="mt-2 text-slate-800 font-medium italic">"{testimonial.text}"</p>
        </div>
    </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
    title = <span className="font-black text-slate-900 tracking-tighter uppercase">Welcome</span>,
    description = "Access your account and continue your journey with us",
    heroImageSrc,
    testimonials = [],
    onSignIn,
    onGoogleSignIn,
    onResetPassword,
    onCreateAccount,
    mode = 'signin',
    isLoading = false,
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="h-[100dvh] flex flex-col md:flex-row font-sans w-[100dvw] bg-white">
            {/* Left column: sign-in form */}
            <section className="flex-1 flex items-center justify-center p-8 z-10 bg-white">
                <div className="w-full max-w-md">
                    <div className="flex flex-col gap-6">
                        <div className="mb-4 animate-element animate-delay-100 flex items-center gap-2 font-black text-2xl text-slate-900 uppercase tracking-tight">
                            {/* Logo */}
                            <div className="bg-green-400 p-1 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 17L17 7M17 7H9M17 7V15" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            EarnBuddy
                        </div>

                        <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-black leading-tight text-slate-900 uppercase tracking-tighter">{title}</h1>
                        <p className="animate-element animate-delay-200 text-slate-600 font-bold text-lg">{description}</p>

                        <form className="space-y-6" onSubmit={onSignIn}>
                            <div className="animate-element animate-delay-300">
                                <label className="text-sm font-black text-slate-900 ml-1 mb-2 block uppercase">Email Address</label>
                                <FlatInputWrapper>
                                    <input name="email" type="email" placeholder="ENTER YOUR EMAIL" className="w-full bg-transparent text-sm p-4 font-bold text-slate-900 focus:outline-none placeholder:text-slate-400 placeholder:font-medium" disabled={isLoading} />
                                </FlatInputWrapper>
                            </div>

                            <div className="animate-element animate-delay-400">
                                <label className="text-sm font-black text-slate-900 ml-1 mb-2 block uppercase">Password</label>
                                <FlatInputWrapper>
                                    <div className="relative">
                                        <input name="password" type={showPassword ? 'text' : 'password'} placeholder="ENTER YOUR PASSWORD" className="w-full bg-transparent text-sm p-4 pr-12 font-bold text-slate-900 focus:outline-none placeholder:text-slate-400 placeholder:font-medium" disabled={isLoading} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center" disabled={isLoading}>
                                            {showPassword ? <EyeOff className="w-5 h-5 text-slate-400 hover:text-slate-900 transition-colors" /> : <Eye className="w-5 h-5 text-slate-400 hover:text-slate-900 transition-colors" />}
                                        </button>
                                    </div>
                                </FlatInputWrapper>
                            </div>

                            <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input type="checkbox" name="rememberMe" className="peer sr-only" disabled={isLoading} />
                                        <div className="w-5 h-5 border-2 border-slate-900 bg-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] peer-checked:bg-green-400 transition-all peer-checked:translate-x-[1px] peer-checked:translate-y-[1px] peer-checked:shadow-none"></div>
                                        <Check className="w-3.5 h-3.5 text-slate-900 absolute top-1 left-1 opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={4} />
                                    </div>
                                    <span className="text-slate-700 font-bold group-hover:text-slate-900">Keep me signed in</span>
                                </label>
                                <a href="#" onClick={(e) => { e.preventDefault(); if (!isLoading) onResetPassword?.(); }} className={`hover:underline text-slate-900 transition-colors font-black uppercase ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>Reset password</a>
                            </div>

                            <button type="submit" disabled={isLoading} className={`animate-element animate-delay-600 w-full border-4 border-slate-900 bg-green-500 py-4 font-black uppercase text-white hover:bg-green-600 transition-all shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none tracking-widest text-lg ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                {isLoading ? 'Please wait...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
                            </button>
                        </form>

                        <div className="animate-element animate-delay-700 relative flex items-center justify-center my-4">
                            <span className="w-full border-t-2 border-slate-200"></span>
                            <span className="px-4 text-xs font-black text-slate-400 bg-white absolute uppercase tracking-widest">Or continue with</span>
                        </div>

                        <button onClick={onGoogleSignIn} disabled={isLoading} className={`animate-element animate-delay-800 w-full flex items-center justify-center gap-3 border-4 border-slate-900 bg-white py-4 hover:bg-slate-50 transition-all font-bold text-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            <GoogleIcon />
                            Continue with Google
                        </button>

                        <p className="animate-element animate-delay-900 text-center text-sm text-slate-600 font-bold mt-4">
                            {mode === 'signin' ? 'New here? ' : 'Already have an account? '}
                            <a href="#" onClick={(e) => { e.preventDefault(); onCreateAccount?.(); }} className="text-slate-900 hover:text-green-600 hover:underline transition-colors font-black uppercase">
                                {mode === 'signin' ? 'Create Account' : 'Sign In'}
                            </a>
                        </p>
                    </div>
                </div>
            </section>

            {/* Right column: hero image + testimonials */}
            {heroImageSrc && (
                <section className="hidden md:flex flex-1 relative bg-slate-900 overflow-hidden items-center justify-center border-l-4 border-slate-900">
                    {/* Background Layers */}
                    <div className="absolute inset-0 z-0 bg-yellow-400">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                    </div>

                    <div className="animate-slide-right animate-delay-300 absolute inset-0 bg-cover bg-center grayscale contrast-125 mix-blend-multiply opacity-50" style={{ backgroundImage: `url(${heroImageSrc})` }}></div>

                    {/* Content on Image */}
                    <div className="relative z-10 flex flex-col items-center gap-8 translate-y-20">
                        {testimonials.length > 0 && (
                            <div className="flex flex-col items-center gap-8">
                                <div className="flex gap-6 translate-x-12 rotate-[-2deg]">
                                    <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
                                </div>
                                <div className="flex gap-6 -translate-x-12 rotate-[2deg]">
                                    {testimonials[1] && <TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" />}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="absolute top-12 right-12 text-slate-900">
                        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </section>
            )}
        </div>
    );
};
