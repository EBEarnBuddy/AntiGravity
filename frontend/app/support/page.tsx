"use client";

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Search } from "lucide-react";

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-background font-sans text-slate-900">
            <PublicNavbar />

            {/* Hero */}
            <header className="bg-green-100 text-slate-900 pt-32 pb-24 relative overflow-hidden border-b-4 border-slate-900">
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-none">
                        How can we help?
                    </h1>
                    <div className="max-w-xl mx-auto relative">
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            className="w-full h-14 pl-12 pr-4 bg-white border-2 border-slate-900 text-lg font-bold focus:outline-none focus:ring-0 placeholder:text-slate-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                    </div>
                </div>
            </header>

            {/* Topics */}
            <section className="py-20 bg-white border-b-4 border-slate-900">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Topic 1 */}
                        <div className="p-8 border-2 border-slate-900 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-slate-50">
                            <h2 className="text-xl font-black uppercase mb-4">Getting Started</h2>
                            <ul className="space-y-3 font-medium text-slate-600">
                                <li className="hover:text-green-600 cursor-pointer">Creating your profile</li>
                                <li className="hover:text-green-600 cursor-pointer">Joining your first circle</li>
                                <li className="hover:text-green-600 cursor-pointer">Verification process</li>
                            </ul>
                        </div>
                        {/* Topic 2 */}
                        <div className="p-8 border-2 border-slate-900 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-slate-50">
                            <h2 className="text-xl font-black uppercase mb-4">Circles & Roles</h2>
                            <ul className="space-y-3 font-medium text-slate-600">
                                <li className="hover:text-green-600 cursor-pointer">Managing a community</li>
                                <li className="hover:text-green-600 cursor-pointer">Assigning roles</li>
                                <li className="hover:text-green-600 cursor-pointer">Circle settings</li>
                            </ul>
                        </div>
                        {/* Topic 3 */}
                        <div className="p-8 border-2 border-slate-900 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-slate-50">
                            <h2 className="text-xl font-black uppercase mb-4">Opportunities</h2>
                            <ul className="space-y-3 font-medium text-slate-600">
                                <li className="hover:text-green-600 cursor-pointer">Posting a job or gig</li>
                                <li className="hover:text-green-600 cursor-pointer">Applying to startups</li>
                                <li className="hover:text-green-600 cursor-pointer">Payment safety</li>
                            </ul>
                        </div>
                        {/* Topic 4 */}
                        <div className="p-8 border-2 border-slate-900 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow bg-slate-50">
                            <h2 className="text-xl font-black uppercase mb-4">Trust & Safety</h2>
                            <ul className="space-y-3 font-medium text-slate-600">
                                <li className="hover:text-green-600 cursor-pointer">Community guidelines</li>
                                <li className="hover:text-green-600 cursor-pointer">Blocking & reporting</li>
                                <li className="hover:text-green-600 cursor-pointer">Data privacy</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Support */}
            <section className="py-20 bg-slate-100 text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-black uppercase text-slate-900 mb-6">Start a conversation</h2>
                    <p className="text-lg font-medium text-slate-600 mb-8">
                        Can't find what you need? We are here.
                    </p>
                    <a href="mailto:support@earnbuddy.tech" className="inline-block bg-slate-900 text-white px-8 py-4 rounded-none border-2 border-slate-900 text-xl font-black uppercase tracking-wide hover:bg-white hover:text-slate-900 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                        Email Support
                    </a>

                    <p className="mt-12 font-bold text-slate-400">
                        Still need help? Talk to us.
                    </p>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
