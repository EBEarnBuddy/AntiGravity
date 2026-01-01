"use client";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Handshake, Building2, GraduationCap, Ticket, Rocket } from "lucide-react";

export default function PartnersPage() {
    return (
        <div className="min-h-screen bg-background font-sans text-slate-900">
            <PublicNavbar />

            {/* Hero */}
            <header className="bg-white text-slate-900 pt-32 pb-24 relative overflow-hidden border-b-4 border-slate-900">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-none">
                        Let’s support <br /> builders, together.
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-bold mb-10 leading-relaxed">
                        We partner with organizations that care about student execution and real-world skills.
                    </p>
                    <a href="mailto:partners@earnbuddy.tech" className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-none border-2 border-slate-900 text-xl font-black uppercase tracking-wide hover:bg-white hover:text-slate-900 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                        <Handshake className="w-6 h-6" /> Start the Conversation
                    </a>
                </div>
            </header>

            {/* Who We Work With */}
            <section className="py-20 bg-slate-50 border-b-4 border-slate-900">
                <div className="container mx-auto px-6 max-w-5xl">
                    <h2 className="text-4xl font-black uppercase tracking-tight mb-12 text-center">Who We Work With</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: Building2, text: "Communities" },
                            { icon: GraduationCap, text: "Colleges" },
                            { icon: Ticket, text: "Hackathons" },
                            { icon: Rocket, text: "Accelerators" },
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 border-2 border-slate-900 text-center hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                                <item.icon className="w-10 h-10 mx-auto text-slate-900 mb-4" />
                                <p className="font-black text-lg uppercase">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partnership Types */}
            <section className="py-20 bg-white border-b-4 border-slate-900">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1">
                            <h2 className="text-4xl font-black uppercase tracking-tight mb-8">Partnership Types</h2>
                            <ul className="space-y-4">
                                {[
                                    "Community Integrations",
                                    "Sponsored Programs",
                                    "Builder Initiatives",
                                    "Events and Collaborations"
                                ].map((type, i) => (
                                    <li key={i} className="flex items-center gap-3 text-lg font-bold border-b-2 border-slate-100 pb-2">
                                        <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                                        {type}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-8 font-bold text-slate-500 italic">"Each partnership is designed, not templated."</p>
                        </div>
                        <div className="flex-1 w-full p-8 bg-slate-900 text-white border-4 border-slate-900 transform rotate-1">
                            <h3 className="text-xl font-black uppercase mb-4 text-green-400">Why Partner?</h3>
                            <p className="text-xl font-bold leading-relaxed">
                                You engage builders where real work happens — not just where content lives.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Closing */}
            <section className="py-20 bg-slate-100 text-center">
                <div className="container mx-auto px-6">
                    <p className="text-2xl font-black uppercase text-slate-900 mb-4">
                        If your mission aligns with builders,<br /> we’re open to a conversation.
                    </p>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
