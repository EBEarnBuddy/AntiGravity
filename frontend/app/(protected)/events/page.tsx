"use client";

import React from 'react';
import { Calendar, Plus } from 'lucide-react';

export default function EventsPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-lg w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-24 h-24 bg-orange-100 border-2 border-slate-900 flex items-center justify-center mx-auto rounded-full text-orange-600 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                    <Calendar className="w-10 h-10" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">Events Coming Soon! 📅</h1>
                    <p className="text-slate-500 font-bold text-lg">We're getting the party started. Check back later for hackathons, meetups, and workshops.</p>
                </div>

                <button disabled className="px-8 py-4 bg-slate-200 text-slate-400 font-black rounded-none border-2 border-slate-300 cursor-not-allowed uppercase tracking-wide flex items-center justify-center gap-2 mx-auto">
                    <Plus className="w-5 h-5" /> Host an Event
                </button>
            </div>
        </div>
    );
}
