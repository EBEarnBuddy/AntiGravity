"use client";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Mail } from "lucide-react";

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-background font-sans text-slate-900">
            <PublicNavbar />

            {/* Hero */}
            <header className="bg-slate-900 text-white pt-40 pb-32 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="inline-block bg-green-400 text-slate-900 px-4 py-1.5 rounded-none border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] text-sm font-black uppercase tracking-widest mb-8">
                        We're Hiring
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-none">
                        Build the Future of <br className="hidden md:block" /> Work With Us
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-bold mb-12">
                        We're a small team of ambitious builders. We move fast, break things, and fix them faster. Join us.
                    </p>
                    <a href="mailto:careers@earnbuddy.tech" className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-none border-2 border-white text-xl font-black uppercase tracking-wide hover:bg-green-400 hover:border-green-400 hover:text-slate-900 transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                        <Mail className="w-6 h-6" /> Apply via Email
                    </a>
                </div>
            </header>

            <PublicFooter />
        </div>
    );
}
