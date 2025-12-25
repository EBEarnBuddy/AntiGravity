import React from 'react';
import { motion } from 'framer-motion';

interface BrutalistSpinnerProps {
    className?: string;
    size?: number;
    color?: string;
}

import { cn } from "@/lib/utils";

export const BrutalistSpinner: React.FC<BrutalistSpinnerProps> = ({
    className = "",
    size = 24,
    color = "bg-white"
}) => {
    return (
        <motion.div
            className={cn("border-2 border-slate-900", color, className)}
            style={{
                width: size,
                height: size,
            }}
            animate={{
                rotate: [0, 90, 180, 270, 360],
                borderRadius: ["0%", "20%", "0%", "20%", "0%"]
            }}
            transition={{
                duration: 1.5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 0.1
            }}
        />
    );
};
