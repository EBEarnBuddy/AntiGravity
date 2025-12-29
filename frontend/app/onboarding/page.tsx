"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FirestoreService } from '@/lib/firestore';
import { Check, ArrowRight, User, Rocket, Heart, Code, Target, Clock, MapPin } from 'lucide-react';

// --- CONFIGURATION ---
const STEPS = 7;

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
    const { currentUser, updateProfile } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Username State
    const [username, setUsername] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [checkingUsername, setCheckingUsername] = useState(false);

    const [formData, setFormData] = useState({
        role: '',
        skills: [] as string[],
        goals: [] as string[],
        experience: '',
        availability: '',
        wantsTour: null as boolean | null
    });

    const checkUsername = async (val: string) => {
        if (!val || val.length < 3) {
            setUsernameAvailable(null);
            return;
        }
        setCheckingUsername(true);
        try {
            const user = await FirestoreService.getUserByUsername(val);
            if (user) {
                setUsernameAvailable(false);
            } else {
                setUsernameAvailable(true);
            }
        } catch (err: any) {
            console.error("Error checking username", err);
            setUsernameAvailable(null);
        } finally {
            setCheckingUsername(false);
        }
    };

    // Debounce username check
    React.useEffect(() => {
        const timeout = setTimeout(() => {
            if (username) checkUsername(username);
        }, 500);
        return () => clearTimeout(timeout);
    }, [username]);

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

            await updateProfile({
                username: username,
                onboardingData: {
                    role: formData.role as any,
                    skills: formData.skills,
                    goals: formData.goals,
                    experience: formData.experience as any,
                    availability: formData.availability as any,
                    remote: false, // Default
                    interests: [] // Added to satisfy type definition
                },
                hasCompletedOnboarding: true,
                hasCompletedTour: !wantsTour,
                isNewUser: wantsTour
            });

            if (!wantsTour) {
                await updateProfile({ isNewUser: false });
            }

            window.location.href = '/discover';
        } catch (error) {
            console.error("Onboarding error:", error);
            alert("Setup failed: " + (error as any).message);
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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
            {/* Header */}
            <div className="w-full bg-white border-b-4 border-slate-900 p-4">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-black uppercase tracking-tighter">EarnBuddy Setup</h1>
                    <div className="text-sm font-bold bg-slate-100 px-3 py-1 border-2 border-slate-900">
                        Step {step} of {STEPS}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] p-8 md:p-12 relative flex flex-col min-h-[600px]">
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 h-4 bg-slate-100 w-full border-b-4 border-slate-900">
                        <div
                            className="h-full bg-green-500 transition-all duration-300 border-r-4 border-slate-900"
                            style={{ width: `${(step / STEPS) * 100}%` }}
                        />
                    </div>

                    <div className="mt-6 flex-1 flex flex-col">
                        {/* Header Animation Wrapper */}
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500 flex-1">

                            {/* --- STEP 1: USERNAME --- */}
                            {step === 1 && (
                                <div className="space-y-8">
                                    <div className="text-center space-y-4">
                                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Claim Your Spot</h1>
                                        <p className="text-slate-600 font-bold text-lg">Choose a unique username for your profile URL.</p>
                                    </div>
                                    <div className="max-w-md mx-auto">
                                        <div className="relative flex flex-col md:block">
                                            <div className="md:absolute md:inset-y-0 md:left-0 flex items-center md:pl-4 pointer-events-none mb-2 md:mb-0">
                                                <span className="text-slate-400 font-bold text-sm md:text-base">earnbuddy.com/u/</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                                className={`w-full md:pl-[160px] pl-4 pr-12 py-4 bg-white border-4 font-black text-xl outline-none transition-all uppercase tracking-wide
                                                ${usernameAvailable === false ? 'border-red-500 text-red-500' :
                                                        usernameAvailable === true ? 'border-green-500 text-green-600 shadow-[4px_4px_0px_0px_rgba(22,163,74,1)]' :
                                                            'border-slate-900 text-slate-900 focus:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]'}`}
                                                placeholder="username"
                                                autoFocus
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                                {checkingUsername && <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />}
                                                {!checkingUsername && usernameAvailable === true && <Check className="w-6 h-6 text-green-600" />}
                                                {!checkingUsername && usernameAvailable === false && <p className="text-xs font-black text-red-500">TAKEN</p>}
                                            </div>
                                        </div>
                                        <p className="mt-4 text-center text-sm font-bold text-slate-400">
                                            {usernameAvailable === true ? "Looking good! This username is available." :
                                                usernameAvailable === false ? "Sorry, this username is already taken." :
                                                    "Use letters, numbers, and dashes."}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* --- STEP 2: ROLE --- */}
                            {step === 2 && (
                                <div className="space-y-8">
                                    <div className="text-center space-y-4">
                                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Who are you?</h1>
                                        <p className="text-slate-600 font-bold text-lg">Choose your primary role.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {ROLES.map((role) => {
                                            const Icon = role.icon;
                                            const isSelected = formData.role === role.id;
                                            return (
                                                <button
                                                    key={role.id}
                                                    onClick={() => setFormData({ ...formData, role: role.id })}
                                                    className={`p-6 border-4 text-left transition-all duration-200 flex flex-col gap-3 group
                                                ${isSelected ? 'border-slate-900 bg-green-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]' : 'border-slate-200 hover:border-slate-900 hover:bg-slate-50'}`}
                                                >
                                                    <div className={`p-3 border-2 border-slate-900 w-fit ${isSelected ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-500'}`}>
                                                        <Icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className={`font-black text-xl uppercase tracking-wide ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>{role.label}</h3>
                                                        <p className={`text-sm font-bold ${isSelected ? 'text-slate-800' : 'text-slate-500'}`}>{role.desc}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* --- STEP 3: SKILLS --- */}
                            {step === 3 && (
                                <div className="space-y-8">
                                    <div className="text-center space-y-4">
                                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Your Skills</h1>
                                        <p className="text-slate-600 font-bold text-lg">What brings you to the table?</p>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {SKILLS.map((item) => {
                                            const isSelected = formData.skills.includes(item);
                                            return (
                                                <button
                                                    key={item}
                                                    onClick={() => handleMultiSelect('skills', item)}
                                                    className={`px-6 py-3 font-black text-sm border-2 transition-all uppercase tracking-wide
                                                ${isSelected ? 'bg-slate-900 border-slate-900 text-white shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900'}`}
                                                >
                                                    {item}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* --- STEP 4: GOALS --- */}
                            {step === 4 && (
                                <div className="space-y-8">
                                    <div className="text-center space-y-4">
                                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Your Goals</h1>
                                        <p className="text-slate-600 font-bold text-lg">What do you want to achieve?</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {GOALS.map((item) => {
                                            const isSelected = formData.goals.includes(item.id);
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleMultiSelect('goals', item.id)}
                                                    className={`p-6 border-4 text-center transition-all duration-200 group
                                                ${isSelected ? 'border-slate-900 bg-green-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'border-slate-200 hover:border-slate-900'}`}
                                                >
                                                    <div className={`font-black text-lg uppercase tracking-wide ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>{item.label}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* --- STEP 5: EXPERIENCE --- */}
                            {step === 5 && (
                                <div className="space-y-8">
                                    <div className="text-center space-y-4">
                                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Experience Level</h1>
                                        <p className="text-slate-600 font-bold text-lg">Rate your expertise.</p>
                                    </div>
                                    <div className="space-y-4">
                                        {EXPERIENCE_LEVELS.map((exp) => (
                                            <button
                                                key={exp.id}
                                                onClick={() => setFormData({ ...formData, experience: exp.id })}
                                                className={`w-full p-4 border-4 flex items-center justify-between group transition-all
                                            ${formData.experience === exp.id ? 'border-slate-900 bg-purple-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'border-slate-200 hover:border-slate-900'}`}
                                            >
                                                <div className="text-left">
                                                    <div className={`font-black text-xl uppercase tracking-wide ${formData.experience === exp.id ? 'text-slate-900' : 'text-slate-800'}`}>{exp.label}</div>
                                                    <div className="text-slate-500 font-bold text-sm">{exp.desc}</div>
                                                </div>
                                                {formData.experience === exp.id && <Check className="w-8 h-8 text-slate-900" strokeWidth={3} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- STEP 6: AVAILABILITY --- */}
                            {step === 6 && (
                                <div className="space-y-8">
                                    <div className="text-center space-y-4">
                                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Availability</h1>
                                        <p className="text-slate-600 font-bold text-lg">Your time commitment.</p>
                                    </div>
                                    <div className="space-y-4">
                                        {AVAILABILITY.map((avail) => (
                                            <button
                                                key={avail.id}
                                                onClick={() => setFormData({ ...formData, availability: avail.id })}
                                                className={`w-full p-4 border-4 flex items-center justify-between group transition-all
                                            ${formData.availability === avail.id ? 'border-slate-900 bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'border-slate-200 hover:border-slate-900'}`}
                                            >
                                                <div className="text-left">
                                                    <div className={`font-black text-xl uppercase tracking-wide ${formData.availability === avail.id ? 'text-slate-900' : 'text-slate-800'}`}>{avail.label}</div>
                                                    <div className="text-slate-500 font-bold text-sm">{avail.desc}</div>
                                                </div>
                                                <Clock className={`w-8 h-8 ${formData.availability === avail.id ? 'text-slate-900' : 'text-slate-300'}`} strokeWidth={3} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- STEP 7: TOUR OPT-IN --- */}
                            {step === 7 && (
                                <div className="space-y-8">
                                    <div className="text-center space-y-4">
                                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">App Tour</h1>
                                        <p className="text-slate-600 font-bold text-lg">Take a quick tour?</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 h-64">
                                        <button
                                            onClick={() => setFormData({ ...formData, wantsTour: true })}
                                            className={`border-4 flex flex-col items-center justify-center gap-4 transition-all
                                        ${formData.wantsTour === true ? 'border-slate-900 bg-green-400 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] translate-x-[2px] translate-y-[2px]' : 'border-slate-200 hover:border-slate-900'}`}
                                        >
                                            <div className="font-black text-2xl text-slate-900 uppercase tracking-wide">Yes</div>
                                            <p className="text-sm font-bold text-slate-700">Show me around</p>
                                        </button>
                                        <button
                                            onClick={() => setFormData({ ...formData, wantsTour: false })}
                                            className={`border-4 flex flex-col items-center justify-center gap-4 transition-all
                                        ${formData.wantsTour === false ? 'border-slate-900 bg-slate-200 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] translate-x-[2px] translate-y-[2px]' : 'border-slate-200 hover:border-slate-900'}`}
                                        >
                                            <div className="font-black text-2xl text-slate-900 uppercase tracking-wide">No</div>
                                            <p className="text-sm font-bold text-slate-500">I'll explore myself</p>
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
                                    className="flex-1 py-4 bg-white border-2 border-slate-900 text-slate-900 font-black uppercase tracking-wide hover:bg-slate-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                                >
                                    Back
                                </button>
                            )}

                            {step < STEPS ? (
                                <button
                                    onClick={nextStep}
                                    // Validation for each step
                                    disabled={
                                        (step === 1 && (!username || !usernameAvailable)) ||
                                        (step === 2 && !formData.role) ||
                                        (step === 3 && formData.skills.length === 0) ||
                                        (step === 4 && formData.goals.length === 0) ||
                                        (step === 5 && !formData.experience) ||
                                        (step === 6 && !formData.availability)
                                    }
                                    className="flex-[2] py-4 bg-slate-900 text-white font-black uppercase tracking-wide border-2 border-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2"
                                >
                                    Continue <ArrowRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleComplete}
                                    disabled={loading || formData.wantsTour === null}
                                    className="flex-[2] py-4 bg-green-500 text-slate-900 font-black uppercase tracking-wide border-2 border-slate-900 hover:bg-green-400 disabled:opacity-70 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        "Get Started"
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
