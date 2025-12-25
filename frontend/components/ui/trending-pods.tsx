import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Zap, ExternalLink } from 'lucide-react';
import { FloatingCard } from './floating-card';
import { Pod } from '../../lib/firestore';
import { useRouter } from 'next/navigation';

interface TrendingPodsProps {
  pods: Pod[];
}

export const TrendingPods: React.FC<TrendingPodsProps> = ({ pods }) => {
  const router = useRouter();

  const trendingPods = pods.slice(0, 3).map(pod => ({
    id: pod.id,
    name: pod.name,
    description: pod.description,
    members: pod.memberCount || pod.members?.length || 0,
    growth: (pod as any).growth || '+0%', // Use actual growth data or default to +0%
    gradient: pod.theme,
    icon: pod.icon === 'Zap' ? Zap : pod.icon === 'Users' ? Users : TrendingUp
  }));

  return (
    <FloatingCard className="p-6 h-full border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Trending Pods</h3>
        <motion.button
          onClick={() => router.push('/community')}
          className="text-emerald-700 hover:text-emerald-900 text-sm font-bold uppercase tracking-wide flex items-center gap-1 underline decoration-2 decoration-emerald-500"
          whileHover={{ scale: 1.05 }}
        >
          View All
          <ExternalLink className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="grid gap-4 flex-1">
        {trendingPods.length > 0 ? (
          trendingPods.map((pod, index) => {
            const Icon = pod.icon;
            return (
              <motion.div
                key={pod.id}
                className="group cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => router.push('/community')}
              >
                <div className="relative p-4 rounded-none bg-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-none bg-emerald-600 text-white border-2 border-slate-900`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 uppercase">
                          {pod.name}
                        </h4>
                        {pod.growth && (
                          <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-600 px-2 py-1 rounded-none flex-shrink-0">
                            {pod.growth}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2 font-medium">{pod.description}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-bold">
                        <Users className="w-3 h-3" />
                        <span>{pod.members.toLocaleString()} builders</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 font-bold italic">No trending pods available</p>
          </div>
        )}
      </div>
    </FloatingCard>
  );
};