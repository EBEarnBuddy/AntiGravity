import React from 'react';

/**
 * A simple component to detect URLs in text and wrap them in anchor tags.
 * Handles http/https links and renders them as clickable links.
 */
interface LinkifyProps {
    children: string;
    className?: string;
}

export const Linkify: React.FC<LinkifyProps> = ({ children, className = "text-green-600 hover:underline" }) => {
    if (!children) return null;

    // URL Parsing Regex: matches http/https OR www.
    // Group 1: Protocol (optional)
    // Group 2: Domain + Path
    const urlRegex = /((?:https?:\/\/|www\.)[^\s]+)/g;
    const parts = children.split(urlRegex);

    return (
        <>
            {parts.map((part, index) => {
                if (part.match(urlRegex)) {
                    return (
                        <a
                            key={index}
                            href={part.startsWith('www.') ? `https://${part}` : part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={className}
                            onClick={(e) => e.stopPropagation()} // Prevent card click
                        >
                            {part}
                        </a>
                    );
                }
                return part;
            })}
        </>
    );
};
