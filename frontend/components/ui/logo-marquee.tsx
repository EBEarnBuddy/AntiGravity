"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface LogoMarqueeProps {
    items: {
        text?: string
        image?: string
    }[]
    speed?: number
}

export function LogoMarquee({ items, speed = 20 }: LogoMarqueeProps) {
    return (
        <div className="w-full relative overflow-hidden bg-slate-50 border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] py-8">
            <div className="flex gap-16 whitespace-nowrap overflow-hidden">
                <motion.div
                    className="flex gap-16 min-w-full items-center"
                    animate={{
                        x: ["0%", "-50%"] // Move half the width (since we double the content)
                    }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: speed
                    }}
                >
                    {/* Render twice for seamless loop */}
                    {[...items, ...items, ...items, ...items].map((item, index) => (
                        <div key={index} className="flex items-center gap-4 shrink-0">
                            {/* If image exists, show it, else show text */}
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.text || "Partner"}
                                    className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                                />
                            ) : null}
                            {item.text && (
                                <span className={cn(
                                    "text-2xl font-black uppercase text-slate-400 hover:text-slate-900 transition-colors",
                                    !item.image && "text-3xl"
                                )}>
                                    {item.text}
                                </span>
                            )}
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Fade Gradients */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
        </div>
    )
}
