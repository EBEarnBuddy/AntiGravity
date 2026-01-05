import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';

export default function ForCommunitiesPage() {
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col">
            <PublicNavbar />
            <main className="flex-grow pt-32 pb-16 px-6 container mx-auto flex flex-col items-center text-center">
                <h1 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tighter">
                    Grow Your <span className="text-red-500">Community</span>
                </h1>
                <p className="text-xl md:text-2xl font-bold text-slate-500 max-w-2xl mb-12">
                    Manage events, membership, and resources for your student organization or club with powerful tools.
                </p>
                <div className="p-12 border-4 border-slate-900 bg-slate-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full">
                    <h2 className="text-3xl font-black uppercase mb-4">Coming Soon</h2>
                    <p className="text-lg font-medium mb-8">
                        We are onboarding select communities for our beta program.
                    </p>
                    <Link
                        href="/auth?mode=signup"
                        className="inline-block w-full bg-slate-900 text-white py-4 px-8 text-xl font-black uppercase tracking-wider hover:bg-red-500 transition-colors"
                    >
                        Partner With Us
                    </Link>
                </div>
            </main>
            <PublicFooter />
        </div>
    );
}
