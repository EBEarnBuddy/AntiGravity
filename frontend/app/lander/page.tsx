
import { Check, ChevronDown, ChevronRight, Layout, Menu, Play, Star, Users, Briefcase, Zap, Shield, Globe, ArrowRight, Instagram, Linkedin, Mail, Facebook } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Faq5 } from "@/components/ui/faq-5";

export default function Lander() {
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
                    <div className="flex items-center gap-2 font-bold text-2xl text-white">
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

                    {/* Nav Links - Smaller Font (text-[15px]) */}
                    <div className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-white/90">
                        <Link href="#" className="hover:text-white transition">How It Works</Link>
                        <Link href="#" className="hover:text-white transition">Students</Link>
                        <Link href="#" className="hover:text-white transition">Startups</Link>
                        <Link href="#" className="hover:text-white transition">Freelancers</Link>
                        <Link href="#" className="hover:text-white transition">Communities</Link>
                        <Link href="#" className="hover:text-white transition">FAQ</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Login - Rounded Buttons */}
                        <Link href="/auth" className="hidden md:block bg-white text-primary px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-green-50 transition transform hover:-translate-y-0.5">
                            Log In
                        </Link>
                        {/* Get Started - Rounded Buttons */}
                        <Link href="/auth" className="bg-transparent border border-white text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-white/10 transition transform hover:-translate-y-0.5">
                            Get Started
                        </Link>
                        <button className="lg:hidden text-white"><Menu /></button>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Page 2 Layout (Green, Split, Wave) */}
            <header className="bg-primary text-white pt-32 pb-0 overflow-hidden relative">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-8 pb-32 z-10">
                            <div className="inline-block bg-white/10 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                                Early Access
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                                Launch your career with <br className="hidden md:block" /> real startup experience.
                            </h1>
                            <p className="text-lg text-green-50 max-w-lg leading-relaxed">
                                Join a community of builders. Get trained by technical founders, work on real products, and get hired by top startups.
                            </p>
                            <div className="flex items-center gap-4">
                                <Link href="/auth" className="bg-white text-primary px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-green-50 transition flex items-center gap-2">
                                    Find a Team
                                </Link>
                                <button className="px-6 py-4 rounded-xl font-bold text-white hover:bg-white/10 transition flex items-center gap-2">
                                    <Play className="w-5 h-5 fill-current" /> Watch Video
                                </button>
                            </div>
                        </div>

                        {/* Hero Image Mockup (iMac style from Page 2) */}
                        <div className="flex-1 relative translate-x-4 md:translate-x-0 translate-y-10 md:translate-y-20">
                            <div className="relative z-10">
                                <div className="bg-white rounded-t-xl shadow-2xl overflow-hidden border-4 border-b-0 border-gray-200">
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

                {/* Wave separator - Filled with Slate 900 to transition to Dark Section */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
                    <svg className="relative block w-[calc(100%+1.3px)] h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        {/* Changed fill to #0f172a (Slate 900) */}
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#0f172a"></path>
                    </svg>
                </div>
            </header>


            {/* Your Journey (Student Journey) - Dark Theme - Connected via Wave */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10 pt-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                                Your journey
                            </span> from builder to founder
                        </h2>
                        <p className="text-slate-400 text-lg">Four simple steps to transform your skills into meaningful opportunities and partnerships.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Step 01 */}
                        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-green-500/50 transition duration-500 group">
                            <div className="text-6xl font-black text-slate-800 mb-6 group-hover:text-green-500/20 transition-colors">01</div>
                            <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-green-400 transition-colors">Create Your Profile</h3>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                Less profile setup, more time building connections. Showcase your skills, experience, and project portfolio.
                            </p>
                            {/* Mini Mockup */}
                            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 opacity-80 group-hover:opacity-100 transition">
                                <div className="flex items-center gap-3 mb-3 border-b border-slate-800 pb-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-700"></div>
                                    <div className="h-2 w-20 bg-slate-700 rounded"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 w-full bg-slate-800 rounded"></div>
                                    <div className="h-2 w-2/3 bg-slate-800 rounded"></div>
                                </div>
                            </div>
                        </div>

                        {/* Step 02 */}
                        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-green-500/50 transition duration-500 group">
                            <div className="text-6xl font-black text-slate-800 mb-6 group-hover:text-green-500/20 transition-colors">02</div>
                            <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-green-400 transition-colors">Discover Opportunities</h3>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                Find your perfect match in the builder ecosystem. Startup listings, gigs, and community pods.
                            </p>
                            {/* Mini Mockup */}
                            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 opacity-80 group-hover:opacity-100 transition">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-slate-800 p-2 rounded">
                                        <div className="h-2 w-16 bg-slate-700 rounded"></div>
                                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-800 p-2 rounded">
                                        <div className="h-2 w-20 bg-slate-700 rounded"></div>
                                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-800 p-2 rounded">
                                        <div className="h-2 w-12 bg-slate-700 rounded"></div>
                                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-white relative">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Whatever is <span className="text-primary">holding you back</span></h2>
                        <p className="text-lg text-slate-500">We provide the ecosystem you need to break through barriers.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "No Real Experience", icon: Briefcase, desc: "Stop building to-do apps. Build real products used by real people." },
                            { title: "Imposter Syndrome", icon: Zap, desc: "Gain confidence by shipping code and solving hard problems alongside peers." },
                            { title: "Hard to Get Hired", icon: Users, desc: "Build a portfolio that speaks for itself and get warm intros to founders." }
                        ].map((item, i) => (
                            <div key={i} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-green-200 hover:bg-white hover:shadow-xl hover:shadow-green-50 transition duration-300 group">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition border border-slate-100">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">{item.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partners Section */}
            <section className="py-24 bg-green-50/50 relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-30"
                    style={{ backgroundImage: 'radial-gradient(#2f9e44 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                </div>

                <div className="container mx-auto px-6 max-w-5xl relative z-10">
                    <div className="text-center mb-16">
                        <div className="uppercase tracking-widest text-primary font-bold text-xs mb-2">Verified Partners</div>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900">
                            Partnering with <span className="text-primary">India's Top Institutions</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 text-center shadow-xl shadow-green-100/50 border border-white hover:border-green-200 transition duration-500 hover:scale-[1.02] group">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl mx-auto mb-6 flex items-center justify-center text-primary font-bold text-3xl group-hover:rotate-6 transition duration-500 shadow-inner">
                                <span className="text-xs font-black tracking-tighter">E-CELL</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-slate-900">E-Cell IIT-BHU</h3>
                            <p className="text-slate-500 mb-8">Official partnership for student opportunities and innovation.</p>
                            <div className="inline-flex items-center gap-2 bg-green-100/50 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-green-200">
                                <Check className="w-3 h-3" /> Verified Partner
                            </div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 text-center shadow-xl shadow-green-100/50 border border-white hover:border-green-200 transition duration-500 hover:scale-[1.02] group">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl mx-auto mb-6 flex items-center justify-center text-primary font-bold text-3xl group-hover:-rotate-6 transition duration-500 shadow-inner">
                                <span className="text-xs font-black tracking-tighter">E-CELL</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-slate-900">E-Cell IIT-Mandi</h3>
                            <p className="text-slate-500 mb-8">Official partnership for student opportunities and innovation.</p>
                            <div className="inline-flex items-center gap-2 bg-green-100/50 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-green-200">
                                <Check className="w-3 h-3" /> Verified Partner
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ecosystem Section */}
            <section className="py-24 overflow-hidden relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-green-100 rounded-full blur-[120px] -z-10"></div>
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8">
                        <div className="uppercase tracking-widest text-primary font-bold text-xs">Ecosystem</div>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900">
                            Build your startup with <span className="text-primary">world-class talent.</span>
                        </h2>
                        <div className="space-y-6">
                            {[
                                { label: "Technical Founders", desc: "CTOs and Lead Devs ready to build." },
                                { label: "Growth Marketers", desc: "Experts in acquisition and retention." },
                                { label: "Product Designers", desc: "UI/UX pros who understand users." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-lg hover:shadow-green-50 transition border border-transparent hover:border-green-50 cursor-default">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-primary shrink-0">
                                        <Check className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{item.label}</h4>
                                        <p className="text-sm text-slate-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4 mt-8">
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 mb-4"></div>
                                    <div className="font-bold text-sm">Full-Stack Dev</div>
                                    <div className="text-xs text-slate-400">React, Node, Postgres</div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 mb-4"></div>
                                    <div className="font-bold text-sm">UX Designer</div>
                                    <div className="text-xs text-slate-400">Figma, Prototyping</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <Faq5 />

            {/* Institutional Testimonials */}
            <section className="py-24 bg-white border-t border-slate-100">
                <div className="container mx-auto px-6 max-w-6xl">
                    <h2 className="text-3xl font-bold mb-16 text-center">What our <span className="text-primary">institutional partners</span> say</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-slate-50 p-10 rounded-3xl relative">
                            <div className="absolute top-8 right-8 text-green-200">
                                <Star className="w-8 h-8 fill-current" />
                            </div>
                            <p className="text-slate-700 italic leading-relaxed mb-8 relative z-10">
                                "EarnBuddy is the kind of platform every startup ecosystem needs today. It connects ambitious campus talent with budding startups..."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-200 rounded-full bg-[url('https://i.pravatar.cc/100?img=11')] bg-cover"></div>
                                <div>
                                    <div className="font-bold text-slate-900">Gourav Pandey</div>
                                    <div className="text-xs text-primary font-bold uppercase">Startup Assistance Head, E-Cell IIT BHU</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-10 rounded-3xl relative">
                            <div className="absolute top-8 right-8 text-green-200">
                                <Star className="w-8 h-8 fill-current" />
                            </div>
                            <p className="text-slate-700 italic leading-relaxed mb-8 relative z-10">
                                "EarnBuddy has been instrumental in strengthening the founder-developer ecosystem. By connecting builders, founders, and innovators..."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-200 rounded-full bg-[url('https://i.pravatar.cc/100?img=33')] bg-cover"></div>
                                <div>
                                    <div className="font-bold text-slate-900">Oppilan Iniyan</div>
                                    <div className="text-xs text-primary font-bold uppercase">Startup Assistance Head, E-Cell IIT BHU</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Community Testimonials Section */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-6 max-w-6xl">
                    <h2 className="text-3xl font-bold mb-16 text-center">Stories from our <span className="text-primary">community</span></h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {testimonials.map((t) => (
                            <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border border-slate-100 flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-100">
                                        <Image
                                            src={t.avatar}
                                            alt={t.name}
                                            width={48}
                                            height={48}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                                        <span className="text-xs text-primary font-semibold block">{t.company}</span>
                                    </div>
                                </div>
                                <div className="mb-4 flex">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-grow italic">
                                    "{t.content}"
                                </p>
                                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-auto pt-4 border-t border-slate-50">
                                    {t.role}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer - Green Background, White Text, Increased Spacing */}
            <footer className="bg-primary text-white py-24 border-t border-green-600">
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
                                <Linkedin className="w-5 h-5 text-green-100 hover:text-white cursor-pointer transition" />
                                <Instagram className="w-5 h-5 text-green-100 hover:text-white cursor-pointer transition" />
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
                    <div className="fixed bottom-8 right-8 bg-white/90 backdrop-blur text-primary rounded-full p-3 shadow-lg cursor-pointer hover:scale-110 transition animate-bounce">
                        <ArrowRight className="w-6 h-6 -rotate-90" />
                    </div>
                </div>
            </footer>
        </div>
    );
}
