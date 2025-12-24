import React from 'react';
import { motion } from 'framer-motion';

const BrutalistLoader: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <motion.div
                className="w-16 h-16 bg-green-500 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
                animate={{
                    rotate: [0, 90, 180, 270, 360],
                    scale: [1, 1.2, 1, 0.8, 1],
                }}
                transition={{
                    duration: 2,
                    ease: "easeInOut",
                    times: [0, 0.2, 0.5, 0.8, 1],
                    repeat: Infinity,
                }}
            />
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest animate-pulse">
                Loading_
            </h3>
        </div>
    );
};

export default BrutalistLoader;
