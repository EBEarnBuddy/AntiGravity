"use client";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";
import { ArrowRight, Zap, Target, Layers, History } from "lucide-react";

export default function StartupsPage() {
    return (
        <div className="min-h-screen bg-background font-sans text-slate-900">
            <PublicNavbar />

            {/* Hero */}
            <header className="bg-blue-600 text-white pt-32 pb-24 relative overflow-hidden border-b-4 border-slate-900">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-none">
                        Find people. <br /> Build together. <br className="md:hidden" /> Keep moving.
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto font-bold mb-10 leading-relaxed">
                        EarnBuddy helps startups form teams and work inside shared spaces — from first conversation to execution.
                    </p>
                    <Link href="/auth?mode=signup" className="inline-block bg-white text-slate-900 px-8 py-4 rounded-none border-2 border-slate-900 text-xl font-black uppercase tracking-wide hover:bg-slate-900 hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                        Post an Opportunity
                    </Link>
                </div>
            </header>

            {/* From Role to Team */}
            <section className="py-20 bg-white border-b-4 border-slate-900">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-black uppercase tracking-tight mb-8">From Role to Team</h2>
                            <ol className="space-y-6 border-l-4 border-slate-200 ml-2">
                                {[
                                    "Post a role or idea",
                                    "A dedicated workspace is created",
                                    "Applicants join the same context",
                                    "The team forms where the work happens"
                                ].map((step, i) => (
                                    <li key={i} className="pl-6 relative">
                                        <div className="absolute -left-[10px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white ring-2 ring-slate-900"></div>
                                        <p className="text-lg font-bold text-slate-900">{step}</p>
                                    </li>
                                ))}
                            </ol>
                            <p className="mt-8 text-xl font-black text-slate-400 uppercase">
                                No handoffs. <br /> No context loss.
                            </p>
                        </div>
                        <div className="bg-slate-50 p-8 border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <Zap className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-black uppercase mb-2">Execution Infrastructure</h3>
                            <p className="text-slate-600">Not just a hiring site.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Founders Use EB */}
            <section className="py-20 bg-slate-50 border-b-4 border-slate-900">
                <div className="container mx-auto px-6 max-w-5xl">
                    <h2 className="text-4xl font-black uppercase tracking-tight mb-12 text-center">Why Founders Use EarnBuddy</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Target, title: "Faster Alignment" },
                            { icon: Layers, title: "Persistent Collaboration" },
                            { icon: Zap, title: "Fewer Tools" },
                            { icon: History, title: "Clear Project History" },
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-6 border-2 border-slate-900">
                                <item.icon className="w-8 h-8 text-blue-600 mb-4" />
                                <h3 className="font-black text-lg uppercase leading-tight">{item.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Long Term Value */}
            <section className="py-20 bg-slate-900 text-white text-center">
                <div className="container mx-auto px-6 max-w-3xl">
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-8">Long-term Value</h2>
                    <p className="text-xl font-medium text-slate-300 mb-8 max-w-xl mx-auto">
                        Some collaborations end. <br />
                        Some turn into companies.
                    </p>
                    <p className="text-xl font-bold bg-white text-slate-900 inline-block px-4 py-1 transform -rotate-1 mb-12 border-2 border-blue-500">
                        EarnBuddy supports both — without forcing either.
                    </p>
                    <div className="text-4xl font-black uppercase mb-8">
                        Build with people, not profiles.
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}

