"use client";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";
import { ArrowRight, Hammer, Briefcase, Users, BookOpen } from "lucide-react";

export default function StudentsPage() {
    return (
        <div className="min-h-screen bg-background font-sans text-slate-900">
            <PublicNavbar />

            {/* Hero */}
            <header className="bg-purple-600 text-white pt-32 pb-24 relative overflow-hidden border-b-4 border-slate-900">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-none">
                        Start building <br /> earlier.
                    </h1>
                    <p className="text-xl md:text-2xl text-purple-100 max-w-2xl mx-auto font-bold mb-10 leading-relaxed">
                        EarnBuddy helps students collaborate on real projects, learn by doing, and build a public track record.
                    </p>
                    <Link href="/auth?mode=signup" className="inline-block bg-white text-slate-900 px-8 py-4 rounded-none border-2 border-slate-900 text-xl font-black uppercase tracking-wide hover:bg-slate-900 hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                        Join as a Student
                    </Link>
                </div>
            </header>

            {/* What Students Do */}
            <section className="py-20 bg-white border-b-4 border-slate-900">
                <div className="container mx-auto px-6 max-w-5xl">
                    <h2 className="text-4xl font-black uppercase tracking-tight mb-12 text-center">What students do here</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Users, title: "Join Builder Communities" },
                            { icon: Hammer, title: "Work on Real Projects" },
                            { icon: Briefcase, title: "Freelance or Collaborate" },
                            { icon: BookOpen, title: "Learn Through Execution" },
                        ].map((item, i) => (
                            <div key={i} className="bg-slate-50 p-6 border-2 border-slate-900 hover:bg-white transition-colors">
                                <item.icon className="w-8 h-8 text-purple-600 mb-4" />
                                <h3 className="font-black text-lg uppercase leading-tight">{item.title}</h3>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-xl font-bold mt-12 text-slate-600">
                        No artificial gamification. Just real work, with real people.
                    </p>
                </div>
            </section>

            {/* Why This Matters */}
            <section className="py-20 bg-slate-100 border-b-4 border-slate-900">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-4xl font-black uppercase tracking-tight">Why this matters</h2>
                            <p className="text-xl font-medium text-slate-700">
                                Projects tell a clearer story than resumes. <br />
                                <span className="font-black text-slate-900">And starting early compounds faster than waiting.</span>
                            </p>
                        </div>
                        <div className="flex-1 w-full p-8 border-4 border-slate-900 bg-white shadow-[8px_8px_0px_0px_rgba(147,51,234,1)] transform -rotate-1">
                            <div className="space-y-4">
                                <div className="h-4 w-3/4 bg-slate-200"></div>
                                <div className="h-4 w-1/2 bg-slate-200"></div>
                                <div className="h-32 w-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 font-mono text-sm uppercase">
                                    Project Portfolio Preview
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Supportive by Design */}
            <section className="py-24 bg-slate-900 text-white text-center">
                <div className="container mx-auto px-6 max-w-3xl">
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-6 text-purple-400">Supportive by Design</h2>
                    <p className="text-xl font-medium text-slate-300 mb-12">
                        Beginner-friendly spaces, open collaboration, and a culture that values curiosity over credentials.
                    </p>
                    <p className="text-4xl font-black uppercase mb-8">
                        You don’t need permission to start building.
                    </p>
                    <Link href="/auth?mode=signup" className="inline-flex items-center gap-2 text-white font-black uppercase tracking-wide hover:text-purple-400 border-b-2 border-white hover:border-purple-400 pb-1 transition-colors">
                        Get Started Now <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
