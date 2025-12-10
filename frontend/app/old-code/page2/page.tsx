
import { BarChart3, Layout, Heart, Share2, Facebook, Instagram, Twitter, Check } from "lucide-react";
import Image from "next/image";

export default function Page2() {
    return (
        <div className="min-h-screen bg-background font-sans text-slate-900">
            {/* Hero Section */}
            <header className="bg-primary text-white pt-6 pb-0 md:pt-10 overflow-hidden relative">
                <div className="container mx-auto px-6 max-w-7xl">
                    {/* Nav */}
                    <nav className="flex items-center justify-between mb-16 md:mb-24">
                        <div className="flex items-center gap-2 font-bold text-xl">
                            <div className="bg-white/20 p-1.5 rounded text-white"><Layout className="w-5 h-5" /></div>
                            Iconosquare
                        </div>

                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
                            <a href="#" className="hover:text-white transition">Features</a>
                            <a href="#" className="hover:text-white transition">Pricing</a>
                            <a href="#" className="hover:text-white transition">Resources</a>
                            <a href="#" className="hover:text-white transition">Blog</a>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="text-sm font-medium hover:text-white/80">Log In</button>
                            <button className="bg-white/20 hover:bg-white/30 text-white text-sm font-bold px-4 py-2 rounded transition">
                                Sign up
                            </button>
                        </div>
                    </nav>

                    {/* Hero Content */}
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6 pb-20 z-10">
                            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                                Instagram feed tab <br /> for Facebook pages.
                            </h1>
                            <p className="text-lg text-green-100 max-w-lg leading-relaxed">
                                Feature your Instagram content on your Facebook page. Standalone application. Free plan available.
                            </p>
                            <button className="bg-white text-primary px-6 py-3 rounded font-bold shadow-lg hover:shadow-xl hover:bg-green-50 transition flex items-center gap-2">
                                <Facebook className="w-4 h-4" /> Install on my Facebook Page
                            </button>
                        </div>

                        {/* Hero Image Mockup (iMac style) */}
                        <div className="flex-1 relative translate-x-4 md:translate-x-0 translate-y-10 md:translate-y-20">
                            <div className="relative z-10">
                                <div className="bg-white rounded-t-xl shadow-2xl overflow-hidden border-4 border-b-0 border-gray-200">
                                    {/* Fake Browser Header */}
                                    <div className="bg-gray-100 h-8 flex items-center px-4 gap-2 border-b">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                        </div>
                                        <div className="bg-white text-[10px] text-gray-400 px-2 py-0.5 rounded flex-1 text-center mx-4">facebook.com/my-page</div>
                                    </div>
                                    {/* Content Simulation */}
                                    <div className="bg-white p-1">
                                        {/* Facebook Banner Sim */}
                                        <div className="bg-slate-200 h-32 w-full relative">
                                            <div className="absolute -bottom-8 left-8 w-24 h-24 bg-white p-1 rounded-full border border-gray-200">
                                                <div className="w-full h-full bg-gray-300 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="pl-36 pt-2 pb-4 border-b border-gray-100">
                                            <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
                                            <div className="h-3 w-24 bg-gray-100 rounded"></div>
                                        </div>
                                        {/* Grid of images */}
                                        <div className="p-6 grid grid-cols-4 gap-2">
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                                <div key={i} className="aspect-square bg-gray-100 hover:bg-green-50 transition rounded-sm relative group overflow-hidden">
                                                    {/* Overlay on hover */}
                                                    {i === 2 && (
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white gap-2">
                                                            <Heart className="w-4 h-4 fill-white" /> 124
                                                        </div>
                                                    )}
                                                    <div className="w-full h-full bg-gradient-to-tr from-gray-200 to-gray-100"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Stand base simulation */}
                                <div className="mx-auto w-32 h-12 bg-gradient-to-b from-gray-300 to-gray-200" style={{ clipPath: "polygon(10% 0, 90% 0, 100% 100%, 0% 100%)" }}></div>
                                <div className="mx-auto w-48 h-2 bg-gray-300 rounded-full shadow-lg"></div>
                            </div>

                            {/* Background Circle Decoration */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/5 rounded-full blur-3xl -z-0"></div>
                        </div>
                    </div>
                </div>

                {/* Wave separator */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
                    <svg className="relative block w-[calc(100%+1.3px)] h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-background"></path>
                    </svg>
                </div>
            </header>

            {/* Feature 1: Feature your best content */}
            <section className="py-24 container mx-auto px-6 max-w-6xl">
                <div className="flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 relative order-2 md:order-1">
                        {/* Illustration of content selection */}
                        <div className="relative bg-white p-6 rounded-xl shadow-xl border border-gray-100">
                            <div className="flex items-center gap-4 mb-6 border-b pb-4">
                                <div className="w-10 h-10 rounded bg-green-100 flex items-center justify-center text-primary"><Instagram className="w-5 h-5" /></div>
                                <div>
                                    <div className="font-bold text-sm">Instagram Feed</div>
                                    <div className="text-xs text-gray-500">@username</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className={`aspect-square rounded overflow-hidden relative ${i === 4 ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                                        <div className="w-full h-full bg-gray-200"></div>
                                        {i === 4 && (
                                            <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="absolute -right-6 -bottom-6 bg-[#E1306C] text-white p-3 rounded-lg shadow-lg">
                                <Instagram className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 order-1 md:order-2 space-y-6">
                        <div className="uppercase tracking-widest text-primary font-bold text-xs">Feeds</div>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Feature your best <br /> content on Facebook</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Show your own photo feed and/or any hashtag feed of your choice.
                            <br /><br />
                            Define the order of your feeds so that your most important content is displayed first on your Page Tab.
                        </p>
                        <div>
                            <h4 className="font-bold text-primary text-sm mb-1">Premium Plan</h4>
                            <p className="text-sm text-gray-500">Display up to 5 hashtag feeds at the same time.</p>
                        </div>
                        <button className="bg-primary text-white px-6 py-3 rounded font-bold shadow-md hover:bg-green-600 transition mt-2">
                            Install on my Facebook Page
                        </button>
                    </div>
                </div>
            </section>

            {/* Feature 2: Customization */}
            <section className="py-24 bg-white relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-green-50/50 skew-x-[-12deg] translate-x-20 z-0"></div>

                <div className="container mx-auto px-6 max-w-6xl relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-6">
                            <div className="uppercase tracking-widest text-primary font-bold text-xs">Customization</div>
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Create the perfect <br /> Tab</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Three great layouts to choose from (gallery, slideshow, mixed). Select the most appropriate layout for each one of your feeds.
                                <br /><br />
                                Match your brand image with a full color customization (background, fonts, links) and a cover visual.
                            </p>
                            <button className="bg-primary text-white px-6 py-3 rounded font-bold shadow-md hover:bg-green-600 transition">
                                View Demo
                            </button>
                        </div>

                        <div className="flex-1">
                            {/* Customization UI Mockup */}
                            <div className="bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden">
                                <div className="bg-slate-50 border-b p-4 flex gap-4">
                                    <div className="flex-1 bg-white border h-8 rounded px-2 flex items-center text-xs text-gray-400">BG Color #FFFFFF</div>
                                    <div className="flex-1 bg-white border h-8 rounded px-2 flex items-center text-xs text-gray-400">Text #000000</div>
                                </div>
                                <div className="p-1">
                                    <div className="h-48 bg-gradient-to-r from-orange-100 to-green-100 relative">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="bg-white/50 backdrop-blur px-4 py-2 rounded text-xs font-bold uppercase tracking-widest">Cover Image</span>
                                        </div>
                                    </div>
                                    <div className="p-4 grid grid-cols-2 gap-4">
                                        <div className="h-24 bg-gray-100 rounded"></div>
                                        <div className="h-24 bg-gray-100 rounded"></div>
                                        <div className="h-24 bg-gray-100 rounded"></div>
                                        <div className="h-24 bg-gray-100 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 3: Analytics */}
            <section className="py-24 container mx-auto px-6 max-w-6xl">
                <div className="flex flex-col md:flex-row items-center gap-20">
                    <div className="flex-1 order-2 md:order-1">
                        {/* Chart Mockup */}
                        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 relative">
                            <div className="flex justify-between items-center mb-6">
                                <div className="font-bold text-gray-800">Pageviews</div>
                                <div className="flex gap-2 text-xs font-medium text-gray-400">
                                    <span className="text-primary bg-green-50 px-2 py-1 rounded">Daily</span>
                                    <span className="px-2 py-1">Weekly</span>
                                    <span className="px-2 py-1">Monthly</span>
                                </div>
                            </div>

                            <div className="h-48 flex items-end gap-2">
                                {[40, 60, 45, 70, 65, 80, 50, 60, 75, 90, 85, 95].map((h, i) => (
                                    <div key={i} className="flex-1 bg-green-50 hover:bg-green-100 transition rounded-t group relative">
                                        <div className="absolute bottom-0 w-full bg-primary rounded-t transition-all duration-500" style={{ height: `${h}%` }}></div>
                                        {/* Tooltip */}
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded">
                                            {h * 124}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 order-1 md:order-2 space-y-6">
                        <div className="uppercase tracking-widest text-primary font-bold text-xs">Analytics</div>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Strengthen your <br /> Instagram strategy</h2>
                        <div className="space-y-4 pt-2">
                            {[
                                "Analyze traffic and engagement",
                                "Distinguish activity from fans and others",
                                "View Tab level or Feed level data for time periods",
                                "Measure hashtag performance"
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="mt-1 w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600">{item}</p>
                                </div>
                            ))}
                        </div>
                        <button className="bg-primary text-white px-6 py-3 rounded font-bold shadow-md hover:bg-green-600 transition mt-4">
                            Install on my Facebook Page
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-20">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                        <div className="space-y-6 max-w-sm">
                            <div className="flex items-center gap-2 font-bold text-xl">
                                <div className="bg-white/20 p-1.5 rounded text-white"><Layout className="w-5 h-5" /></div>
                                Iconosquare
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Leading social media management platform favored by 25,000+ businesses and agencies worldwide.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-sm text-gray-400">
                            <div className="space-y-4">
                                <h4 className="text-white font-bold">Product</h4>
                                <ul className="space-y-2">
                                    <li><a href="#" className="hover:text-primary">Features</a></li>
                                    <li><a href="#" className="hover:text-primary">Pricing</a></li>
                                    <li><a href="#" className="hover:text-primary">API</a></li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-white font-bold">Resources</h4>
                                <ul className="space-y-2">
                                    <li><a href="#" className="hover:text-primary">Blog</a></li>
                                    <li><a href="#" className="hover:text-primary">Help Center</a></li>
                                    <li><a href="#" className="hover:text-primary">Case Studies</a></li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-white font-bold">Company</h4>
                                <ul className="space-y-2">
                                    <li><a href="#" className="hover:text-primary">About</a></li>
                                    <li><a href="#" className="hover:text-primary">Careers</a></li>
                                    <li><a href="#" className="hover:text-primary">Legal</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                        <p>&copy; 2024 Iconosquare. All rights reserved.</p>
                        <div className="flex gap-4 mt-4 md:mt-0">
                            <Facebook className="w-5 h-5 hover:text-white cursor-pointer" />
                            <Instagram className="w-5 h-5 hover:text-white cursor-pointer" />
                            <Twitter className="w-5 h-5 hover:text-white cursor-pointer" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
