"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export function PublicNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <>
            <nav className="fixed top-0 w-full z-50 bg-primary/95 backdrop-blur-md border-b border-green-600">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/lander" className="flex items-center gap-2 font-bold text-3xl text-white">
                        <div className="relative h-10 w-auto aspect-square">
                            <Image
                                src="/logo-white.png"
                                alt="EarnBuddy Logo"
                                width={100}
                                height={100}
                                className="object-contain h-full w-auto"
                            />
                        </div>
                        EarnBuddy
                    </Link>

                    <div className="hidden lg:flex items-center gap-8 text-lg font-medium text-white/90">
                        <Link href="/lander#how-it-works" className="hover:text-white transition">How It Works</Link>
                        <Link href="/partners" className="hover:text-white transition">Partners</Link>
                        <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
                        <Link href="/communities" className="hover:text-white transition">Community</Link>
                        <Link href="/lander#faq" className="hover:text-white transition">FAQ</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/auth?mode=signin" className="hidden md:block bg-transparent text-white px-6 py-2.5 rounded-none border-2 border-white text-lg font-black uppercase tracking-wide hover:bg-white/10 transition-all shadow-none">
                            Log In
                        </Link>
                        <Link href="/auth?mode=signup" className="hidden md:block bg-white text-green-600 border-2 border-white px-6 py-2.5 rounded-none text-lg font-black uppercase tracking-wide hover:bg-slate-100 transition shadow-none">
                            Get Started
                        </Link>
                        <button className="lg:hidden text-white" onClick={toggleMenu}>
                            {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                        </button>
                    </div>
                </div>
            </nav>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-40 bg-slate-900 pt-24 px-6 lg:hidden"
                    >
                        <div className="flex flex-col gap-6 text-2xl font-black text-white uppercase tracking-wide">
                            <Link href="/lander#how-it-works" onClick={toggleMenu} className="hover:text-green-400">How It Works</Link>
                            <Link href="/partners" onClick={toggleMenu} className="hover:text-green-400">Partners</Link>
                            <Link href="/pricing" onClick={toggleMenu} className="hover:text-green-400">Pricing</Link>
                            <Link href="/communities" onClick={toggleMenu} className="hover:text-green-400">Community</Link>
                            <Link href="/lander#faq" onClick={toggleMenu} className="hover:text-green-400">FAQ</Link>
                            <hr className="border-slate-800 my-2" />
                            <Link href="/auth?mode=signin" onClick={toggleMenu} className="text-green-400">Log In</Link>
                            <Link href="/auth?mode=signup" onClick={toggleMenu} className="bg-white text-slate-900 p-4 text-center border-4 border-green-500">Get Started</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
