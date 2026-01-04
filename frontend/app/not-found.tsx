import Link from 'next/link';
import { AlertTriangle, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] p-8 md:p-12 max-w-lg w-full text-center relative overflow-hidden">
                {/* Decorative Grid */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] [background-size:24px_24px] pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="inline-flex justify-center items-center w-24 h-24 bg-red-500 border-4 border-slate-900 rounded-full mb-6 animate-bounce shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                        <AlertTriangle className="w-12 h-12 text-white stroke-[3]" />
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-2 tracking-tighter">404</h1>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase mb-4 bg-yellow-300 inline-block px-2 border-2 border-slate-900 transform -rotate-1">
                        Lost In Space?
                    </h2>

                    <p className="text-slate-600 font-bold text-lg mb-8 uppercase tracking-wide">
                        The page you are looking for has been abducted by aliens or never existed.
                    </p>

                    <Link
                        href="/discover"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest border-2 border-transparent hover:bg-white hover:text-slate-900 hover:border-slate-900 transition-all shadow-[6px_6px_0px_0px_rgba(22,163,74,1)] hover:shadow-[4px_4px_0px_0px_rgba(22,163,74,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        <Home className="w-5 h-5 stroke-[3]" />
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
