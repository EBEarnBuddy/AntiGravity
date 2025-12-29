"use client";

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    Menu,
    Play,
    Star,
    Users,
    Briefcase,
    Zap,
    ShieldCheck,
    Globe,
    ArrowRight,
    Mail,
    Link as LinkIconLucide,
    Camera,
    Calendar
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { Faq5 } from "@/components/ui/faq-5";
import EcosystemExplainer from "@/components/ui/ecosystem-explainer";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";
import { CreativePricing, type PricingTier } from "@/components/ui/creative-pricing";
import { SquishyOffers, BGComponent1, BGComponent2, BGComponent3 } from "@/components/ui/squishy-offers";
import { CircularGallery, type GalleryItem } from "@/components/ui/circular-gallery";
import { VideoModal } from "@/components/ui/video-modal";

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
                    // Clear the query param to essentially "clean" the URL
                    router.replace('/lander');
                } catch (error) {
                    console.error("Logout failed on lander:", error);
                }
            }
        };
        performLogout();
    }, [searchParams, logout, currentUser, router]);

    return (
        <div className="min-h-screen bg-background font-sans text-slate-900">
            <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />

            {/* Navbar - Green Background, White Text */}
            <nav className="fixed top-0 w-full z-50 bg-primary/95 backdrop-blur-md border-b border-green-600">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-3xl text-white">
                        {/* Logo Image - White Version */}
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

                    {/* Nav Links - Larger Font */}
                    <div className="hidden lg:flex items-center gap-8 text-lg font-medium text-white/90">
                        <Link href="#how-it-works" className="hover:text-white transition">How It Works</Link>
                        <Link href="#partners" className="hover:text-white transition">Partners</Link>
                        <Link href="#pricing" className="hover:text-white transition">Pricing</Link>
                        <Link href="#community" className="hover:text-white transition">Community</Link>
                        <Link href="#faq" className="hover:text-white transition">FAQ</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Login - Ghost Button */}
                        <Link href="/auth?mode=signin" className="hidden md:block bg-transparent text-white px-6 py-2.5 rounded-none border-2 border-white text-lg font-black uppercase tracking-wide hover:bg-white/10 transition-all shadow-none">
                            Log In
                        </Link>
                        {/* Get Started - White Fill, Green Text */}
                        <Link href="/auth?mode=signup" className="bg-white text-green-600 border-2 border-white px-6 py-2.5 rounded-none text-lg font-black uppercase tracking-wide hover:bg-slate-100 transition shadow-none">
                            Get Started
                        </Link>
                        <button className="lg:hidden text-white"><Menu className="w-8 h-8" /></button>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Page 2 Layout (Green, Split, Wave) */}
            <header className="bg-primary text-white pt-32 pb-0 overflow-hidden relative">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-8 pb-32 z-10">
                            <div className="inline-block bg-white/10 text-white px-4 py-1.5 rounded-none border-2 border-white text-sm font-black uppercase tracking-widest backdrop-blur-sm">
                                Early Access
                            </div>
                            <h1 className="text-6xl md:text-7xl font-black leading-none tracking-tight uppercase">
                                Launch your career with <br className="hidden md:block" /> real startup experience.
                            </h1>
                            <p className="text-2xl text-green-50 max-w-xl leading-relaxed font-bold">
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
                        </div>

                        {/* Hero Image Mockup (iMac style from Page 2) */}
                        <div className="flex-1 relative translate-x-4 md:translate-x-0 translate-y-10 md:translate-y-20">
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

                                        {/* Main Content Grid */}
                                        <div className="absolute top-14 left-16 right-0 bottom-0 p-6 overflow-hidden">
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Card 1 */}
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
                                                {/* Card 2 */}
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
                                                {/* Card 3 */}
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
                                                {/* Card 4 */}
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

                {/* Wave separator - Filled with Black */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
                    <svg className="relative block w-[calc(100%+1.3px)] h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#000000"></path>
                    </svg>
                </div>
            </header>


            {/* What EarnBuddy Offers - Black Background with Squishy Cards */}
            <section id="how-it-works" className="py-24 bg-black text-white relative overflow-hidden">
                {/* Subtle Texture */}
                <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(45deg,#333_25%,transparent_25%,transparent_75%,#333_75%,#333),linear-gradient(45deg,#333_25%,transparent_25%,transparent_75%,#333_75%,#333)] [background-size:20px_20px] [background-position:0_0,10px_10px]"></div>

                <div className="container mx-auto px-6 relative z-10 pt-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter text-white">
                            What Everybody Offers
                        </h2>
                        <p className="text-lg text-gray-300 font-bold">
                            Everything you need to build, launch, and grow.
                        </p>
                    </div>

                    {/* Squishy Offer Cards - 4 Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="group relative">
                            <SquishyOffers
                                offers={[
                                    {
                                        label: "For Founders",
                                        title: "Startups",
                                        description: "Post roles, find co-founders, and build your team",
                                        features: ["Post unlimited roles", "Find co-founders", "Private Circles"],
                                        cta: "Explore Startups",
                                        BGComponent: BGComponent1
                                    }
                                ]}
                            />
                        </div>
                        <div className="group relative">
                            <SquishyOffers
                                offers={[
                                    {
                                        label: "For Communities",
                                        title: "Circles",
                                        description: "Build communities, host events, collaborate",
                                        features: ["Create communities", "Group Chat", "Analytics"],
                                        cta: "Join Circles",
                                        BGComponent: BGComponent3
                                    }
                                ]}
                            />
                        </div>
                        <div className="group relative opacity-90">
                            {/* Overlay for Coming Soon */}
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm rounded-xl">
                                <span className="text-xl font-black text-white uppercase tracking-widest border-2 border-white px-4 py-2 bg-black">Coming Soon</span>
                            </div>
                            <SquishyOffers
                                offers={[
                                    {
                                        label: "For Freelancers",
                                        title: "Colancing",
                                        description: "Offer services, find projects, team up for gigs",
                                        features: ["Post projects", "Secure payments", "Reputation System"],
                                        cta: "Coming Soon", // Changed CTA
                                        BGComponent: BGComponent2
                                    }
                                ]}
                            />
                        </div>
                        <div className="group relative opacity-90">
                            {/* Overlay for Coming Soon */}
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm rounded-xl">
                                <span className="text-xl font-black text-white uppercase tracking-widest border-2 border-white px-4 py-2 bg-black">Coming Soon</span>
                            </div>
                            <SquishyOffers
                                offers={[
                                    {
                                        label: "For Everyone",
                                        title: "Events",
                                        description: "Discover hackathons, meetups, and workshops",
                                        features: ["Host events", "Register attendees", "Networking"],
                                        cta: "Coming Soon",
                                        BGComponent: BGComponent1 // Reusing BG1 for visual consistency
                                    }
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Verified Partners Section */}
            <section id="partners" className="py-24 bg-white relative overflow-hidden">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 z-0 opacity-20"
                    style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-12">
                        <div className="uppercase tracking-widest text-primary font-bold text-xs mb-2">Verified Partners</div>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                            Partnering with <span className="text-primary">India's Top Institutions</span>
                        </h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                            Trusted by leading entrepreneurship cells and colleges
                        </p>
                    </div>

                    {/* Circular Gallery with Logos */}
                    <div className="h-[500px] w-full">
                        <CircularGallery
                            items={[
                                { image: "/partners/esil.png", text: "ESIL" },
                                { image: "/partners/iit-bhu.png", text: "IIT BHU" },
                                { image: "/partners/iit-mandi.png", text: "IIT Mandi" },
                                { image: "/partners/iit-bhilai.png", text: "IIT Bhilai" },
                                { image: "/partners/bli.png", text: "BLI" },
                                { image: "/partners/iit-bhubaneshwar.png", text: "IIT BS" }
                            ]}
                            bend={1}
                            borderRadius={0.05} // sharper corners for logos
                            scrollEase={0.05}
                            scrollSpeed={2}
                        />
                    </div>
                </div>
            </section>

            {/* Explaining Our Ecosystem Section - Simplified */}
            <EcosystemExplainer />

            {/* Plans & Pricing Section */}
            <section id="pricing" className="py-24 bg-black relative overflow-hidden">
                <div className="container mx-auto px-6 max-w-6xl mb-16">
                    <div className="text-center">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            Plans & <span className="text-primary">Pricing</span>
                        </h2>
                    </div>
                </div>
                {/* Removed Green Rectangle Background Effect via prop if available, or just relied on black bg */}
                <CreativePricing
                    tag=""
                    title=""
                    description=""
                    tiers={[
                        {
                            name: "Free",
                            icon: <Zap className="w-6 h-6 text-primary" />,
                            price: "Free",
                            description: "For exploring and getting started",
                            color: "green",
                            features: [
                                "Unlimited applications",
                                "View all opportunities",
                                "Join Community Circles",
                                "Real-time chat"
                            ],
                            limits: [
                                "1 Startup post",
                                "Cannot create Circles"
                            ],
                            bestFor: "Individuals exploring EarnBuddy."
                        },
                        {
                            name: "Creator",
                            icon: <Star className="w-6 h-6 text-amber-500" />,
                            price: 29,
                            description: "For founders & freelancers",
                            color: "amber",
                            popular: true,
                            features: [
                                "5 active Startup posts",
                                "Create 1 Community Circle",
                                "Host small events",
                                "Basic insights"
                            ],
                            bestFor: "Solo founders and early creators."
                        },
                        {
                            name: "Builder",
                            icon: <Briefcase className="w-6 h-6 text-blue-500" />,
                            price: 79,
                            description: "For serious builders & teams",
                            color: "blue",
                            features: [
                                "Unlimited posts",
                                "Priority recommendations",
                                "Create 5 Circles",
                                "Team analytics"
                            ],
                            bestFor: "Growing startups and agencies."
                        },
                        {
                            name: "Organization",
                            icon: <Globe className="w-6 h-6 text-purple-500" />,
                            price: 199,
                            description: "For large teams & incubators",
                            color: "purple",
                            features: [
                                "Unlimited everything",
                                "Branded pages",
                                "Organization analytics",
                                "Private Circles"
                            ],
                            bestFor: "Accelerators and enterprises."
                        }
                    ]}
                />
            </section>

            {/* Stories from our Community */}
            <section id="community" className="py-24 bg-black border-t border-white/10">
                <div className="container mx-auto px-6 max-w-6xl">
                    <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center text-white">
                        Stories from our <span className="text-primary">community</span>
                    </h2>
                    <StaggerTestimonials />
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq">
                <Faq5 />
            </section>

            {/* White Separator */}
            <div className="border-t-4 border-white"></div>

            {/* Footer */}
            <footer className="bg-primary text-white py-24">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-20 mb-20">
                        <div>
                            <div className="flex items-center gap-2 font-bold text-2xl text-white mb-6">
                                {/* Logo Image - White Version */}
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
                            <p className="text-green-50 leading-relaxed mb-8 max-w-sm">
                                Where ambitious builders come together to turn ideas into reality. Build. Collaborate. Earn.
                            </p>
                            <div className="flex gap-6">
                                <Mail className="w-5 h-5 text-green-100 hover:text-white cursor-pointer transition" />
                                <LinkIconLucide className="w-5 h-5 text-green-100 hover:text-white cursor-pointer transition" />
                                <Camera className="w-5 h-5 text-green-100 hover:text-white cursor-pointer transition" />
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
                            <ul className="space-y-4 text-green-50">
                                <li><Link href="#" className="hover:text-white transition">For Students</Link></li>
                                <li><Link href="#" className="hover:text-white transition">For Startups</Link></li>
                                <li><Link href="#" className="hover:text-white transition">For Freelancers</Link></li>
                                <li><Link href="#" className="hover:text-white transition">Communities</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-6">Contact</h4>
                            <div className="space-y-4 text-green-50 text-sm">
                                <p>business@earnbuddy.tech</p>
                                <p>suyash@earnbuddy.tech</p>
                                <p>+91 7390900769</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-green-500/30 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-green-100">
                        <p>&copy; 2025 EarnBuddy. All rights reserved.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <Link href="#" className="hover:text-white">Privacy Policy</Link>
                            <Link href="#" className="hover:text-white">Terms of Service</Link>
                        </div>
                    </div>

                    {/* Scroll to Top - White Accent */}
                    <div
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="fixed bottom-8 right-8 bg-white text-slate-900 rounded-none border-2 border-slate-900 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-300 z-[9999]">
                        <ArrowRight className="w-6 h-6 -rotate-90" />
                    </div>
                </div>
            </footer >
        </div >
    );
}

export default function Lander() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <LanderContent />
        </Suspense>
    );
}
