"use client";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";
import { ArrowRight, Check, Shield, Users, Clock } from "lucide-react";

export default function FreelancersPage() {
    return (
        <div className="min-h-screen bg-background font-sans text-slate-900">
            <PublicNavbar />

            {/* Hero */}
            <header className="bg-yellow-400 text-slate-900 pt-32 pb-24 relative overflow-hidden border-b-4 border-slate-900">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-none">
                        Freelancing, <br /> without the noise.
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-800 max-w-2xl mx-auto font-bold mb-10 leading-relaxed">
                        Find real work, talk directly to clients, and build a visible track record over time.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/auth?mode=signup" className="bg-slate-900 text-white px-8 py-4 rounded-none border-2 border-slate-900 text-xl font-black uppercase tracking-wide hover:bg-white hover:text-slate-900 transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                            Browse Opportunities
                        </Link>
                        <Link href="/auth?mode=signup" className="px-8 py-4 rounded-none border-2 border-slate-900 text-xl font-black uppercase tracking-wide hover:bg-slate-900 hover:text-white transition-all">
                            Create Profile
                        </Link>
                    </div>
                </div>
            </header>

            {/* What's Different */}
            <section className="py-20 bg-white border-b-4 border-slate-900">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-black uppercase tracking-tight mb-8">What's different here</h2>
                            <ul className="space-y-6">
                                {[
                                    "No proposal spam",
                                    "No disappearing clients",
                                    "No work lost in DMs"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-lg font-bold">
                                        <div className="bg-red-500 text-white p-1 border-2 border-slate-900">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-slate-100 p-8 border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="text-2xl font-black uppercase mb-4">The EarnBuddy Workspace</h3>
                            <p className="font-medium text-slate-600 mb-6">Each opportunity creates a shared workspace where:</p>
                            <div className="space-y-4">
                                <div className="bg-white p-4 border-2 border-slate-900 flex items-center gap-3">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    <span className="font-bold">Communication is real-time</span>
                                </div>
                                <div className="bg-white p-4 border-2 border-slate-900 flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-green-600" />
                                    <span className="font-bold">Scope is visible</span>
                                </div>
                                <div className="bg-white p-4 border-2 border-slate-900 flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-purple-600" />
                                    <span className="font-bold">Outcomes are recorded</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-20 bg-slate-50 border-b-4 border-slate-900">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h2 className="text-4xl font-black uppercase tracking-tight mb-12 text-center">How it works</h2>
                    <div className="space-y-6">
                        {[
                            { step: "01", title: "A gig is posted", desc: "Clients define clear needs." },
                            { step: "02", title: "A dedicated circle is created", desc: "Context is preserved from the start." },
                            { step: "03", title: "You apply and talk directly", desc: "No middleman delays." },
                            { step: "04", title: "Work happens inside the circle", desc: "Files, chats, and updates in one place." },
                            { step: "05", title: "Completion adds to your profile", desc: "Your track record grows automatically." },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start md:items-center gap-6 group">
                                <span className="text-4xl font-black text-slate-300 group-hover:text-slate-900 transition-colors">{item.step}</span>
                                <div className="flex-1 bg-white p-6 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                                    <h3 className="text-xl font-black uppercase mb-1">{item.title}</h3>
                                    <p className="text-slate-600 font-medium">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust & Continuity */}
            <section className="py-20 bg-slate-900 text-white">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <h2 className="text-4xl font-black uppercase tracking-tight mb-6">Trust & Continuity</h2>
                    <p className="text-2xl font-bold mb-8 text-slate-300">
                        Your work doesn’t reset every time you finish a gig. It adds up.
                    </p>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12">
                        Verified profiles, clear project states, and public completion history help serious freelancers stand out — quietly.
                    </p>

                    <div className="bg-slate-800 p-8 border-2 border-slate-700 max-w-2xl mx-auto transform rotate-1 hover:rotate-0 transition-transform duration-300">
                        <p className="text-xl font-bold italic mb-4">
                            "If freelancing is part of your long-term plan, this is where it compounds."
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 text-green-400 font-black uppercase tracking-wide hover:underline">
                                Start Building Your Reputation <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
