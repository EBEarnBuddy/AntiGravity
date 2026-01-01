"use client";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Handshake } from "lucide-react";

export default function PartnersPage() {
    return (
        <div className="min-h-screen bg-background font-sans text-slate-900">
            <PublicNavbar />

            {/* Hero */}
            <header className="bg-white text-slate-900 pt-40 pb-32 relative overflow-hidden border-b-4 border-slate-900">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="inline-block bg-slate-900 text-white px-4 py-1.5 rounded-none border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm font-black uppercase tracking-widest mb-8">
                        Partnership Program
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-none">
                        Empower Your <br className="hidden md:block" /> Student Community
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-bold mb-12">
                        Partner with EarnBuddy to give your students exclusive access to projects, internships, and startup opportunities.
                    </p>
                    <a href="mailto:partners@earnbuddy.tech" className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-none border-2 border-slate-900 text-xl font-black uppercase tracking-wide hover:bg-white hover:text-slate-900 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                        <Handshake className="w-6 h-6" /> Become a Partner
                    </a>
                </div>
            </header>

            <PublicFooter />
        </div>
    );
}
