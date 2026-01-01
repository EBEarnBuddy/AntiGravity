"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";

export function PublicNavbar() {
    return (
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
                    <Link href="/auth?mode=signup" className="bg-white text-green-600 border-2 border-white px-6 py-2.5 rounded-none text-lg font-black uppercase tracking-wide hover:bg-slate-100 transition shadow-none">
                        Get Started
                    </Link>
                    <button className="lg:hidden text-white"><Menu className="w-8 h-8" /></button>
                </div>
            </div>
        </nav>
    );
}
