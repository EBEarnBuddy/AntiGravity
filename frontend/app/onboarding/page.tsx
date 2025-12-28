"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/lib/axios';
import { Check, ArrowRight, User, Rocket, Heart, Code, Target, Clock, MapPin } from 'lucide-react';

// --- CONFIGURATION ---
const STEPS = 6;

const ROLES = [
    { id: 'freelancer', label: 'Freelancer', icon: Code, desc: 'I want to find works & gigs' },
    { id: 'founder', label: 'Founder', icon: Rocket, desc: 'I want to hire talent & build' },
    { id: 'builder', label: 'Builder', icon: User, desc: 'I want to join a team' },
    { id: 'investor', label: 'Investor', icon: Heart, desc: 'I want to fund projects' },
];

const SKILLS = [
    "React", "Node.js", "Python", "Design", "Marketing", "Writing",
    "Finance", "Sales", "AI/ML", "Blockchain", "Data So.", "Operations"
];

const GOALS = [
    { id: 'earn', label: 'Earn Money', icon: '💰' },
    { id: 'learn', label: 'Learn Skills', icon: '📚' },
    { id: 'network', label: 'Network', icon: '🤝' },
    { id: 'build', label: 'Build Portfolio', icon: '🛠️' },
];

const EXPERIENCE_LEVELS = [
    { id: 'beginner', label: 'Beginner', desc: 'Just starting out' },
    { id: 'intermediate', label: 'Intermediate', desc: 'Have some projects' },
    { id: 'expert', label: 'Expert', desc: 'Professional experience' },
];

