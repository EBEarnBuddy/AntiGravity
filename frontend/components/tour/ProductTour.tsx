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
    const [coords, setCoords] = useState<{ x: number, y: number, placement: 'top' | 'bottom' }>({ x: 0, y: 0, placement: 'bottom' });

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
                console.warn(`Tour target not found: ${step.targetId}`);
                setTargetRect(null);
            }
        };

        const timeout = setTimeout(updatePosition, 100);
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isActive, currentStepIndex, steps]);

    // Calculate Coords with Clamping
    useEffect(() => {
        if (!targetRect || !isActive) return;

        const step = steps[currentStepIndex];
        const TOOLTIP_WIDTH = 320;
        const PADDING = 16;

        // Calculate horizontal position
        // improved logic: center by default, unless bottom-end
        let left = targetRect.left + (targetRect.width / 2) - (TOOLTIP_WIDTH / 2);

        if (step.position === 'bottom-end') {
            left = targetRect.right - TOOLTIP_WIDTH;
        }

        // Clamp to viewport
        if (left < PADDING) left = PADDING;
        if (left + TOOLTIP_WIDTH > window.innerWidth - PADDING) {
            left = window.innerWidth - TOOLTIP_WIDTH - PADDING;
        }

        // Calculate vertical position
        const isTop = (step.position || 'bottom').startsWith('top');
        let top = isTop
            ? targetRect.top - 16
            : targetRect.bottom + 16;

        setCoords({ x: left, y: top, placement: isTop ? 'top' : 'bottom' });

    }, [targetRect, isActive, currentStepIndex, steps]);

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
                            borderRadius: '0px',
                        }}
                        className="transition-all duration-300 ease-in-out border-4 border-green-500"
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
                            left: coords.x,
                            top: coords.y,
                            transform: coords.placement === 'top' ? 'translateY(-100%)' : 'none',
                            width: '320px',
                            maxWidth: 'calc(100vw - 32px)'
                        }}
                        className="bg-white rounded-none shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] p-6 pointer-events-auto border-4 border-slate-900"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-black text-xl text-slate-900 uppercase tracking-wide">{currentStep.title}</h3>
                            <button
                                onClick={skipTour}
                                className="text-slate-400 hover:text-slate-900 transition"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <p className="text-slate-600 mb-8 text-sm font-bold uppercase leading-relaxed tracking-wide">
                            {currentStep.content}
                        </p>

                        {/* Footer / Controls */}
                        <div className="flex justify-between items-center">
                            <div className="flex gap-1.5">
                                {steps.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-2 transition-all duration-300 ${idx === currentStepIndex ? 'w-6 bg-green-600 border-2 border-slate-900' : 'w-2 bg-slate-200 border-2 border-slate-300'
                                            }`}
                                    />
                                ))}
                            </div>

                            <div className="flex gap-3">
                                {!isFirst && (
                                    <button
                                        onClick={prevStep}
                                        className="px-4 py-2 text-slate-900 font-black text-xs uppercase tracking-wider border-2 border-slate-900 hover:bg-slate-100 transition shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                                    >
                                        Back
                                    </button>
                                )}
                                <button
                                    onClick={nextStep}
                                    className="px-6 py-2 bg-green-600 text-white font-black text-xs uppercase tracking-wider border-2 border-slate-900 hover:bg-green-500 transition flex items-center gap-1 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
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
