"use client";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";
import { ArrowRight, MessageSquare, Shield, Globe, Layers } from "lucide-react";

export default function CommunitiesPage() {
    return (
        <div className="min-h-screen bg-background font-sans text-slate-900">
            <PublicNavbar />

            {/* Hero */}
            <header className="bg-red-500 text-white pt-32 pb-24 relative overflow-hidden border-b-4 border-slate-900">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-none">
                        A better home for <br /> serious communities.
                    </h1>
                    <p className="text-xl md:text-2xl text-red-50 max-w-2xl mx-auto font-bold mb-10 leading-relaxed">
                        EarnBuddy helps communities talk, collaborate, and build things together — without friction.
                    </p>
                    <Link href="/auth?mode=signup" className="inline-block bg-white text-slate-900 px-8 py-4 rounded-none border-2 border-slate-900 text-xl font-black uppercase tracking-wide hover:bg-slate-900 hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                        Create a Community Circle
                    </Link>
                </div>
            </header>

            {/* Community Circles */}
            <section className="py-20 bg-white border-b-4 border-slate-900">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1">
                            <h2 className="text-4xl font-black uppercase tracking-tight mb-6">Community Circles</h2>
                            <p className="text-xl text-slate-600 font-medium mb-8">It’s designed for groups that want to last. Each circle is a persistent space with:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { icon: MessageSquare, text: "Live Discussion" },
                                    { icon: Shield, text: "Clear Roles" },
                                    { icon: Clock, text: "Shared History" }, // Using Clock loosely for history
                                    { icon: Layers, text: "Structured Collaboration" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 border-2 border-slate-900 bg-slate-50">
                                        <item.icon className="w-5 h-5 text-red-500" />
                                        <span className="font-bold text-slate-900 uppercase text-sm">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            {/* Visual Placeholder for Circle Interface */}
                            <div className="aspect-video bg-slate-900 border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] relative p-6 flex items-center justify-center">
                                <div className="text-center text-white space-y-2">
                                    <div className="w-16 h-16 bg-red-500 rounded-full mx-auto flex items-center justify-center border-2 border-white mb-4">
                                        <Users className="w-8 h-8" />
                                    </div>
                                    <h3 className="font-black text-xl uppercase">Design Builders</h3>
                                    <p className="text-sm text-slate-400">1.2k Members • 45 Projects</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* For Organizers */}
            <section className="py-20 bg-slate-50 border-b-4 border-slate-900">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <h2 className="text-4xl font-black uppercase tracking-tight mb-12">For Organizers</h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                        {["Admin Controls", "Announcements", "Moderation Tools", "Cross-collab"].map((feat, i) => (
                            <div key={i} className="bg-white p-6 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <p className="font-black text-sm uppercase">{feat}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-2xl font-bold max-w-2xl mx-auto text-slate-800">
                        "You set the tone. The platform stays out of the way."
                    </p>
                </div>
            </section>

            {/* Collaboration Circles */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bg-slate-900 text-white p-8 md:p-12 border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(239,68,68,1)]">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex-1">
                                <h2 className="text-3xl font-black uppercase tracking-tight mb-4 text-red-400">Collaboration Circles</h2>
                                <p className="font-medium text-slate-300 leading-relaxed mb-6">
                                    Communities can partner with each other through shared spaces — designed for joint projects, events, or initiatives.
                                </p>
                                <p className="font-bold text-white text-lg border-t-2 border-slate-700 pt-6">
                                    If your community is about more than conversation, this is built for you.
                                </p>
                            </div>
                            <div className="shrink-0 pt-2">
                                <Globe className="w-24 h-24 text-slate-800" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}

// Icon helper
import { Clock, Users } from "lucide-react";
