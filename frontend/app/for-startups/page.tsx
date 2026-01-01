"use client";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";

export default function StartupsPage() {
    return (
        <div className="min-h-screen bg-background font-sans text-slate-900">
            <PublicNavbar />

            {/* Hero */}
            <header className="bg-blue-600 text-white pt-40 pb-32 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="inline-block bg-white text-blue-600 px-4 py-1.5 rounded-none border-2 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm font-black uppercase tracking-widest mb-8">
                        For Founders
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-none">
                        Hire Hunger, <br className="hidden md:block" /> Not Just Prestige.
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto font-bold mb-12">
                        Find ambitious interns and co-founders who are ready to hustle. Verify their skills through real projects, not just interviews.
                    </p>
                    <Link href="/auth?mode=signup" className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-none border-2 border-slate-900 text-xl font-black uppercase tracking-wide hover:bg-slate-900 hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                        Post a Role
                    </Link>
                </div>
            </header>

            <PublicFooter />
        </div>
    );
}
