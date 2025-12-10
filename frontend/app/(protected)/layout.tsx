"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Inbox,
    Users,
    BarChart,
    Settings,
    FolderPlus,
    Search,
    Bell,
    HelpCircle,
    LogOut,
    ChevronDown,
    Hash,
    Briefcase,
    Rocket,
    MessageCircle
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Inner component to access auth context
function ProtectedShell({ children }: { children: React.ReactNode }) {
    const { currentUser, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = React.useState(false);

    useEffect(() => {
        if (!loading) {
            if (!currentUser) {
                router.push('/auth');
            } else {
                // Check if onboarding is needed
                // Ideally this check comes from user profile data in Firestore
                // For now, assuming user object might have it or we fetch it.
                // Since this is client-side, we might see a flash.
                // Checking logic: If not completed and not on onboarding page.
                // Note: /onboarding is NOT in (protected) layout in this structure?
                // Wait, if /onboarding is a root page (app/onboarding/page.tsx), it's outside.
                // But current user might be in protected routes.
                // If we want to force onboarding, we should check here.
                // However, accessing Firestore here might be heavy.
                // Let's assume we can proceed or we add a lightweight check if available.
                // User requested: "The onboarding screen must appear only once... and never show again".
            }
        }
    }, [currentUser, loading, router]);

    useEffect(() => {
        if (!loading && !currentUser) {
            router.push('/auth');
        }
    }, [currentUser, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!currentUser) return null;

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-600">
            {/* Sidebar */}
            <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-20 transition-all duration-300`}>
                <div className="h-16 flex items-center px-4 border-b border-slate-50 justify-between">
                    <Link href="/lander" className={`flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 ${collapsed ? 'justify-center w-full' : ''}`}>
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
                            </svg>
                        </div>
                        {!collapsed && <span>EarnBuddy</span>}
                    </Link>
                    {!collapsed && (
                        <button onClick={() => setCollapsed(true)} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                            <ChevronDown className="w-4 h-4 rotate-90" />
                        </button>
                    )}
                </div>

                <div className="p-4 flex flex-col gap-1 overflow-y-auto flex-1">
                    {collapsed && (
                        <button onClick={() => setCollapsed(false)} className="w-full flex justify-center mb-4 p-2 hover:bg-slate-100 rounded text-slate-400">
                            <ChevronDown className="w-4 h-4 -rotate-90" />
                        </button>
                    )}

                    {!collapsed && (
                        <div className="mb-6">
                            <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg mb-4 border border-slate-100">
                                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0">
                                    <img src={currentUser.photoURL || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80"} alt="Team" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">{currentUser.displayName || "User"}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <Link href="/discover" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${pathname === '/discover' ? 'text-green-700 bg-green-50/50' : 'text-slate-600 hover:text-green-700 hover:bg-slate-50'}`}>
                            <LayoutDashboard className="w-4 h-4" /> Discover
                        </Link>
                        <Link href="/community" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${pathname === '/community' ? 'text-green-700 bg-green-50/50' : 'text-slate-600 hover:text-green-700 hover:bg-slate-50'}`}>
                            <Hash className="w-4 h-4" /> Communities
                        </Link>
                        <Link href="/freelance" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${pathname === '/freelance' ? 'text-green-700 bg-green-50/50' : 'text-slate-600 hover:text-green-700 hover:bg-slate-50'}`}>
                            <Briefcase className="w-4 h-4" /> Freelance
                        </Link>
                        <Link href="/startups" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${pathname === '/startups' ? 'text-green-700 bg-green-50/50' : 'text-slate-600 hover:text-green-700 hover:bg-slate-50'}`}>
                            <Rocket className="w-4 h-4" /> Startups
                        </Link>
                        <Link href="/rooms" className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${pathname === '/rooms' ? 'text-green-700 bg-green-50/50' : 'text-slate-600 hover:text-green-700 hover:bg-slate-50'}`}>
                            <MessageCircle className="w-4 h-4" /> Rooms
                        </Link>
                    </div>

                    <div className="mt-8">
                        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Projects</p>
                        <div className="space-y-1">
                            <button className="w-full flex items-center justify-between px-3 py-2 text-slate-600 hover:text-green-700 hover:bg-slate-50 rounded-lg font-medium transition-colors text-left group">
                                <span className="flex items-center gap-3"><FolderPlus className="w-4 h-4" /> Add Projects</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 space-y-1">
                    <Link href="/settings" className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-green-700 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                        <Settings className="w-4 h-4" /> Settings
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} flex flex-col min-w-0 bg-slate-50 transition-all duration-300`}>
                {/* Header */}
                <header className="h-16 bg-slate-50 sticky top-0 z-10 px-8 flex items-center justify-between">
                    <div className="flex-1 max-w-xl">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                        <button className="p-2 text-slate-400 hover:text-green-700 transition relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-50"></span>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center overflow-hidden">
                            <img src={currentUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8 pt-4 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedShell>{children}</ProtectedShell>
    );
}
