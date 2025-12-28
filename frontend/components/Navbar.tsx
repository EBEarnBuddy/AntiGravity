"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Globe, User, LogOut, LayoutGrid, Settings, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import useOnClickOutside from '@/hooks/useOnClickOutside';

const Navbar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { currentUser, userProfile, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isActive = (path: string) => pathname === path;

    const handleLogout = async () => {
        // Redirect to lander first, then let lander handle the actual logout
        // This avoids race conditions with ProtectedLayout redirecting to /auth
        router.push('/lander?logout=true');
    };

    // Close dropdown when clicking outside
    useOnClickOutside(dropdownRef, () => setIsProfileOpen(false));

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                    { name: 'Events', path: '/events', id: 'tour-events-link' }, // Added Events link to nav as well?
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
                <NotificationDropdown />

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        id="tour-navbar-profile"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-9 h-9 rounded-full bg-green-800 border-2 border-white overflow-hidden hover:bg-green-700 transition focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        <img
                            src={currentUser?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 min-w-[12rem] w-auto max-w-[16rem] bg-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] py-1 border-2 border-slate-900 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            <div className="px-4 py-3 border-b-2 border-slate-900 bg-slate-50">
                                <p className="text-sm font-black text-slate-900 truncate uppercase">{userProfile?.displayName || currentUser?.displayName || 'User'}</p>
                                <p className="text-xs text-slate-500 truncate font-mono">{userProfile?.username ? `@${userProfile.username}` : (userProfile?.email || currentUser?.email)}</p>
                            </div>
                            <Link href={userProfile?.username ? `/u/${userProfile.username}` : '/profile'} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-green-50 hover:text-green-600 font-bold uppercase" onClick={() => setIsProfileOpen(false)}><User className="w-4 h-4" /> Profile</Link>
                            <Link href="/support" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-green-50 hover:text-green-600 font-bold uppercase" onClick={() => setIsProfileOpen(false)}><LayoutGrid className="w-4 h-4" /> Support</Link>
                            <div className="border-t-2 border-slate-900 mt-1">
                                <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold uppercase"><LogOut className="w-4 h-4" /> Logout</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 hover:bg-green-700 rounded-none border-2 border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                >
                    <Menu className="w-6 h-6 text-white" />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-16 left-0 w-full bg-green-600 border-t-2 border-slate-900 shadow-xl md:hidden flex flex-col p-4 space-y-4 animate-in slide-in-from-top-2 border-b-2">
                    <Link href="/discover" className="text-white font-black text-lg py-2 border-b-2 border-green-500 uppercase tracking-widest" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                    <Link href="/startups" className="text-white font-black text-lg py-2 border-b-2 border-green-500 uppercase tracking-widest" onClick={() => setIsMobileMenuOpen(false)}>Startup</Link>
                    <Link href="/freelance" className="text-white font-black text-lg py-2 border-b-2 border-green-500 uppercase tracking-widest" onClick={() => setIsMobileMenuOpen(false)}>CoLancing</Link>
                    <Link href="/circles" className="text-white font-black text-lg py-2 border-b-2 border-green-500 uppercase tracking-widest" onClick={() => setIsMobileMenuOpen(false)}>Circles</Link>
                    <Link href="/events" className="text-white font-black text-lg py-2 uppercase tracking-widest" onClick={() => setIsMobileMenuOpen(false)}>Events</Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
