import React from 'react';
import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, UserGroupIcon, BoltIcon } from '@heroicons/react/24/solid';
import { FloatingCard } from './floating-card';
import { useAuth } from '../../contexts/AuthContext';

interface BuilderActivity {
  id: string;
  user: {
    name: string;
    avatar: string;
    title: string;
  };
  action: string;
  project: string;
  timestamp: string;
  type: 'build' | 'join' | 'launch' | 'fund';
}

export const BuilderFeed: React.FC = () => {
  const { userProfile } = useAuth();

  // Generate activities based on user profile if available
  const generateActivities = (): BuilderActivity[] => {
    // If we have user activity, show real activities
    if (userProfile?.activityLog && userProfile.activityLog.length > 0) {
      return userProfile.activityLog.slice(0, 3).map((activity, index) => ({
        id: activity.id || `activity-${index}`,
        user: {
          name: userProfile.displayName || 'Anonymous',
          avatar: userProfile.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
          title: (userProfile as any).title || 'Builder'
        },
        action: activity.action || 'updated',
        project: activity.description || 'their profile',
        timestamp: activity.timestamp || 'recently',
        type: 'build' as const
      }));
    }

    // Return empty array if no real activity
    return [];
  };

  const activities = generateActivities();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'launch': return ArrowTrendingUpIcon;
      case 'join': return UserGroupIcon;
      case 'fund': return ArrowTrendingUpIcon;
      default: return BoltIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'launch': return 'text-emerald-900 bg-emerald-100 border-2 border-emerald-900';
      case 'join': return 'text-blue-900 bg-blue-100 border-2 border-blue-900';
      case 'fund': return 'text-purple-900 bg-purple-100 border-2 border-purple-900';
      case 'apply': return 'text-orange-900 bg-orange-100 border-2 border-orange-900';
      default: return 'text-slate-900 bg-slate-100 border-2 border-slate-900';
    }
  };

  return (
    <FloatingCard className="p-6 h-full border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Live Builder Activity</h3>
        <div className="flex items-center gap-2 border-2 border-red-500 bg-red-100 px-2 py-0.5">
          <div className="w-2 h-2 bg-red-500 rounded-none animate-pulse"></div>
          <span className="text-sm font-bold text-red-700 uppercase">Live</span>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getTypeIcon(activity.type);
          return (
            <motion.div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-none border-2 border-slate-200 hover:border-slate-900 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all bg-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <img
                src={activity.user.avatar}
                alt={activity.user.name}
                className="w-10 h-10 rounded-none border-2 border-slate-900 object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900">{activity.user.name}</span>
                  <div className={`p-1 rounded-none ${getTypeColor(activity.type)}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                </div>
                <p className="text-sm text-slate-600 font-medium">
                  {activity.action} <span className="font-bold underline decoration-2 decoration-emerald-500">{activity.project}</span>
                </p>
                <p className="text-xs text-slate-400 mt-1 font-mono">{activity.timestamp}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </FloatingCard>
  );
};