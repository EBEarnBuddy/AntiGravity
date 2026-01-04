import React from 'react';

export const CircleCardSkeleton = () => {
    return (
        <div className="bg-white border-4 border-slate-100 p-0 flex flex-col relative h-full">
            {/* Avatar Skeleton */}
            <div className="aspect-[4/3] bg-slate-100 relative border-b-4 border-slate-100 overflow-hidden animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]"></div>
            </div>

            {/* Content Skeleton */}
            <div className="p-6 flex flex-col flex-grow text-center space-y-4">
                {/* Title */}
                <div className="h-8 bg-slate-100 w-3/4 mx-auto rounded animate-pulse"></div>

                {/* Description */}
                <div className="space-y-2">
                    <div className="h-4 bg-slate-100 w-full rounded animate-pulse"></div>
                    <div className="h-4 bg-slate-100 w-5/6 mx-auto rounded animate-pulse"></div>
                    <div className="h-4 bg-slate-100 w-4/6 mx-auto rounded animate-pulse"></div>
                </div>

                {/* Stats */}
                <div className="h-4 bg-slate-100 w-1/3 mx-auto mt-4 rounded animate-pulse"></div>

                {/* Button */}
                <div className="mt-auto w-full pt-4 border-t-4 border-slate-50">
                    <div className="h-12 bg-slate-100 w-full rounded animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};
