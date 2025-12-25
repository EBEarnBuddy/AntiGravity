"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlayIcon } from '@heroicons/react/24/solid';
import { useTour } from './TourContext';

export const TourReengagementBox: React.FC = () => {
    const { isSkipped, isCompleted, startTour, dismissForever } = useTour();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show if skipped and not completed
        if (isSkipped && !isCompleted) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isSkipped, isCompleted]);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: 20, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 20, y: 20 }}
                className="fixed bottom-6 right-6 z-40 bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] p-5 max-w-sm w-full"
            >
                <div className="flex justify-between items-start mb-3 gap-4">
                    <h3 className="font-black text-lg text-slate-900 uppercase">
                        Missed the tour?
                    </h3>
                    <button
                        onClick={dismissForever}
                        className="text-slate-400 hover:text-slate-900 transition"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-sm font-bold text-slate-600 mb-5 uppercase tracking-wide leading-relaxed">
                    Take a quick tour to learn how to find opportunities and build your network.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={startTour}
                        className="flex-1 px-4 py-2 bg-green-600 text-white font-black text-xs uppercase tracking-widest border-2 border-slate-900 hover:bg-green-500 transition flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        <PlayIcon className="w-3 h-3" />
                        Take Tour
                    </button>
                    <button
                        onClick={dismissForever}
                        className="flex-1 px-4 py-2 bg-white text-slate-900 font-black text-xs uppercase tracking-widest border-2 border-slate-900 hover:bg-slate-100 transition shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        Don't Show
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
