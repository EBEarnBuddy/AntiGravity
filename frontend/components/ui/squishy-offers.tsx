"use client"

import { motion } from 'framer-motion';

interface OfferCardProps {
    label: string;
    title: string;
    description: string;
    features: string[];
    cta: string;
    BGComponent: React.ComponentType;
}

export const SquishyOffers = ({ offers }: { offers: OfferCardProps[] }) => {
    return (
        <div className="mx-auto flex w-fit flex-wrap justify-center gap-8">
            {offers.map((offer, index) => (
                <OfferCard key={index} {...offer} />
            ))}
        </div>
    );
};

const OfferCard = ({ label, title, description, features, cta, BGComponent }: OfferCardProps) => {
    return (
        <motion.div
            whileHover="hover"
            transition={{ duration: 1, ease: "backInOut" }}
            variants={{ hover: { scale: 1.05 } }}
            className="relative h-[480px] w-72 shrink-0 overflow-hidden rounded-none border-2 border-slate-900 p-6 bg-slate-900 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] transition-all"
        >
            <div className="relative z-10 text-white">
                <span className="mb-3 block w-fit rounded-none bg-white text-slate-900 px-3 py-0.5 text-xs font-black uppercase tracking-widest border-2 border-transparent">
                    {label}
                </span>
                <motion.h3
                    initial={{ scale: 0.85 }}
                    variants={{ hover: { scale: 1 } }}
                    transition={{ duration: 1, ease: "backInOut" }}
                    className="my-2 block origin-top-left text-3xl font-black leading-[1.1] text-white uppercase"
                >
                    {title}
                </motion.h3>
                <p className="text-sm text-white/90 mb-4 font-bold leading-tight">{description}</p>
                <ul className="space-y-2">
                    {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-white/90 font-medium">
                            <span className="text-green-400 font-bold">•</span>
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <button className="absolute bottom-4 left-4 right-4 z-20 rounded-none border-2 border-white bg-white py-2 text-center font-mono font-black uppercase text-slate-900 backdrop-blur-sm transition-all duration-200 hover:bg-slate-900 hover:text-white hover:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                {cta}
            </button>
            <BGComponent />
        </motion.div>
    );
};

const BGComponent1 = () => (
    <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 320 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        variants={{ hover: { scale: 1.5 } }}
        transition={{ duration: 1, ease: "backInOut" }}
        className="absolute inset-0 z-0"
    >
        <motion.circle
            variants={{ hover: { scaleY: 0.5, y: -25 } }}
            transition={{ duration: 1, ease: "backInOut", delay: 0.2 }}
            cx="160.5"
            cy="114.5"
            r="101.5"
            fill="rgba(0, 0, 0, 0.15)"
        />
        <motion.ellipse
            variants={{ hover: { scaleY: 2.25, y: -25 } }}
            transition={{ duration: 1, ease: "backInOut", delay: 0.2 }}
            cx="160.5"
            cy="350"
            rx="101.5"
            ry="43.5"
            fill="rgba(0, 0, 0, 0.15)"
        />
    </motion.svg>
);

const BGComponent2 = () => (
    <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 320 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        variants={{ hover: { scale: 1.05 } }}
        transition={{ duration: 1, ease: "backInOut" }}
        className="absolute inset-0 z-0"
    >
        <motion.rect
            x="14"
            width="153"
            height="153"
            rx="15"
            fill="rgba(0, 0, 0, 0.15)"
            variants={{ hover: { y: 300, rotate: "90deg", scaleX: 2 } }}
            style={{ y: 12 }}
            transition={{ delay: 0.2, duration: 1, ease: "backInOut" }}
        />
        <motion.rect
            x="155"
            width="153"
            height="153"
            rx="15"
            fill="rgba(0, 0, 0, 0.15)"
            variants={{ hover: { y: 12, rotate: "90deg", scaleX: 2 } }}
            style={{ y: 300 }}
            transition={{ delay: 0.2, duration: 1, ease: "backInOut" }}
        />
    </motion.svg>
);

const BGComponent3 = () => (
    <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 320 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        variants={{ hover: { scale: 1.25 } }}
        transition={{ duration: 1, ease: "backInOut" }}
        className="absolute inset-0 z-0"
    >
        <motion.path
            variants={{ hover: { y: -50 } }}
            transition={{ delay: 0.3, duration: 1, ease: "backInOut" }}
            d="M148.893 200C154.751 194.142 164.249 194.142 170.107 200L267.393 297.287C273.251 303.145 273.251 312.642 267.393 318.5L218.75 367.143C186.027 399.866 132.973 399.866 100.25 367.143L51.6068 318.5C45.7489 312.642 45.7489 303.145 51.6068 297.287L148.893 200Z"
            fill="rgba(0, 0, 0, 0.15)"
        />
        <motion.path
            variants={{ hover: { y: -50 } }}
            transition={{ delay: 0.2, duration: 1, ease: "backInOut" }}
            d="M148.893 141.538C154.751 135.68 164.249 135.68 170.107 141.538L267.393 238.825C273.251 244.682 273.251 254.18 267.393 260.038L218.75 308.681C186.027 341.404 132.973 341.404 100.25 308.681L51.6068 260.038C45.7489 254.18 45.7489 244.682 51.6068 238.825L148.893 141.538Z"
            fill="rgba(0, 0, 0, 0.15)"
        />
        <motion.path
            variants={{ hover: { y: -50 } }}
            transition={{ delay: 0.1, duration: 1, ease: "backInOut" }}
            d="M148.893 83.0754C154.751 77.2175 164.249 77.2175 170.107 83.0754L267.393 180.362C273.251 186.22 273.251 195.718 267.393 201.575L218.75 250.219C186.027 282.942 132.973 282.942 100.25 250.219L51.6068 201.575C45.7489 195.718 45.7489 186.22 51.6068 180.362L148.893 83.0754Z"
            fill="rgba(0, 0, 0, 0.15)"
        />
    </motion.svg>
);

export { BGComponent1, BGComponent2, BGComponent3, type OfferCardProps };
