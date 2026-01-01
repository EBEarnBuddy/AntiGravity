import React, { ReactNode } from 'react';

interface EmptyStateProps {
    title: string;
    description: string;
    action?: ReactNode;
    type?: 'search' | 'inbox' | 'general';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action, type = 'general' }) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-black border-dashed bg-gray-50 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
            <div className="mb-6 text-6xl">
                {type === 'search' && '🔭'}
                {type === 'inbox' && '📭'}
                {type === 'general' && '🌵'}
            </div>
            <h3 className="text-xl font-bold font-display uppercase tracking-wider mb-2">{title}</h3>
            <p className="text-gray-600 mb-6 max-w-sm">{description}</p>
            {action && (
                <div className="mt-2 text-sm">{action}</div>
            )}
        </div>
    );
};
