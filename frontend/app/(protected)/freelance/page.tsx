"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Users as UsersIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

const FreelancePage: React.FC = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col items-center justify-center p-6 text-center">
            {/* Nav spacer */}
            <div className="h-14"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]"
            >
                <div className="w-20 h-20 bg-green-100 border-4 border-slate-900 flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                    <UsersIcon className="w-10 h-10 text-slate-900" />
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase transform -rotate-1">
                    Co-Lancing
                </h1>

                <div className="inline-block bg-green-500 border-2 border-slate-900 px-3 py-1 mb-6 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                    <span className="text-xs font-black text-white uppercase tracking-widest">Coming Soon</span>
                </div>

                <p className="text-lg text-slate-600 font-bold uppercase leading-relaxed mb-8 px-4">
                    Build your startup squad. Form agencies. Tackle bigger projects together.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        id="tour-freelance-notify"
                        onClick={() => alert("We'll notify you when CoLancing launches!")}
                        className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white font-black uppercase tracking-widest border-4 border-slate-900 hover:bg-slate-800 hover:shadow-[4px_4px_0px_0px_rgba(22,163,74,1)] transition-all transform hover:-translate-y-1 text-sm"
                    >
                        Notify Me
                    </button>
                    <button
                        onClick={() => router.push('/discover')}
                        className="w-full sm:w-auto px-6 py-3 bg-white text-slate-900 font-black uppercase tracking-widest border-4 border-slate-900 hover:bg-slate-100 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all transform hover:-translate-y-1 text-sm"
                    >
                        Back to Home
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default FreelancePage;
