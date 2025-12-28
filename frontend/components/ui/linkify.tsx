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

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = children.split(urlRegex);

    return (
        <>
            {parts.map((part, index) => {
                if (part.match(urlRegex)) {
                    return (
                        <a
                            key={index}
                            href={part}
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
