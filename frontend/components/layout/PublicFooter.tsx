"use client";

import Link from "next/link";
import Image from "next/image";
import {
    ArrowRight,
    Mail,
    Instagram,
    Twitter,
    Linkedin
} from "lucide-react";

export function PublicFooter() {
    return (
        <footer className="bg-green-600 text-white py-24 border-t-4 border-slate-900 relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div>
                        <div className="flex items-center gap-2 font-bold text-2xl text-white mb-6">
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
                        </div>
                        <p className="text-white leading-relaxed mb-8 max-w-sm font-medium">
                            Where ambitious builders come together to turn ideas into reality. Build. Collaborate. Earn.
                        </p>
                        <div className="flex gap-6">
                            <a href="mailto:business@earnbuddy.tech" className="text-white hover:text-green-400 cursor-pointer transition">
                                <Mail className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-white hover:text-green-400 cursor-pointer transition">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-white hover:text-green-400 cursor-pointer transition">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-white hover:text-green-400 cursor-pointer transition">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-black text-lg mb-6 uppercase tracking-wider text-slate-900">Quick Links</h4>
                        <ul className="space-y-4 text-white font-bold">
                            <li><Link href="/lander#how-it-works" className="hover:text-slate-900 transition">For Students</Link></li>
                            <li><Link href="/lander#startups" className="hover:text-slate-900 transition">For Startups</Link></li>
                            <li><Link href="/lander#freelancers" className="hover:text-slate-900 transition">For Freelancers</Link></li>
                            <li><Link href="/lander#communities" className="hover:text-slate-900 transition">For Communities</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-lg mb-6 uppercase tracking-wider text-slate-900">Reach Out</h4>
                        <ul className="space-y-4 text-white font-bold">
                            <li><Link href="/partners" className="hover:text-slate-900 transition">Partner with Us</Link></li>
                            <li><Link href="/careers" className="hover:text-slate-900 transition">Careers</Link></li>
                            <li><Link href="/support" className="hover:text-slate-900 transition">Support</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-lg mb-6 uppercase tracking-wider text-slate-900">Contact</h4>
                        <div className="space-y-4 text-white text-sm font-bold">
                            <p>business@earnbuddy.tech</p>
                            <p>suyash@earnbuddy.tech</p>
                            <p>+91 7390900769</p>
                        </div>
                    </div>
                </div>

                <div className="border-t-2 border-green-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-green-100 font-bold uppercase tracking-widest">
                    <p>&copy; 2025 EarnBuddy. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
                    </div>
                </div>

                <div
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-8 right-8 bg-green-500 text-slate-900 rounded-none border-2 border-slate-900 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-300 z-[9999]">
                    <ArrowRight className="w-6 h-6 -rotate-90" />
                </div>
            </div>
        </footer>
    );
}
