"use client";

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTour } from './TourContext';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

export const ProductTour: React.FC = () => {
    const { isActive, currentStepIndex, steps, nextStep, prevStep, skipTour } = useTour();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Update target position on step change or resize
    useEffect(() => {
        if (!isActive) return;

        const updatePosition = () => {
            const step = steps[currentStepIndex];
            const element = document.getElementById(step.targetId);

            if (element) {
                // Scroll to element with some padding
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTargetRect(element.getBoundingClientRect());
            } else {
                // If element not found, we might want to skip or just show centered
                // For now, let's just log it
                console.warn(`Tour target not found: ${step.targetId}`);
                setTargetRect(null);
            }
        };

        // Small delay to allow for rendering/animations
        const timeout = setTimeout(updatePosition, 100);
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true); // Capture scroll events

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isActive, currentStepIndex, steps]);

    if (!mounted || !isActive) return null;

    const currentStep = steps[currentStepIndex];
    const isFirst = currentStepIndex === 0;
    const isLast = currentStepIndex === steps.length - 1;

    return createPortal(
        <div className="fixed inset-0 z-[99999] pointer-events-none">
            {/* Dark Overlay with Cutout */}
            <div className="absolute inset-0 bg-black/50 overflow-hidden pointer-events-auto transition-colors duration-500">
                {targetRect && (
                    <div
                        style={{
                            position: 'absolute',
                            left: targetRect.left - 4,
                            top: targetRect.top - 4,
                            width: targetRect.width + 8,
                            height: targetRect.height + 8,
                            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
                            borderRadius: '12px',
                        }}
                        className="transition-all duration-300 ease-in-out border-2 border-green-500/50"
                    />
                )}
            </div>

            {/* Tooltip Card */}
            <AnimatePresence mode="wait">
                {targetRect && (
                    <motion.div
                        key={currentStep.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: 'absolute',
                            // Simple positioning logic - needs refinement for edge cases
                            left: targetRect.left + (targetRect.width / 2),
                            top: currentStep.position === 'top'
                                ? targetRect.top - 16
                                : targetRect.bottom + 16,
                            translateX: '-50%',
                            translateY: currentStep.position === 'top' ? '-100%' : '0'
                        }}
                        className="bg-white rounded-2xl shadow-2xl p-6 w-[320px] pointer-events-auto border-2 border-slate-900"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-black text-lg text-slate-900">{currentStep.title}</h3>
                            <button
                                onClick={skipTour}
                                className="text-slate-400 hover:text-slate-600 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <p className="text-slate-600 mb-6 text-sm font-medium leading-relaxed">
                            {currentStep.content}
                        </p>

                        {/* Footer / Controls */}
                        <div className="flex justify-between items-center">
                            <div className="flex gap-1">
                                {steps.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStepIndex ? 'w-6 bg-green-600' : 'w-1.5 bg-slate-200'
                                            }`}
                                    />
                                ))}
                            </div>

                            <div className="flex gap-2">
                                {!isFirst && (
                                    <button
                                        onClick={prevStep}
                                        className="px-3 py-2 text-slate-500 font-bold text-sm hover:text-slate-900 transition"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    onClick={nextStep}
                                    className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-700 transition flex items-center gap-1 shadow-lg text-sm"
                                >
                                    {isLast ? 'Finish' : 'Next'}
                                    {!isLast && <ChevronRight className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>,
        document.body
    );
};
