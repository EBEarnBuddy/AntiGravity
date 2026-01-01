"use client";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";

export default function FreelancersPage() {
    return (
        <div className="min-h-screen bg-background font-sans text-slate-900">
            <PublicNavbar />

            {/* Hero */}
            <header className="bg-yellow-400 text-slate-900 pt-40 pb-32 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="inline-block bg-slate-900 text-yellow-400 px-4 py-1.5 rounded-none border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] text-sm font-black uppercase tracking-widest mb-8">
                        Colancing & Gigs
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-none">
                        Don't Freelance <br className="hidden md:block" /> Alone.
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-800 max-w-2xl mx-auto font-bold mb-12">
                        Join "Colancing" circles to team up on big projects, share clients, and grow your income together.
                    </p>
                    <Link href="/auth?mode=signup" className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-none border-2 border-white text-xl font-black uppercase tracking-wide hover:bg-white hover:text-slate-900 transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                        Find Gigs
                    </Link>
                </div>
            </header>

            <PublicFooter />
        </div>
    );
}
