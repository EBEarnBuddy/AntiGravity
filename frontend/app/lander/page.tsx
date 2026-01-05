"use client";

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    Play,
    Users,
    Zap,
    Globe,
    ChevronLeft,
    ChevronRight,
    X,
    Check,
    Shield,
    Clock,
    Target,
    Layers,
    History,
    MessageSquare,
    ArrowRight,
    Calendar,
    Rocket
} from "lucide-react";
import Link from "next/link";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";


import { useRef } from "react";

// --- ANIMATION COMPONENTS ---

interface RevealProps {
    children: React.ReactNode;
    width?: "fit-content" | "100%";
    delay?: number;
}

const Reveal = ({ children, width = "fit-content", delay = 0 }: RevealProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-75px" });

    return (
        <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 75 },
                    visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{ duration: 0.5, delay: delay, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </div>
    );
};

// 1. LogoMarquee
interface LogoMarqueeProps {
    items: {
        text?: string
        image?: string
    }[]
    speed?: number
}

function LogoMarquee({ items, speed = 20 }: LogoMarqueeProps) {
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

// 2. VideoModal
interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

function VideoModal({ isOpen, onClose }: VideoModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center isolate">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl mx-4 aspect-video bg-black border-2 border-white/20 shadow-2xl rounded-xl overflow-hidden flex items-center justify-center"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <span className="text-4xl">🎥</span>
                            </div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-wider">Video Coming Soon</h3>
                            <p className="text-gray-400 font-medium">We are crafting an epic introduction for you.</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}



// 4. Faq5
interface FaqItem {
    question: string;
    answer: string;
}

interface Faq5Props {
    badge?: string;
    heading?: string;
    description?: string;
    faqs?: FaqItem[];
}

const defaultFaqs: FaqItem[] = [
    {
        question: "What is EarnBuddy?",
        answer: "EarnBuddy is a platform that connects ambitious students (Builders) with startup founders, enabling them to gain real-world experience, build portfolios, and earn while they learn.",
    },
    {
        question: "Who can join as a Builder?",
        answer: "Any student with a skill—be it coding, design, marketing, or content—can join. We especially look for people who want to move beyond hello-world projects.",
    },
    {
        question: "How do I get verified?",
        answer: "Complete your profile, add your projects, and pass a basic skill assessment or get vouching from a partner institution like E-Cell IIT BHU.",
    },
    {
        question: "Is it free to join?",
        answer: "Yes, joining the waitlist and creating a profile is completely free for students.",
    },
];

const Faq5 = ({
    badge = "FAQ",
    heading = "Common Questions",
    description = "Everything you need to know about the platform.",
    faqs = defaultFaqs,
}: Faq5Props) => {
    return (
        <section className="py-24 bg-white text-slate-900 px-6">
            {/* Inner content managed by parent */}
            <div className="text-center mb-16">
                <div className="inline-block bg-green-400 text-slate-900 px-3 py-1 text-xs font-black uppercase border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
                    {badge}
                </div>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900">{heading}</h2>
                <p className="mt-4 text-slate-500 text-lg font-bold max-w-2xl mx-auto">
                    {description}
                </p>
            </div>
            <div className="mx-auto mt-14 space-y-6 max-w-4xl">
                {faqs.map((faq, index) => (
                    <div key={index} className="flex gap-6 bg-white p-6 rounded-none border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-none bg-slate-900 text-green-400 font-black font-mono text-lg border-2 border-slate-900">
                            {index + 1}
                        </span>
                        <div>
                            <h3 className="font-black text-xl mb-2 text-slate-900 uppercase">{faq.question}</h3>
                            <p className="text-slate-600 leading-relaxed font-medium">{faq.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

// 5. SquishyOffers
interface OfferCardProps {
    label: string;
    title: string;
    description: string;
    features: string[];
    cta: string;
    href: string;
    BGComponent: React.ComponentType;
}

const SquishyOffers = ({ offers }: { offers: OfferCardProps[] }) => {
    return (
        <div className="mx-auto flex w-fit flex-wrap justify-center gap-8">
            {offers.map((offer, index) => (
                <OfferCard key={index} {...offer} />
            ))}
        </div>
    );
};

const OfferCard = ({ label, title, description, features, cta, href, BGComponent }: OfferCardProps) => {
    return (
        <Link href={href}>
            <motion.div
                whileHover="hover"
                transition={{ duration: 1, ease: "backInOut" }}
                variants={{ hover: { scale: 1.05 } }}
                className="relative h-[480px] w-72 shrink-0 overflow-hidden rounded-none border-2 border-slate-900 p-6 bg-green-900 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] transition-all cursor-pointer"
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
                                <span className="text-black font-extrabold stroke-black">•</span>
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
        </Link>
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


// 6. LanderSlideshow
interface SlideData {
    id: string;
    bgColor: string;
    patternColor: string;
    title: React.ReactNode;
    description: string;
    ctas: { text: string; href: string; primary?: boolean }[];
}

const slides: SlideData[] = [
    {
        id: "startups",
        bgColor: "bg-blue-600",
        patternColor: "text-blue-500",
        title: <>Find people. <br /> Build together. <br className="md:hidden" /> Keep moving.</>,
        description: "EarnBuddy helps startups form teams and work inside shared spaces — from first conversation to execution.",
        ctas: [{ text: "Post an Opportunity", href: "/auth?mode=signup", primary: true }]
    },
    {
        id: "freelancers",
        bgColor: "bg-yellow-400",
        patternColor: "text-yellow-500",
        title: <>Freelancing, <br /> without the noise.</>,
        description: "Find real work, talk directly to clients, and build a visible track record over time.",
        ctas: [
            { text: "Browse Opportunities", href: "/auth?mode=signup", primary: true },
            { text: "Create Profile", href: "/auth?mode=signup", primary: false }
        ]
    },
    {
        id: "communities",
        bgColor: "bg-red-500",
        patternColor: "text-red-600",
        title: <>A better home for <br /> serious communities.</>,
        description: "EarnBuddy helps communities talk, collaborate, and build things together — without friction.",
        ctas: [{ text: "Create a Community Circle", href: "/auth?mode=signup", primary: true }]
    },
    {
        id: "events",
        bgColor: "bg-purple-600",
        patternColor: "text-purple-500",
        title: <>Host global events. <br /> Build local connection.</>,
        description: "From hackathons to meetups, EarnBuddy is the place to gather the builders.",
        ctas: [{ text: "Host an Event", href: "/auth?mode=signup", primary: true }]
    }
];

const LanderSlideshow = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const handleDotClick = (index: number) => {
        setCurrent(index);
    };

    return (
        <section className="relative h-[650px] overflow-hidden border-b-4 border-slate-900 border-t-4 bg-slate-900">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className={cn(
                        "absolute inset-0 flex items-center justify-center text-center",
                        slides[current].bgColor
                    )}
                >
                    {/* Background Pattern */}
                    <div className={cn("absolute inset-0 opacity-20 pointer-events-none", slides[current].patternColor)}>
                        <svg className="w-full h-full" width="100%" height="100%">
                            <defs>
                                <pattern id={`pattern-${current}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <circle cx="2" cy="2" r="2" fill="currentColor" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill={`url(#pattern-${current})`} />
                        </svg>
                    </div>

                    <div className="container mx-auto px-6 relative z-10">
                        <Reveal width="100%">
                            <h2 className={cn(
                                "text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-none",
                                slides[current].id === "freelancers" ? "text-slate-900" : "text-white"
                            )}>
                                {slides[current].title}
                            </h2>
                            <p className={cn(
                                "text-xl md:text-2xl max-w-2xl mx-auto font-bold mb-10 leading-relaxed",
                                slides[current].id === "freelancers" ? "text-slate-800" : "text-white/90"
                            )}>
                                {slides[current].description}
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                {slides[current].ctas.map((cta, idx) => (
                                    <Link
                                        key={idx}
                                        href={cta.href}
                                        className={cn(
                                            "px-8 py-4 rounded-none border-2 border-slate-900 text-xl font-black uppercase tracking-wide transition-all",
                                            cta.primary
                                                ? slides[current].id === "freelancers"
                                                    ? "bg-slate-900 text-white hover:bg-white hover:text-slate-900 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                                                    : "bg-white text-slate-900 hover:bg-slate-900 hover:text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                                                : "bg-transparent text-slate-900 hover:bg-slate-900 hover:text-white border-slate-900"
                                        )}
                                    >
                                        {cta.text}
                                    </Link>
                                ))}
                            </div>
                        </Reveal>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Dots */}
            <div className="absolute bottom-12 left-0 right-0 z-20 flex justify-center gap-4">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleDotClick(idx)}
                        className={cn(
                            "w-4 h-4 rounded-none border-2 border-slate-900 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                            current === idx ? "bg-white scale-110" : "bg-slate-900/50 hover:bg-white"
                        )}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};


// --- MAIN PAGE COMPONENT ---

function LanderContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { logout, currentUser } = useAuth();
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    useEffect(() => {
        const performLogout = async () => {
            if (searchParams.get('logout') === 'true' && currentUser) {
                try {
                    await logout();
                    router.replace('/lander');
                } catch (error) {
                    console.error("Logout failed on lander:", error);
                }
            }
        };
        performLogout();
    }, [searchParams, logout, currentUser, router]);

    return (
        <div className="min-h-screen bg-background font-sans text-slate-900 overflow-x-hidden">
            <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />

            <PublicNavbar />

            {/* Hero Section */}
            <header className="bg-primary text-white pt-24 pb-0 overflow-hidden relative">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-8 pb-32 z-10">
                            <Reveal width="100%">
                                <div className="inline-block bg-white/10 text-white px-4 py-1.5 rounded-none border-2 border-white text-sm font-black uppercase tracking-widest backdrop-blur-sm mb-6">
                                    Early Access
                                </div>
                                <h1 className="text-6xl md:text-7xl font-black leading-none tracking-tight uppercase mb-6">
                                    Launch your career with <br className="hidden md:block" /> real startup experience.
                                </h1>
                                <p className="text-2xl text-green-50 max-w-xl leading-relaxed font-bold mb-8">
                                    Join India's fastest growing community of student builders. Learn from founders, ship real products, and get hired.
                                </p>
                                <div className="flex items-center gap-4">
                                    <Link href="/auth?mode=signup" className="bg-white text-slate-900 px-8 py-4 rounded-none border-2 border-slate-900 text-xl font-black uppercase tracking-wide shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition flex items-center gap-2">
                                        Find a Team
                                    </Link>
                                    <button
                                        onClick={() => setIsVideoOpen(true)}
                                        className="px-6 py-4 rounded-none border-2 border-white text-xl font-black uppercase tracking-wide text-white hover:bg-white/10 transition flex items-center gap-2 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                                    >
                                        <Play className="w-6 h-6 fill-current" /> Watch Video
                                    </button>
                                </div>
                            </Reveal>
                        </div>

                        {/* Hero Image Mockup */}
                        <div className="flex-1 relative translate-x-4 md:translate-x-0 translate-y-10 md:translate-y-20 hidden md:block">
                            <div className="relative z-10">
                                <div className="bg-white rounded-none shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden border-4 border-slate-900">
                                    <div className="bg-gray-100 h-8 flex items-center px-4 gap-2 border-b border-gray-200">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                        </div>
                                        <div className="bg-white text-[10px] text-gray-400 px-2 py-0.5 rounded flex-1 text-center mx-4 font-mono">earnbuddy.tech</div>
                                    </div>
                                    {/* Content Simulation - Realistic Dashboard Mockup */}
                                    <div className="bg-slate-50 relative aspect-[16/10] overflow-hidden group">
                                        {/* Sidebar */}
                                        <div className="absolute left-0 top-0 bottom-0 w-16 bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-4 z-20">
                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                                <Zap className="w-4 h-4 fill-current" />
                                            </div>
                                            <div className="w-8 h-8 hover:bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <div className="w-8 h-8 hover:bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                <Globe className="w-4 h-4" />
                                            </div>
                                        </div>

                                        {/* Header */}
                                        <div className="absolute top-0 left-16 right-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="h-8 w-8 bg-slate-100 rounded-full"></div>
                                                <div className="h-8 w-24 bg-black rounded flex items-center justify-center text-white text-[10px] font-bold uppercase">Post Role</div>
                                            </div>
                                        </div>

                                        {/* Cards */}
                                        <div className="absolute top-14 left-16 right-0 bottom-0 p-6 overflow-hidden">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-purple-100 rounded-full"></div>
                                                            <div>
                                                                <div className="h-3 w-20 bg-slate-200 rounded mb-1"></div>
                                                                <div className="h-2 w-16 bg-slate-100 rounded"></div>
                                                            </div>
                                                        </div>
                                                        <div className="h-5 w-16 bg-green-100 rounded-full"></div>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 rounded"></div>
                                                    <div className="h-2 w-3/4 bg-slate-100 rounded"></div>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-blue-100 rounded-full"></div>
                                                            <div>
                                                                <div className="h-3 w-16 bg-slate-200 rounded mb-1"></div>
                                                                <div className="h-2 w-24 bg-slate-100 rounded"></div>
                                                            </div>
                                                        </div>
                                                        <div className="h-5 w-16 bg-green-100 rounded-full"></div>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 rounded"></div>
                                                    <div className="h-2 w-2/3 bg-slate-100 rounded"></div>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-yellow-100 rounded-full"></div>
                                                            <div>
                                                                <div className="h-3 w-24 bg-slate-200 rounded mb-1"></div>
                                                                <div className="h-2 w-14 bg-slate-100 rounded"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 rounded"></div>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-red-100 rounded-full"></div>
                                                            <div>
                                                                <div className="h-3 w-20 bg-slate-200 rounded mb-1"></div>
                                                            </div>
                                                        </div>
                                                        <div className="h-5 w-12 bg-slate-100 rounded-full"></div>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 rounded"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Decoration */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/5 rounded-full blur-3xl -z-0"></div>
                        </div>
                    </div>
                </div>

                {/* Wave separator */}
                <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-none rotate-180">
                    <svg className="relative block w-[calc(100%+1.3px)] h-[30px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#000000"></path>
                    </svg>
                </div>
            </header>

            {/* How EarnBuddy Works */}
            <section id="how-it-works" className="py-24 bg-black text-white relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(45deg,#333_25%,transparent_25%,transparent_75%,#333_75%,#333),linear-gradient(45deg,#333_25%,transparent_25%,transparent_75%,#333_75%,#333)] [background-size:20px_20px] [background-position:0_0,10px_10px]"></div>

                <div className="container mx-auto px-6 relative z-10 pt-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <Reveal width="100%">
                            <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter text-white">
                                What EarnBuddy Offers
                            </h2>
                            <p className="text-lg text-gray-300 font-bold">
                                Everything you need to build, launch, and grow.
                            </p>
                        </Reveal>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {/* Startups */}
                        <Reveal delay={0.1}>
                            <SquishyOffers
                                offers={[
                                    {
                                        label: "For Founders",
                                        title: "Startups",
                                        description: "Post roles, find co-founders, and build your team",
                                        features: ["Post unlimited roles", "Find co-founders", "Private Circles"],
                                        cta: "Learn More",
                                        href: "/for-startups",
                                        BGComponent: BGComponent1
                                    }
                                ]}
                            />
                        </Reveal>
                        {/* Freelancers */}
                        <Reveal delay={0.2}>
                            <SquishyOffers
                                offers={[
                                    {
                                        label: "For Freelancers",
                                        title: "Colancing",
                                        description: "Offer services, find projects, team up for gigs",
                                        features: ["Post projects", "Secure payments", "Reputation System"],
                                        cta: "Learn More",
                                        href: "/for-freelancers",
                                        BGComponent: BGComponent2
                                    }
                                ]}
                            />
                        </Reveal>
                        {/* Circles */}
                        <Reveal delay={0.3}>
                            <SquishyOffers
                                offers={[
                                    {
                                        label: "For Communities",
                                        title: "Circles",
                                        description: "Build communities, host events, collaborate",
                                        features: ["Create communities", "Group Chat", "Analytics"],
                                        cta: "Learn More",
                                        href: "/for-communities",
                                        BGComponent: BGComponent3
                                    }
                                ]}
                            />
                        </Reveal>
                        {/* Events */}
                        <Reveal delay={0.4}>
                            <SquishyOffers
                                offers={[
                                    {
                                        label: "For Everyone",
                                        title: "Events",
                                        description: "Discover hackathons, meetups, and workshops",
                                        features: ["Host events", "Register attendees", "Networking"],
                                        cta: "Learn More",
                                        href: "/events",
                                        BGComponent: BGComponent1
                                    }
                                ]}
                            />
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* Partners */}
            <section id="partners" className="py-24 bg-white relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] [background-size:24px_24px]"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-12">
                        <Reveal width="100%">
                            <div className="inline-block bg-green-100 text-green-800 px-3 py-1 text-xs font-black uppercase border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">Verified Partners</div>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 uppercase tracking-tighter">
                                Partnering with <span className="text-green-600">top institutions</span>
                            </h2>
                            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-bold">
                                Trusted by leading entrepreneurship cells and colleges
                            </p>
                        </Reveal>
                    </div>

                    <LogoMarquee
                        items={[
                            { image: "/partners/iitbhu/ecell iit bhu.webp", text: "E-Cell IIT BHU" },
                            { image: "/partners/iitbhilai/iitbhilai.jpeg", text: "IIT Bhilai" },
                            { image: "/partners/iitmandi/iitmandi.png", text: "IIT Mandi" }
                        ]}
                        speed={10}
                    />
                </div>
            </section>

            {/* --- SLIDESHOW SECTION --- */}
            <LanderSlideshow />

            {/* FAQ */}
            <section id="faq" className="bg-white border-t-4 border-slate-900 pt-32 pb-24">
                <Reveal width="100%">
                    <Faq5
                        badge="FAQ"
                        heading="Frequently Asked Questions"
                        description="Everything you need to know about the platform."
                    />
                </Reveal>
            </section>

            <PublicFooter />
        </div>
    );

}

export default function Lander() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <LanderContent />
        </Suspense>
    );
}
