"use client";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Mail, ArrowRight } from "lucide-react";

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-background font-sans text-slate-900">
            <PublicNavbar />

            {/* Hero */}
            <header className="bg-slate-900 text-white pt-32 pb-24 relative overflow-hidden border-b-4 border-slate-900">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-none">
                        Build EarnBuddy <br /> with us.
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-bold mb-10 leading-relaxed">
                        We’re a small team building tools for people who build.
                    </p>
                    <a href="mailto:careers@earnbuddy.tech" className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-none border-2 border-white text-xl font-black uppercase tracking-wide hover:bg-green-400 hover:border-green-400 hover:text-slate-900 transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                        <Mail className="w-6 h-6" /> Reach Out
                    </a>
                </div>
            </header>

            {/* How We Work */}
            <section className="py-20 bg-white border-b-4 border-slate-900">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tight mb-6">How We Work</h2>
                            <ul className="space-y-4">
                                {["Small teams", "High ownership", "Clear feedback", "Focus on shipping"].map((item, i) => (
                                    <li key={i} className="text-lg font-bold border-l-4 border-green-500 pl-4">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Who Fits Here</h2>
                            <p className="font-bold text-slate-500 mb-4">People who:</p>
                            <ul className="space-y-4">
                                {["Care about product quality", "Prefer clarity over hierarchy", "Enjoy solving real problems"].map((item, i) => (
                                    <li key={i} className="text-lg font-bold flex items-center gap-2">
                                        <span className="w-2 h-2 bg-slate-900 rounded-full"></span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Roles */}
            <section className="py-20 bg-slate-50 border-b-4 border-slate-900">
                <div className="container mx-auto px-6 max-w-3xl text-center">
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-8">Current Roles</h2>
                    <p className="text-lg font-medium text-slate-600 mb-8">
                        We generally hire generalists who can own vertical slices of the product.
                    </p>

                    <div className="space-y-4 text-left">
                        {/* Placeholder Roles */}
                        <div className="bg-white p-6 border-2 border-slate-900 flex justify-between items-center group cursor-pointer hover:bg-slate-900 hover:text-white transition-colors">
                            <div>
                                <h3 className="font-black text-xl uppercase">Full Stack Engineer</h3>
                                <p className="text-sm font-bold opacity-70">Remote / Bengaluru</p>
                            </div>
                            <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="bg-white p-6 border-2 border-slate-900 flex justify-between items-center group cursor-pointer hover:bg-slate-900 hover:text-white transition-colors">
                            <div>
                                <h3 className="font-black text-xl uppercase">Product Designer</h3>
                                <p className="text-sm font-bold opacity-70">Remote</p>
                            </div>
                            <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Closing */}
            <section className="py-20 bg-white text-center">
                <div className="container mx-auto px-6">
                    <p className="text-2xl font-black uppercase text-slate-900">
                        If this resonates, reach out.
                    </p>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
