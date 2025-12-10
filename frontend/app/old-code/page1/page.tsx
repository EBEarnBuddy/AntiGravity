
import { CheckCircle, Shield, CreditCard, ArrowRight, Play, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Page1() {
    return (
        <div className="min-h-screen bg-background font-sans text-slate-800">
            {/* Navbar */}
            <nav className="absolute top-0 w-full z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto left-0 right-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold">
                        P
                    </div>
                    <span className="text-white font-bold text-xl">PayEase</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-white/90 text-sm font-medium">
                    <Link href="#" className="hover:text-white">Product</Link>
                    <Link href="#" className="hover:text-white">Services</Link>
                    <Link href="#" className="hover:text-white">Pricing</Link>
                    <Link href="#" className="hover:text-white">Blog</Link>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <button className="text-white font-medium hover:text-white/80">Login</button>
                    <button className="bg-white text-primary px-5 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5">
                        Sign Up
                    </button>
                </div>
                <button className="md:hidden text-white"><Menu /></button>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 skew-y-[-3deg] origin-top-left scale-[1.2] -translate-y-20 z-0"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay"></div>

                <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
                    {/* Text Content */}
                    <div className="flex-1 text-center md:text-left space-y-6">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-sm">
                            Get more protection for your payments on all platforms.
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 max-w-lg mx-auto md:mx-0 leading-relaxed">
                            Secure, fast, and reliable payment processing for your business. Accept payments anywhere, anytime with zero hassle.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center md:justify-start">
                            <button className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white rounded-md font-bold shadow-[0_10px_20px_rgba(47,158,68,0.3)] hover:shadow-lg hover:bg-green-700 transition">
                                Get Started Now
                            </button>
                            <button className="w-full sm:w-auto px-8 py-3.5 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-md font-bold hover:bg-white/30 transition flex items-center justify-center gap-2">
                                <Play className="w-4 h-4 fill-current" /> Watch Video
                            </button>
                        </div>
                    </div>

                    {/* Hero Image / Mockup */}
                    <div className="flex-1 relative">
                        <div className="relative z-10 rounded-xl shadow-2xl bg-white p-2 md:p-4 transform rotate-[-2deg] hover:rotate-0 transition duration-500">
                            {/* Simulated Laptop Browser */}
                            <div className="bg-slate-900 rounded-t-lg h-6 flex items-center px-2 gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                            </div>
                            <div className="bg-slate-100 h-[250px] md:h-[350px] rounded-b-lg overflow-hidden flex relative">
                                {/* Sidebar */}
                                <div className="w-16 bg-white border-r border-slate-200 hidden sm:flex flex-col items-center py-4 gap-4">
                                    <div className="w-8 h-8 bg-green-100 rounded-full mb-4"></div>
                                    <div className="w-6 h-6 bg-slate-100 rounded"></div>
                                    <div className="w-6 h-6 bg-slate-100 rounded"></div>
                                    <div className="w-6 h-6 bg-slate-100 rounded"></div>
                                </div>
                                {/* Main Dashboard Area */}
                                <div className="flex-1 p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
                                            <div className="h-6 w-32 bg-slate-300 rounded"></div>
                                        </div>
                                        <div className="h-8 w-8 bg-green-100 rounded-full"></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-primary p-4 rounded-lg text-white">
                                            <div className="text-xs opacity-70">Balance</div>
                                            <div className="text-xl font-bold">$12,450.00</div>
                                        </div>
                                        <div className="bg-white border border-slate-200 p-4 rounded-lg">
                                            <div className="text-xs text-slate-500">Income</div>
                                            <div className="text-xl font-bold text-slate-800">$8,210</div>
                                        </div>
                                    </div>

                                    <div className="h-24 bg-slate-50 rounded-lg border border-slate-200 border-dashed flex items-center justify-center text-slate-400 text-sm">
                                        Chart Graphic Placeholder
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <div className="absolute -top-6 -right-6 bg-white p-3 rounded-xl shadow-lg animate-bounce delay-100">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-primary font-bold">$</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-8 -left-4 bg-white p-4 rounded-xl shadow-lg flex items-center gap-3 animate-pulse">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Payment</p>
                                <p className="text-sm font-bold text-gray-800">Success</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Section 1 */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 relative order-2 md:order-1">
                        {/* Illustration mimicking the 'Secure cards' image */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-200 rounded-full blur-[60px] opacity-30"></div>
                            <div className="relative z-10 bg-white p-8 rounded-2xl shadow-xl max-w-md mx-auto">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="text-lg font-bold">My Cards</div>
                                    <div className="text-primary">+ Add New</div>
                                </div>
                                <div className="space-y-4">
                                    {/* Card 1 */}
                                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-5 text-white shadow-lg transform hover:-translate-y-1 transition duration-300">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-10 h-6 bg-white/20 rounded"></div>
                                            <span className="font-mono text-sm">VISA</span>
                                        </div>
                                        <div className="font-mono text-lg tracking-widest mb-2">•••• •••• •••• 4242</div>
                                        <div className="flex justify-between text-xs opacity-70">
                                            <span>Card Holder</span>
                                            <span>Expires</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold">
                                            <span>John Doe</span>
                                            <span>12/26</span>
                                        </div>
                                    </div>
                                    {/* Card 2 Partial */}
                                    <div className="bg-gray-100 rounded-xl p-4 opacity-50 scale-95">
                                        <div className="h-4 w-1/3 bg-gray-300 rounded mb-4"></div>
                                        <div className="h-4 w-full bg-gray-300 rounded"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating badge */}
                            <div className="absolute top-1/2 -right-8 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
                                <span className="text-sm font-bold text-slate-700">Protected</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 order-1 md:order-2 space-y-6">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-800 leading-tight">
                            Secure details for your <br />
                            <span className="text-primary">digital transactions.</span>
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            We use bank-level encryption to ensure your data is never compromised.
                            Manage all your cards in one place with a unified, secure dashboard.
                        </p>
                        <ul className="space-y-4 pt-2">
                            {[
                                "End-to-end encryption",
                                "Real-time fraud detection",
                                "Instant transaction alerts"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-primary">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <span className="text-slate-700 font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <button className="bg-[#1f1f3a] text-white px-8 py-3 rounded-lg font-bold hover:bg-black transition mt-4">
                            Learn more
                        </button>
                    </div>
                </div>
            </section>

            {/* Feature Section 2 - Chat/Social Proof style */}
            <section className="py-24">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 space-y-6">
                        <div className="inline-block bg-green-100 text-primary px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-2">
                            Global Chat
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-800 leading-tight">
                            Make collaboration with <br /> your internal team.
                        </h2>
                        <p className="text-lg text-slate-600">
                            Connect with your team instantly. Share invoices, approve payments, and discuss details securely within the platform.
                        </p>
                        <button className="text-primary font-bold flex items-center gap-2 hover:gap-4 transition-all">
                            Explore Messaging <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 relative">
                        {/* Chat UI Mockup */}
                        <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl p-6 max-w-sm mx-auto border border-gray-100 relative">
                            <div className="flex items-center justify-between border-b pb-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-primary font-bold">TM</div>
                                    <div>
                                        <div className="font-bold text-sm">Team Marketing</div>
                                        <div className="text-xs text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online</div>
                                    </div>
                                </div>
                                <div className="text-gray-400"><Menu className="w-4 h-4" /></div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-end gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                                    <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-none text-sm text-gray-600">
                                        Can you approve the invoice #3402?
                                    </div>
                                </div>
                                <div className="flex items-end gap-2 flex-row-reverse">
                                    <div className="w-6 h-6 rounded-full bg-blue-100"></div>
                                    <div className="bg-primary px-4 py-2 rounded-2xl rounded-br-none text-sm text-white shadow-md">
                                        Sure, checking it now. Looks good! 👍
                                    </div>
                                </div>
                                <div className="flex items-center justify-center pt-2">
                                    <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Today, 10:42 AM</span>
                                </div>
                            </div>

                            {/* Pop-out Card */}
                            <div className="absolute -left-12 bottom-8 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 border border-green-100 animate-[bounce_3s_infinite]">
                                <div className="bg-pink-100 p-2 rounded-lg">
                                    <Shield className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold">Encrypted</p>
                                    <p className="text-[10px] text-gray-500">256-bit SSL</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Wave Footer CTA */}
            <section className="relative pt-32 pb-40 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <svg className="absolute bottom-0 w-full h-full text-gradient-to-r from-green-400 via-emerald-500 to-teal-600" viewBox="0 0 1440 320" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="footerGradient" x1="0" x2="1" y1="0" y2="1">
                                <stop offset="0%" stopColor="#4ade80" />
                                <stop offset="50%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#0d9488" />
                            </linearGradient>
                        </defs>
                        <path fill="url(#footerGradient)" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center text-white">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Start your payment now</h2>
                    <p className="text-white/80 max-w-xl mx-auto mb-10 text-lg">
                        Join thousands of businesses who trust PayEase for their daily transactions.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <button className="bg-primary text-white px-8 py-3 rounded-md font-bold hover:bg-green-700 transition shadow-lg">
                            Get Started
                        </button>
                        <button className="bg-white text-[#1f1f3a] px-8 py-3 rounded-md font-bold hover:bg-gray-100 transition shadow-lg">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </section>

            {/* Simple Footer Links */}
            <footer className="bg-white py-12 border-t border-gray-100">
                <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <div className="font-bold text-xl flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm">P</div>
                            PayEase
                        </div>
                        <p className="text-sm text-gray-500">Making payments easier for everyone.</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-primary">Overview</a></li>
                            <li><a href="#" className="hover:text-primary">Features</a></li>
                            <li><a href="#" className="hover:text-primary">Pricing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-primary">About</a></li>
                            <li><a href="#" className="hover:text-primary">Careers</a></li>
                            <li><a href="#" className="hover:text-primary">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-primary">Help Center</a></li>
                            <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
}
