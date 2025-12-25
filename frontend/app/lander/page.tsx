"use client";

import { useEffect, Suspense } from 'react';
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
    Camera
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { Faq5 } from "@/components/ui/faq-5";
import EcosystemExplainer from "@/components/ui/ecosystem-explainer";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";
import { CreativePricing, type PricingTier } from "@/components/ui/creative-pricing";
import { SquishyOffers, BGComponent1, BGComponent2, BGComponent3 } from "@/components/ui/squishy-offers";
import { CircularGallery, type GalleryItem } from "@/components/ui/circular-gallery";

function LanderContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { logout, currentUser } = useAuth();

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

    const testimonials = [
        {
            id: 1,
            name: "Jay Agarwal",
            role: "Student and Founder",
            avatar: "/testimonies/Jay.png", // Corrected path to absolute from public root
            content: "As a founder, I'm excited by EarnBuddy's vision for building the right team and would love early access.",
            rating: 5,
            company: "Ganges"
        },
        {
            id: 2,
            name: "Mrinal",
            role: "Student and Freelancer",
            avatar: "/testimonies/mrinal.png",
            content: "As a freelancer and hackathon enthusiast, I'm genuinely wish to transform my solo project struggles into powerful teamwork.",
            rating: 5,
            company: "Independent"
        },
        {
            id: 3,
            name: "Elvis Osano",
            role: "Freelancer and Founder",
            avatar: "/testimonies/elvis.jpg",
            content: "As a freelancer, I'm genuinely excited about EarnBuddy's potential to connect me with like-minded builders and mentors who truly care about shared projects.",
            rating: 5,
            company: "Upshift Ecommerce"
        },
        {
            id: 4,
            name: "Aditi Bansal",
            role: "Student and Full-stack Developer",
            avatar: "/testimonies/aditi.jpg",
            content: "EarnBuddy solved a problem I faced, and I'm genuinely excited to be a part of the journey as we build it together.",
            rating: 5,
            company: "EarnBuddy"
        }
    ];

    return (
        <div className="min-h-screen bg-background font-sans text-slate-900">
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
                        <Link href="/auth" className="hidden md:block bg-transparent text-white px-6 py-2.5 rounded-none border-2 border-white text-lg font-black uppercase tracking-wide hover:bg-white/10 transition-all shadow-none">
                            Log In
                        </Link>
                        {/* Get Started - White Fill, Green Text */}
                        <Link href="/auth" className="bg-white text-green-600 border-2 border-white px-6 py-2.5 rounded-none text-lg font-black uppercase tracking-wide hover:bg-slate-100 transition shadow-none">
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
                                <Link href="/auth" className="bg-white text-slate-900 px-8 py-4 rounded-none border-2 border-slate-900 text-xl font-black uppercase tracking-wide shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition flex items-center gap-2">
                                    Find a Team
                                </Link>
                                <button className="px-6 py-4 rounded-none border-2 border-white text-xl font-black uppercase tracking-wide text-white hover:bg-white/10 transition flex items-center gap-2 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                                    <Play className="w-6 h-6 fill-current" /> Watch Video
                                </button>
                            </div>
                        </div>

                        {/* Hero Image Mockup (iMac style from Page 2) */}
                        <div className="flex-1 relative translate-x-4 md:translate-x-0 translate-y-10 md:translate-y-20">
                            <div className="relative z-10">
                                <div className="bg-white rounded-none shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden border-4 border-slate-900">
                                    <div className="bg-gray-100 h-8 flex items-center px-4 gap-2 border-b">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                        </div>
                                        <div className="bg-white text-[10px] text-gray-400 px-2 py-0.5 rounded flex-1 text-center mx-4">earnbuddy.tech</div>
                                    </div>
                                    {/* Content Simulation */}
                                    <div className="bg-white p-1 h-64 lg:h-80 relative overflow-hidden">
                                        <div className="grid grid-cols-12 gap-2 p-4 h-full">
                                            <div className="col-span-3 bg-slate-100 rounded h-full"></div>
                                            <div className="col-span-9 space-y-2">
                                                <div className="h-32 bg-slate-50 rounded w-full"></div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="h-24 bg-slate-50 rounded"></div>
                                                    <div className="h-24 bg-slate-50 rounded"></div>
                                                    <div className="h-24 bg-slate-50 rounded"></div>
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

                {/* Wave separator - Filled with Black to transition to What EarnBuddy Offers Section */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
                    <svg className="relative block w-[calc(100%+1.3px)] h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        {/* Changed fill to #000000 (Pure Black) */}
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#000000"></path>
                    </svg>
                </div>
            </header>


            {/* What EarnBuddy Offers - Black Background with Squishy Cards */}
            <section id="how-it-works" className="py-24 bg-black text-white relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10 pt-10">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter text-white">
                            What EarnBuddy Offers
                        </h2>
                        <p className="text-lg text-gray-300 font-bold">
                            Three powerful ways to connect, collaborate, and grow
                        </p>
                    </div>

                    {/* Squishy Offer Cards */}
                    <SquishyOffers
                        offers={[
                            {
                                label: "For Founders",
                                title: "Startups",
                                description: "Post roles, find co-founders, and build your team",
                                features: [
                                    "Post unlimited startup roles",
                                    "Find technical & non-technical co-founders",
                                    "Create private Opportunity Circles",
                                    "Real-time collaboration tools",
                                    "Applicant matching & insights"
                                ],
                                cta: "Explore Startups",
                                BGComponent: BGComponent1
                            },
                            {
                                label: "For Freelancers",
                                title: "Colancing",
                                description: "Offer services, find projects, get paid",
                                features: [
                                    "Post freelance projects",
                                    "Browse skilled professionals",
                                    "Secure payment processing",
                                    "Project-based Circles",
                                    "Portfolio & reputation system"
                                ],
                                cta: "Start Colancing",
                                BGComponent: BGComponent2
                            },
                            {
                                label: "For Communities",
                                title: "Circles",
                                description: "Build communities, host events, collaborate",
                                features: [
                                    "Create public/private communities",
                                    "Host virtual & in-person events",
                                    "Cross-community collaborations",
                                    "Discussion forums & chat",
                                    "Community analytics"
                                ],
                                cta: "Join Circles",
                                BGComponent: BGComponent3
                            }
                        ]}
                    />
                </div>
            </section>

            {/* Verified Partners Section */}
            <section className="py-24 bg-white relative overflow-hidden">
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
                            Trusted by leading entrepreneurship cells across India's premier institutions
                        </p>
                    </div>

                    {/* Circular Gallery with IIT Logos */}
                    <div className="h-[600px] w-full">
                        <CircularGallery
                            items={[
                                { image: "/partners/iit-bhu.png", text: "IIT BHU" },
                                { image: "/partners/iit-mandi.png", text: "IIT Mandi" },
                                { image: "/partners/iit-bhilai.png", text: "IIT Bhilai" },
                                { image: "/partners/iit-bhubaneshwar.png", text: "IIT Bhubaneshwar" }
                            ]}
                            bend={3}
                            borderRadius={0.5}
                            scrollEase={0.05}
                            scrollSpeed={2}
                        />
                    </div>
                </div>
            </section>

            {/* Explaining Our Ecosystem Section */}
            <EcosystemExplainer />

            {/* Plans & Pricing Section */}
            <section className="py-24 bg-black relative overflow-hidden">
                <div className="container mx-auto px-6 max-w-6xl mb-16">
                    <div className="text-center">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            Plans & <span className="text-primary">Pricing</span>
                        </h2>
                    </div>
                </div>
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
                                "Unlimited applications to Startups, Colancing projects, and Circles",
                                "View all public opportunities",
                                "Join Community Circles (approval required)",
                                "Participate in Opportunity Circles if accepted",
                                "Real-time chat and collaboration inside circles"
                            ],
                            limits: [
                                "1 Startup post",
                                "3 Colancing posts (lifetime)",
                                "Cannot create Circles"
                            ],
                            bestFor: "Individuals exploring EarnBuddy and joining collaborations."
                        },
                        {
                            name: "Creator",
                            icon: <Star className="w-6 h-6 text-amber-500" />,
                            price: 29,
                            description: "For founders & freelancers who want to create",
                            color: "amber",
                            popular: true,
                            features: [
                                "Everything in Free, plus:",
                                "Up to 5 active Startup posts",
                                "Up to 10 active Colancing projects",
                                "Create 1 Community Circle",
                                "Request collaborations with other Circles",
                                "Host small events (up to 50 participants)",
                                "1 featured opportunity per week",
                                "Basic applicant insights (skill match score)"
                            ],
                            bestFor: "Solo founders, freelancers, and early creators."
                        },
                        {
                            name: "Builder",
                            icon: <Briefcase className="w-6 h-6 text-blue-500" />,
                            price: 79,
                            description: "For serious builders, teams, and agencies",
                            color: "blue",
                            features: [
                                "Everything in Creator, plus:",
                                "Unlimited Startup & Colancing posts",
                                "Priority applicant recommendations",
                                "Advanced applicant insights (portfolio, history, match %, badges)",
                                "Create up to 5 Community Circles",
                                "Initiate Circle collaborations",
                                "Host large community events",
                                "Custom roles inside Opportunity Circles",
                                "Team analytics dashboard"
                            ],
                            bestFor: "Growing startups, agencies, and active community leaders."
                        },
                        {
                            name: "Organization",
                            icon: <Globe className="w-6 h-6 text-purple-500" />,
                            price: 199,
                            description: "For large teams, incubators, and institutions",
                            color: "purple",
                            features: [
                                "Everything in Builder, plus:",
                                "Unlimited posts and Circles",
                                "Branded opportunities and events",
                                "Recruiter & admin access for teams",
                                "Multi-circle events (500+ participants)",
                                "Workflow automation (auto‑shortlisting)",
                                "Organization-wide analytics",
                                "Internal/private Circles",
                                "Talent pools",
                                "Dedicated support & early feature access"
                            ],
                            bestFor: "Accelerators, incubators, enterprises, universities."
                        }
                    ]}
                />
            </section>

            {/* Stories from our Community - Stagger Testimonials */}
            <section className="py-24 bg-black">
                <div className="container mx-auto px-6 max-w-6xl">
                    <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center text-white">
                        Stories from our <span className="text-primary">community</span>
                    </h2>
                    <StaggerTestimonials />
                </div>
            </section>

            {/* FAQ Section */}
            <Faq5 />

            {/* White Separator */}
            <div className="border-t-4 border-white"></div>

            {/* Footer - Green Background, White Text, Increased Spacing */}
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
                                <li><a href="#" className="hover:text-white transition">For Students</a></li>
                                <li><a href="#" className="hover:text-white transition">For Startups</a></li>
                                <li><a href="#" className="hover:text-white transition">For Freelancers</a></li>
                                <li><a href="#" className="hover:text-white transition">Communities</a></li>
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
                            <a href="#" className="hover:text-white">Privacy Policy</a>
                            <a href="#" className="hover:text-white">Terms of Service</a>
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