const AVAILABILITY = [
    { id: 'full-time', label: 'Full Time', desc: '40+ hrs/week' },
    { id: 'part-time', label: 'Part Time', desc: '10-20 hrs/week' },
    { id: 'flexible', label: 'Flexible', desc: 'Weekends / Ad-hoc' },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { currentUser } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        role: '',
        skills: [] as string[],
        goals: [] as string[],
        experience: '',
        availability: '',
        wantsTour: null as boolean | null
    });

    const handleMultiSelect = (field: 'skills' | 'goals', value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(i => i !== value)
                : [...prev[field], value]
        }));
    };

    const handleComplete = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            // Determine tour status based on user choice
            const wantsTour = formData.wantsTour === true;

            // If they want a tour, we need: hasCompletedOnboarding=true, hasCompletedTour=false
            // If they DO NOT want a tour, we need: hasCompletedOnboarding=true, hasCompletedTour=true (skipped)

            await userAPI.updateMe({
                onboardingData: {
                    role: formData.role,
                    skills: formData.skills,
                    goals: formData.goals,
                    experience: formData.experience,
                    availability: formData.availability
                },
                hasCompletedOnboarding: true,
                hasCompletedTour: !wantsTour, // Mark tour as completed if they said NO
                isNewUser: wantsTour // Keep isNewUser true only if they take the tour, essentially? 
                // Actually isNewUser logic in TourContext clears it after tour. 
                // If they skip tour, we probably want to clear isNewUser too?
                // Let's stick to simple: If they skip tour (hasCompletedTour: true), they are done.
            });

            // Also explicitly clear isNewUser if they declined the tour
            if (!wantsTour) {
                await userAPI.updateMe({ isNewUser: false });
            }

            // Force reload to pick up new profile state or redirect
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

    const nextStep = () => setStep(prev => Math.min(prev + 1, STEPS));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col min-h-[600px]">
                {/* Progress Bar */}
                <div className="h-2 bg-slate-100 w-full">
                    <div
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${(step / STEPS) * 100}%` }}
                    />
                </div>

                <div className="p-8 md:p-12 flex-1 flex flex-col">
                    {/* Header Animation Wrapper */}
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500 flex-1">

                        {/* --- STEP 1: ROLE --- */}
                        {step === 1 && (
                            <div className="space-y-8">
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
                                                ${isSelected ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-300 hover:bg-slate-50'}`}
                                            >
                                                <div className={`p-3 rounded-full w-fit ${isSelected ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
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
                            </div>
                        )}

                        {/* --- STEP 2: SKILLS --- */}
                        {step === 2 && (
                            <div className="space-y-8">
                                <div className="text-center space-y-2">
                                    <h1 className="text-3xl font-black text-slate-900">What are your skills? 🛠️</h1>
                                    <p className="text-slate-500 font-medium">Select skills you want to showcase.</p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {SKILLS.map((item) => {
                                        const isSelected = formData.skills.includes(item);
                                        return (
                                            <button
                                                key={item}
                                                onClick={() => handleMultiSelect('skills', item)}
                                                className={`px-6 py-3 rounded-full font-bold text-sm border-2 transition-all
                                                ${isSelected ? 'bg-green-600 border-green-600 text-white shadow-md transform scale-105' : 'bg-white border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-600'}`}
                                            >
                                                {item}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* --- STEP 3: GOALS --- */}
                        {step === 3 && (
                            <div className="space-y-8">
                                <div className="text-center space-y-2">
                                    <h1 className="text-3xl font-black text-slate-900">What brings you here? 🎯</h1>
                                    <p className="text-slate-500 font-medium">Select your primary goals.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {GOALS.map((item) => {
                                        const isSelected = formData.goals.includes(item.id);
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => handleMultiSelect('goals', item.id)}
                                                className={`p-6 rounded-xl border-2 text-center transition-all duration-200 group
                                                ${isSelected ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-300'}`}
                                            >
                                                <div className="text-4xl mb-3">{item.icon}</div>
                                                <div className={`font-bold ${isSelected ? 'text-green-700' : 'text-slate-700'}`}>{item.label}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* --- STEP 4: EXPERIENCE --- */}
                        {step === 4 && (
                            <div className="space-y-8">
                                <div className="text-center space-y-2">
                                    <h1 className="text-3xl font-black text-slate-900">Experience Level 📈</h1>
                                    <p className="text-slate-500 font-medium">How would you describe your expertise?</p>
                                </div>
                                <div className="space-y-4">
                                    {EXPERIENCE_LEVELS.map((exp) => (
                                        <button
                                            key={exp.id}
                                            onClick={() => setFormData({ ...formData, experience: exp.id })}
                                            className={`w-full p-4 rounded-xl border-2 flex items-center justify-between group transition-all
                                            ${formData.experience === exp.id ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-300'}`}
                                        >
                                            <div className="text-left">
                                                <div className={`font-bold text-lg ${formData.experience === exp.id ? 'text-green-700' : 'text-slate-800'}`}>{exp.label}</div>
                                                <div className="text-slate-400 text-sm">{exp.desc}</div>
                                            </div>
                                            {formData.experience === exp.id && <Check className="w-6 h-6 text-green-600" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- STEP 5: AVAILABILITY --- */}
                        {step === 5 && (
                            <div className="space-y-8">
                                <div className="text-center space-y-2">
                                    <h1 className="text-3xl font-black text-slate-900">Your Availability ⏰</h1>
                                    <p className="text-slate-500 font-medium">How much time can you commit?</p>
                                </div>
                                <div className="space-y-4">
                                    {AVAILABILITY.map((avail) => (
                                        <button
                                            key={avail.id}
                                            onClick={() => setFormData({ ...formData, availability: avail.id })}
                                            className={`w-full p-4 rounded-xl border-2 flex items-center justify-between group transition-all
                                            ${formData.availability === avail.id ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-300'}`}
                                        >
                                            <div className="text-left">
                                                <div className={`font-bold text-lg ${formData.availability === avail.id ? 'text-green-700' : 'text-slate-800'}`}>{avail.label}</div>
                                                <div className="text-slate-400 text-sm">{avail.desc}</div>
                                            </div>
                                            <Clock className={`w-6 h-6 ${formData.availability === avail.id ? 'text-green-600' : 'text-slate-300'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- STEP 6: TOUR OPT-IN --- */}
                        {step === 6 && (
                            <div className="space-y-8">
                                <div className="text-center space-y-2">
                                    <h1 className="text-3xl font-black text-slate-900">One Last Thing! 🧭</h1>
                                    <p className="text-slate-500 font-medium">Would you like a quick tour of the app?</p>
                                </div>
                                <div className="grid grid-cols-2 gap-6 h-64">
                                    <button
                                        onClick={() => setFormData({ ...formData, wantsTour: true })}
                                        className={`rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-all
                                        ${formData.wantsTour === true ? 'border-green-500 bg-green-50 shadow-lg scale-105' : 'border-slate-200 hover:border-green-300'}`}
                                    >
                                        <div className="text-6xl">✨</div>
                                        <div className="font-black text-xl text-slate-800">Yes, show me around!</div>
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, wantsTour: false })}
                                        className={`rounded-2xl border-2 flex flex-col items-center justify-center gap-4 transition-all
                                        ${formData.wantsTour === false ? 'border-slate-500 bg-slate-100 shadow-lg scale-105' : 'border-slate-200 hover:border-slate-400'}`}
                                    >
                                        <div className="text-6xl">🙅</div>
                                        <div className="font-bold text-xl text-slate-600">No, I'll explore myself</div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 pt-8 mt-auto">
                        {step > 1 && (
                            <button
                                onClick={prevStep}
                                className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                            >
                                Back
                            </button>
                        )}

                        {step < STEPS ? (
                            <button
                                onClick={nextStep}
                                // Validation for each step
                                disabled={
                                    (step === 1 && !formData.role) ||
                                    (step === 2 && formData.skills.length === 0) ||
                                    (step === 3 && formData.goals.length === 0) ||
                                    (step === 4 && !formData.experience) ||
                                    (step === 5 && !formData.availability)
                                }
                                className="flex-[2] py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
                            >
                                Continue <ArrowRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                disabled={loading || formData.wantsTour === null}
                                className="flex-[2] py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-70 transition-all shadow-md flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Get Started"
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <p className="mt-8 text-xs text-slate-400 font-bold tracking-widest uppercase">EarnBuddy © 2025</p>
        </div>
    );
}
