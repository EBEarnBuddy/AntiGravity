"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Globe, User, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Navbar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { currentUser, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isActive = (path: string) => pathname === path;

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/auth');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="h-16 bg-green-600 text-white flex items-center justify-between px-6 shadow-md sticky top-0 z-50">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
                <img src="/logo-white.png" alt="EarnBuddy" className="h-8 w-auto object-contain" />
            </Link>

            {/* Desktop Center Links */}
            <div className="hidden md:flex items-center gap-8">
                <Link href="/discover" className={`text-sm font-bold uppercase tracking-wide hover:text-green-100 transition-colors ${isActive('/discover') ? 'text-white border-b-2 border-white' : 'text-green-100/80'}`}>Home</Link>
                <Link href="/startups" className={`text-sm font-bold uppercase tracking-wide hover:text-green-100 transition-colors ${isActive('/startups') ? 'text-white border-b-2 border-white' : 'text-green-100/80'}`}>LaunchPad</Link>
                <Link href="/freelance" className={`text-sm font-bold uppercase tracking-wide hover:text-green-100 transition-colors ${isActive('/freelance') ? 'text-white border-b-2 border-white' : 'text-green-100/80'}`}>CoLancing</Link>
                <Link href="/circles" className={`text-sm font-bold uppercase tracking-wide hover:text-green-100 transition-colors ${isActive('/circles') ? 'text-white border-b-2 border-white' : 'text-green-100/80'}`}>Circles</Link>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-green-700 rounded-full transition relative">
                    <Bell className="w-5 h-5 text-white" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-green-600"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-9 h-9 rounded-full bg-green-800 border-2 border-green-400 overflow-hidden hover:border-white transition focus:outline-none"
                    >
                        <img
                            src={currentUser?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-slate-100 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            <div className="px-4 py-3 border-b border-slate-50">
                                <p className="text-sm font-bold text-slate-900 truncate">{currentUser?.displayName || 'User'}</p>
                                <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                            </div>
                            <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-green-600 font-medium" onClick={() => setIsProfileOpen(false)}><User className="w-4 h-4" /> Profile</Link>
                            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-green-600 font-medium" onClick={() => setIsProfileOpen(false)}><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
                            <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-green-600 font-medium" onClick={() => setIsProfileOpen(false)}><Settings className="w-4 h-4" /> Settings</Link>
                            <div className="border-t border-slate-50 mt-1">
                                <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"><LogOut className="w-4 h-4" /> Logout</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 hover:bg-green-700 rounded-full transition"
                >
                    <LayoutDashboard className="w-6 h-6 text-white" />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-16 left-0 w-full bg-green-600 border-t border-green-500 shadow-xl md:hidden flex flex-col p-4 space-y-4 animate-in slide-in-from-top-2">
                    <Link href="/discover" className="text-white font-bold text-lg py-2 border-b border-green-500" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                    <Link href="/startups" className="text-white font-bold text-lg py-2 border-b border-green-500" onClick={() => setIsMobileMenuOpen(false)}>LaunchPad</Link>
                    <Link href="/freelance" className="text-white font-bold text-lg py-2 border-b border-green-500" onClick={() => setIsMobileMenuOpen(false)}>CoLancing</Link>
                    <Link href="/circles" className="text-white font-bold text-lg py-2" onClick={() => setIsMobileMenuOpen(false)}>Circles</Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
