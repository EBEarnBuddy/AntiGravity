"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FirestoreService } from '@/lib/firestore';
import { User, Camera, Save, MapPin, Link, Briefcase, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EditProfile() {
    const { currentUser, userProfile, updateProfile } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        location: '',
        skills: '', // Comma separated string for input
        website: '',
        github: '',
        linkedin: '',
        portfolio: '',
        availability: 'open' as 'open' | 'busy'
    });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                displayName: userProfile.displayName || '',
                bio: userProfile.bio || '',
                location: userProfile.location || '',
                skills: userProfile.skills ? userProfile.skills.join(', ') : '',
                website: userProfile.website || '',
                github: userProfile.socialLinks?.github || '',
                linkedin: userProfile.socialLinks?.linkedin || '',
                portfolio: userProfile.socialLinks?.portfolio || '',
                availability: (userProfile as any).availability || 'open'
            });
        }
    }, [userProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser) return;

        try {
            setIsLoading(true);
            const url = await FirestoreService.uploadUserAvatar(currentUser.uid, file);
            await updateProfile({ photoURL: url });
            setSuccessMessage("Avatar updated successfully!");
        } catch (err) {
            console.error("Failed to upload avatar:", err);
            setError("Failed to upload avatar. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsSaving(true);

        try {
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

            await updateProfile({
                displayName: formData.displayName,
                bio: formData.bio,
                location: formData.location,
                website: formData.website,
                skills: skillsArray,
                // @ts-ignore - availability is custom field
                availability: formData.availability,
                socialLinks: {
                    github: formData.github,
                    linkedin: formData.linkedin,
                    portfolio: formData.portfolio
                }
            });

            // Also update basic Auth profile for immediate header refresh if needed
            // (updateProfile in AuthContext handles this usually)

            setSuccessMessage("Profile updated successfully!");
            setTimeout(() => {
                const handle = (currentUser as any).username || (currentUser as any).firebaseUid || currentUser?.uid;
                router.push(`/u/${handle}`);
            }, 1000);
        } catch (err) {
            console.error("Profile update failed:", err);
            setError("Failed to verify updates. Please check your connection.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!userProfile) return null;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Header Spacing */}
            <div className="h-12"></div>

            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] overflow-hidden">

                    {/* Header */}
                    <div className="bg-slate-900 p-6 flex justify-between items-center">
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Edit Profile</h1>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="text-slate-300 hover:text-white font-bold uppercase text-sm border-b-2 border-transparent hover:border-white transition-all"
                        >
                            Cancel
                        </button>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="bg-red-100 border-2 border-slate-900 p-4 mb-6 flex items-center gap-3">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                                <p className="text-red-900 font-bold">{error}</p>
                            </div>
                        )}
                        {successMessage && (
                            <div className="bg-green-100 border-2 border-slate-900 p-4 mb-6 flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <p className="text-green-900 font-bold">{successMessage}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Avatar Section */}
                            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8 border-b-2 border-slate-100 pb-8">
                                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                    <div className="w-32 h-32 bg-slate-100 overflow-hidden border-4 border-slate-900 shadow-sm group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                                        {currentUser?.photoURL ? (
                                            <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User className="w-12 h-12 text-slate-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/gif"
                                    />
                                </div>

                                <div className="flex-1 space-y-2 text-center sm:text-left">
                                    <h3 className="font-black text-xl uppercase">Profile Photo</h3>
                                    <p className="text-slate-500 text-sm font-medium">
                                        Click the image to upload a new one. Recommended size: 400x400px. JPG, PNG or GIF.
                                    </p>
                                    {isLoading && <p className="text-green-600 font-bold animate-pulse text-sm">Uploading...</p>}
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase text-slate-500 tracking-wide">Display Name</label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-slate-900 focus:outline-none font-bold text-slate-900 transition-colors"
                                        placeholder="e.g. Alex Smith"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase text-slate-500 tracking-wide flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-slate-900 focus:outline-none font-bold text-slate-900 transition-colors"
                                        placeholder="e.g. San Francisco, CA"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-black uppercase text-slate-500 tracking-wide">Bio</label>
                                    <textarea
                                        name="bio"
                                        rows={4}
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-slate-900 focus:outline-none font-medium text-slate-900 transition-colors resize-none"
                                        placeholder="Tell us a little about yourself..."
                                    />
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Professional */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-slate-900 uppercase flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-green-600" /> Professional
                                </h3>

                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase text-slate-500 tracking-wide">Skills (Comma separated)</label>
                                    <input
                                        type="text"
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-slate-900 focus:outline-none font-bold text-slate-900 transition-colors"
                                        placeholder="e.g. React, Node.js, Design, Marketing"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase text-slate-500 tracking-wide">Availability</label>
                                    <select
                                        name="availability"
                                        value={formData.availability}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-slate-900 focus:outline-none font-bold text-slate-900"
                                    >
                                        <option value="open">🟢 Open to Work</option>
                                        <option value="busy">🔴 Currently Busy</option>
                                    </select>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Links */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-slate-900 uppercase flex items-center gap-2">
                                    <Link className="w-5 h-5 text-blue-500" /> Social Links
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400">Website</label>
                                        <input
                                            type="url"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-slate-50 border-2 border-slate-200 focus:border-slate-900 focus:outline-none text-sm font-bold text-slate-900"
                                            placeholder="https://yourwebsite.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400">GitHub</label>
                                        <input
                                            type="url"
                                            name="github"
                                            value={formData.github}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-slate-50 border-2 border-slate-200 focus:border-slate-900 focus:outline-none text-sm font-bold text-slate-900"
                                            placeholder="https://github.com/username"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400">LinkedIn</label>
                                        <input
                                            type="url"
                                            name="linkedin"
                                            value={formData.linkedin}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-slate-50 border-2 border-slate-200 focus:border-slate-900 focus:outline-none text-sm font-bold text-slate-900"
                                            placeholder="https://linkedin.com/in/username"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400">Portfolio</label>
                                        <input
                                            type="url"
                                            name="portfolio"
                                            value={formData.portfolio}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-slate-50 border-2 border-slate-200 focus:border-slate-900 focus:outline-none text-sm font-bold text-slate-900"
                                            placeholder="https://dribbble.com/username"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-8 border-t-2 border-slate-900 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-6 py-3 bg-white text-slate-900 font-black uppercase tracking-wide border-2 border-slate-200 hover:border-slate-900 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-8 py-3 bg-green-500 text-slate-900 font-black uppercase tracking-wide border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
