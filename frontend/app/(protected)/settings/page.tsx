"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, HelpCircle, FileText, Bug, AlertTriangle, ChevronRight } from 'lucide-react';

const SettingsPage: React.FC = () => {
    const contactOptions = [
        {
            icon: Mail,
            title: "Email Support",
            description: "Get in touch with our support team for any account-related or general inquiries.",
            action: "support@earnbuddy.com",
            link: "mailto:support@earnbuddy.com",
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            icon: MessageCircle,
            title: "Community Chat",
            description: "Join our discord or public circles to chat with other builders and moderators.",
            action: "Join Discord",
            link: "#", // Placeholder
            color: "text-purple-600",
            bg: "bg-purple-100"
        }
    ];

    const helpResources = [
        {
            icon: HelpCircle,
            title: "Frequently Asked Questions",
            link: "/lander#faq"
        },
        {
            icon: FileText,
            title: "Terms of Service & Privacy",
            link: "#"
        },
        {
            icon: Bug,
            title: "Report a Bug",
            link: "mailto:bugs@earnbuddy.com"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
            {/* Header Spacing */}
            <div className="h-12"></div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Header */}
                    <div className="text-center space-y-4 mb-12">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                            Help & <span className="text-green-600">Support</span>
                        </h1>
                        <p className="text-slate-600 font-medium text-lg max-w-xl mx-auto">
                            Need help with EarnBuddy? We're here for you. Check out our resources below or get in touch directly.
                        </p>
                    </div>

                    {/* Contact Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {contactOptions.map((option, index) => (
                            <motion.a
                                key={index}
                                href={option.link}
                                whileHover={{ y: -5 }}
                                className="bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-green-600 transition-all duration-300 shadow-sm group block"
                            >
                                <div className={`w-12 h-12 ${option.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <option.icon className={`w-6 h-6 ${option.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{option.title}</h3>
                                <p className="text-slate-600 mb-4 text-sm font-medium">{option.description}</p>
                                <div className="text-green-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                                    {option.action} <ChevronRight className="w-4 h-4" />
                                </div>
                            </motion.a>
                        ))}
                    </div>

                    {/* Resources Section */}
                    <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                            <HelpCircle className="w-6 h-6 text-green-600" />
                            Resources
                        </h3>
                        <div className="space-y-4">
                            {helpResources.map((resource, index) => (
                                <a
                                    key={index}
                                    href={resource.link}
                                    className="flex items-center justify-between p-4 bg-slate-50 hover:bg-green-50 rounded-xl border border-slate-100 hover:border-green-200 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <resource.icon className="w-5 h-5 text-slate-500 group-hover:text-green-600 transition-colors" />
                                        <span className="font-bold text-slate-700 group-hover:text-slate-900">{resource.title}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-green-600 transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Footer Note */}
                    <div className="bg-yellow-50 border-2 border-yellow-100 rounded-2xl p-6 flex gap-4 items-start">
                        <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-yellow-800 mb-1">Note on Account Settings</h4>
                            <p className="text-yellow-700 text-sm font-medium">
                                To update your profile information, password, or notification preferences, please visit your <a href="/profile" className="underline hover:text-yellow-900">Profile Page</a>.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SettingsPage;
