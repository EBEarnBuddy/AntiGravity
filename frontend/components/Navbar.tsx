"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, LayoutGrid, Settings, Menu, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import useOnClickOutside from '@/hooks/useOnClickOutside';

const Navbar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { currentUser, userProfile, logout } = useAuth();

    // State: 'profile' | 'notifications' | 'mobile' | null
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    const isActive = (path: string) => pathname === path;

    const handleLogout = async () => {
        router.push('/lander?logout=true');
    };

    // Close dropdowns when clicking outside
    useOnClickOutside(dropdownRef, () => {
        if (activeMenu === 'profile') setActiveMenu(null);
    });

    // Toggle Handlers
    const toggleProfile = () => setActiveMenu(activeMenu === 'profile' ? null : 'profile');
    const toggleNotifications = () => setActiveMenu(activeMenu === 'notifications' ? null : 'notifications');
    const toggleMobileMenu = () => setActiveMenu(activeMenu === 'mobile' ? null : 'mobile');

    // Close mobile menu on route change
    useEffect(() => {
        setActiveMenu(null);
    }, [pathname]);

    return (
        <nav className="h-16 bg-green-600 text-white flex items-center justify-between px-6 border-b-2 border-slate-900 sticky top-0 z-50">
            {/* Logo */}
            <Link href="/discover" className="flex items-center gap-2">
                <img src="/logo-white.png" alt="EarnBuddy" className="h-8 w-auto object-contain" />
            </Link>

            {/* Desktop Center Links */}
            <div className="hidden md:flex items-center gap-8 relative">
                {[
                    { name: 'Home', path: '/discover', id: 'tour-dashboard-link' },
                    { name: 'Startups', path: '/startups', id: 'tour-startups-link' },
                    { name: 'CoLancing', path: '/freelance', id: 'tour-freelance-link' },
                    { name: 'Circles', path: '/circles', id: 'tour-circles-link' },
                    { name: 'Events', path: '/events', id: 'tour-events-link' },
                ].map((link) => (
                    <Link
                        key={link.path}
                        id={link.id}
                        href={link.path}
                        className={`relative text-sm font-bold uppercase tracking-wide transition-colors py-1 ${isActive(link.path) ? 'text-white' : 'text-green-100/80 hover:text-white'}`}
                    >
                        {link.name}
                        {isActive(link.path) && (
                            <motion.div
                                layoutId="navbar-underline"
                                className="absolute left-0 right-0 -bottom-1 h-1 bg-white"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                        )}
                    </Link>
                ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-4">
                <NotificationDropdown
                    isOpen={activeMenu === 'notifications'}
                    onToggle={toggleNotifications}
                />

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        id="tour-navbar-profile"
                        onClick={toggleProfile}
                        className="w-9 h-9 rounded-full bg-green-800 border-2 border-white overflow-hidden hover:bg-green-700 transition focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        <img
                            src={currentUser?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </button>

                    <AnimatePresence>
                        {activeMenu === 'profile' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-2 min-w-[12rem] w-auto max-w-[16rem] bg-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] py-1 border-2 border-slate-900 origin-top-right z-50"
                            >
                                <div className="px-4 py-3 border-b-2 border-slate-900 bg-slate-50">
                                    <p className="text-sm font-black text-slate-900 truncate uppercase">{userProfile?.displayName || currentUser?.displayName || 'User'}</p>
                                    <p className="text-xs text-slate-500 truncate font-mono">{userProfile?.username ? `@${userProfile.username}` : (userProfile?.email || currentUser?.email)}</p>
                                </div>
                                <Link href={userProfile?.username ? `/u/${userProfile.username}` : '/profile'} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-green-50 hover:text-green-600 font-bold uppercase" onClick={() => setActiveMenu(null)}><User className="w-4 h-4" /> Profile</Link>
                                <Link href="/support" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-green-50 hover:text-green-600 font-bold uppercase" onClick={() => setActiveMenu(null)}><LayoutGrid className="w-4 h-4" /> Support</Link>
                                <div className="border-t-2 border-slate-900 mt-1">
                                    <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold uppercase"><LogOut className="w-4 h-4" /> Logout</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMobileMenu}
                    className="md:hidden p-2 hover:bg-green-700 rounded-none border-2 border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                >
                    {activeMenu === 'mobile' ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {activeMenu === 'mobile' && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="absolute top-16 left-0 w-full bg-green-600 border-t-2 border-b-2 border-slate-900 shadow-xl md:hidden flex flex-col overflow-hidden z-40"
                    >
                        <div className="flex flex-col p-4 space-y-4">
                            <Link href="/discover" className="text-white font-black text-lg py-2 border-b-2 border-green-500 uppercase tracking-widest" onClick={() => setActiveMenu(null)}>Home</Link>
                            <Link href="/startups" className="text-white font-black text-lg py-2 border-b-2 border-green-500 uppercase tracking-widest" onClick={() => setActiveMenu(null)}>Startup</Link>
                            <Link href="/freelance" className="text-white font-black text-lg py-2 border-b-2 border-green-500 uppercase tracking-widest" onClick={() => setActiveMenu(null)}>CoLancing</Link>
                            <Link href="/circles" className="text-white font-black text-lg py-2 border-b-2 border-green-500 uppercase tracking-widest" onClick={() => setActiveMenu(null)}>Circles</Link>
                            <Link href="/events" className="text-white font-black text-lg py-2 uppercase tracking-widest" onClick={() => setActiveMenu(null)}>Events</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
