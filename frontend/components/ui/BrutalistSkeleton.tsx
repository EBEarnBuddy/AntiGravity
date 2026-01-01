import React from 'react';

interface BrutalistSkeletonProps {
    className?: string;
    width?: string;
    height?: string;
}

export const BrutalistSkeleton: React.FC<BrutalistSkeletonProps> = ({ className = '', width = 'w-full', height = 'h-4' }) => {
    return (
        <div className={`relative overflow-hidden bg-gray-200 border-2 border-black ${width} ${height} ${className}`}>
            <div className="absolute inset-0 bg-gray-300 animate-pulse"></div>
            {/* Retro Terminal Cursor Effect */}
            <div className="absolute top-0 left-0 h-full w-2 bg-black animate-ping opacity-20"></div>
        </div>
    );
};
