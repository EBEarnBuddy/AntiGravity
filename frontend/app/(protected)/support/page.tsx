"use client";

import React from 'react';
import { Mail, MessageSquare, Phone } from 'lucide-react';

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Need Help? 🚑</h1>
                    <p className="text-slate-500 font-bold">We're here to help you get back on track.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 text-left">
                    <div className="bg-white p-8 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 transition-all">
                        <div className="w-12 h-12 bg-green-100 border-2 border-slate-900 flex items-center justify-center mb-4 text-green-700">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h3 className="font-black text-xl text-slate-900 mb-2 uppercase">Email Us</h3>
                        <p className="text-slate-500 font-medium mb-4">For general inquiries and account support.</p>
                        <a href="mailto:support@earnbuddy.tech" className="text-green-600 font-black hover:underline decoration-2 underline-offset-4">support@earnbuddy.tech</a>
                    </div>


                </div>

                <div className="pt-8 border-t-2 border-slate-200">
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">EarnBuddy Support Center</p>
                </div>
            </div>
        </div>
    );
}
