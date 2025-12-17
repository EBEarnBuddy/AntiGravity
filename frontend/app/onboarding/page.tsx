"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FirestoreService } from '@/lib/firestore';
import { Check, ArrowRight, User, Rocket, Heart, Code } from 'lucide-react';

const INTERESTS = [
    "Web Development", "Mobile Apps", "Blockchain", "AI/ML",
    "Design", "Marketing", "Writing", "Finance", "Gaming"
];

const ROLES = [
    { id: 'freelancer', label: 'Freelancer', icon: Code, desc: 'I want to find works & gigs' },
    { id: 'founder', label: 'Founder', icon: Rocket, desc: 'I want to hire talent & build' },
    { id: 'builder', label: 'Builder', icon: User, desc: 'I want to join a team' },
    { id: 'investor', label: 'Investor', icon: Heart, desc: 'I want to fund projects' },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { currentUser } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        role: '',
        experience: 'beginner',
        interests: [] as string[],
        goals: [] as string[],
        availability: 'flexible'
    });

    const handleInterestToggle = (interest: string) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const handleComplete = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            await FirestoreService.saveOnboardingResponse({
                userId: currentUser.uid,
                ...formData
            });
            // Force reload or redirect to discover
            window.location.href = '/discover';
        } catch (error) {
            console.error("Onboarding error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                {/* Progress Bar */}
                <div className="h-2 bg-slate-100 w-full">
                    <div
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="p-8 md:p-12">
                    {/* Step 1: Role Selection */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-center space-y-2">
                                <h1 className="text-3xl font-black text-slate-900">Welcome to EarnBuddy! 🌿</h1>
                                <p className="text-slate-500 font-medium">Let's personalize your experience. Who are you?</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {ROLES.map((role) => {
                                    const Icon = role.icon;
                                    const isSelected = formData.role === role.id;
                                    return (
                                        <button
                                            key={role.id}
                                            onClick={() => setFormData({ ...formData, role: role.id })}
                                            className={`p-6 rounded-xl border-2 text-left transition-all duration-200 flex flex-col gap-3 group
                                        ${isSelected
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-slate-200 hover:border-green-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`p-3 rounded-full w-fit ${isSelected ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500 group-hover:bg-green-50 group-hover:text-green-500'}`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className={`font-bold text-lg ${isSelected ? 'text-green-700' : 'text-slate-800'}`}>{role.label}</h3>
                                                <p className="text-sm text-slate-400 font-medium leading-tight">{role.desc}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                disabled={!formData.role}
                                onClick={() => setStep(2)}
                                className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
                            >
                                Continue <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Interests */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-center space-y-2">
                                <h1 className="text-3xl font-black text-slate-900">What are you into? 🤔</h1>
                                <p className="text-slate-500 font-medium">Select a few topics to shape your feed.</p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-3">
                                {INTERESTS.map((interest) => {
                                    const isSelected = formData.interests.includes(interest);
                                    return (
                                        <button
                                            key={interest}
                                            onClick={() => handleInterestToggle(interest)}
                                            className={`px-6 py-3 rounded-full font-bold text-sm border-2 transition-all
                                        ${isSelected
                                                    ? 'bg-green-600 border-green-600 text-white shadow-md transform scale-105'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-600'
                                                }`}
                                        >
                                            {interest}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={formData.interests.length === 0}
                                    className="flex-[2] py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                    Continue <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Experience & Finish */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-center space-y-2">
                                <h1 className="text-3xl font-black text-slate-900">Almost there! 🚀</h1>
                                <p className="text-slate-500 font-medium">How experienced are you in your field?</p>
                            </div>

                            <div className="space-y-4">
                                {['beginner', 'intermediate', 'expert'].map((exp) => (
                                    <button
                                        key={exp}
                                        onClick={() => setFormData({ ...formData, experience: exp })}
                                        className={`w-full p-4 rounded-xl border-2 flex items-center justify-between group transition-all
                                    ${formData.experience === exp
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-slate-200 hover:border-green-300'
                                            }`}
                                    >
                                        <span className={`font-bold capitalize ${formData.experience === exp ? 'text-green-700' : 'text-slate-700'}`}>
                                            {exp}
                                        </span>
                                        {formData.experience === exp && <Check className="w-5 h-5 text-green-600" />}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleComplete}
                                    disabled={loading}
                                    className="flex-[2] py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-70 transition-all shadow-md flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Complete Setup"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <p className="mt-8 text-xs text-slate-400 font-bold tracking-widest uppercase">EarnBuddy © 2025</p>
        </div>
    );
}
