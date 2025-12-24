import Link from 'next/link';
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
    ChevronDown
} from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-600">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-20">
                <div className="h-16 flex items-center px-6 border-b border-slate-50">
                    <Link href="/discover" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
                            </svg>
                        </div>
                        EarnBuddy
                    </Link>
                </div>

                <div className="p-4 flex flex-col gap-1 overflow-y-auto flex-1">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg mb-4 border border-slate-100">
                            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80" alt="Team" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">OnPoint Studio</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-green-700 bg-green-50/50 rounded-lg font-medium transition-colors">
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-green-700 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                            <Inbox className="w-4 h-4" /> Inbox
                        </Link>
                        <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-green-700 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                            <Users className="w-4 h-4" /> Teams
                        </Link>
                        <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-green-700 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                            <BarChart className="w-4 h-4" /> Analytics
                        </Link>
                        <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-green-700 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                            <Settings className="w-4 h-4" /> Settings
                        </Link>
                    </div>

                    <div className="mt-8">
                        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Projects</p>
                        <div className="space-y-1">
                            <button className="w-full flex items-center justify-between px-3 py-2 text-slate-600 hover:text-green-700 hover:bg-slate-50 rounded-lg font-medium transition-colors text-left group">
                                <span className="flex items-center gap-3"><FolderPlus className="w-4 h-4" /> Add Projects</span>
                            </button>
                            <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-green-700 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> Main Project
                            </Link>
                            <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-green-700 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Landing Page
                            </Link>
                            <Link href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-green-700 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Design System
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-green-700 hover:bg-slate-50 rounded-lg font-medium transition-colors">
                        <HelpCircle className="w-4 h-4" /> Help Center
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 ml-64 flex flex-col min-w-0 bg-slate-50">
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
                            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80" alt="Profile" className="w-full h-full object-cover" />
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
