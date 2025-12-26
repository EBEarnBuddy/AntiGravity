"use client";

import React from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';

interface UserAvatarProps {
    src?: string | null;
    alt?: string;
    size?: number; // size in pixels
    username?: string; // If provided, links to /u/username
    uid?: string; // Fallback if username missing
    className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
    src,
    alt = "User",
    size = 40,
    username,
    uid,
    className = ""
}) => {
    // Generate profile link logic
    const profileLink = username ? `/u/${username}` : uid ? `/u/${uid}` : null;

    const sizeStyle = { width: size, height: size };

    const AvatarContent = (
        <div
            className={`relative rounded-full overflow-hidden bg-slate-100 border-2 border-slate-900 flex-shrink-0 ${className}`}
            style={sizeStyle}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-green-100">
                    <User className="text-green-600" style={{ width: size * 0.5, height: size * 0.5 }} />
                </div>
            )}
        </div>
    );

    if (profileLink) {
        return (
            <Link href={profileLink} className="block hover:opacity-90 transition-opacity">
                {AvatarContent}
            </Link>
        );
    }

    return AvatarContent;
};
