import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Lock, Globe, Video, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomCardProps {
  room: {
    id: string;
    name: string;
    description: string;
    members: number;
    isPrivate: boolean;
    lastActivity: string;
    gradient: string;
    isJoined: boolean;
    unreadMessages?: number;
  };
  onJoin: (roomId: string) => void;
  onEnter: (roomId: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onJoin, onEnter }) => {
  return (
    <motion.div
      className="group relative"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Shadow layer */}
      <div className="absolute inset-0 bg-slate-900 translate-x-[6px] translate-y-[6px] rounded-none z-0" />

      <div className="relative bg-white border-2 border-slate-900 rounded-none p-6 z-10 hover:translate-x-[1px] hover:translate-y-[1px] transition-transform duration-200">
        {/* Privacy Indicator */}
        <div className="absolute top-4 right-4">
          {room.isPrivate ? (
            <Lock className="w-5 h-5 text-gray-500" />
          ) : (
            <Globe className="w-5 h-5 text-green-600" />
          )}
        </div>

        {/* Room Icon */}
        <motion.div
          className={`w-16 h-16 bg-white border-2 border-slate-900 rounded-none flex items-center justify-center mb-4 relative overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`}
          whileHover={{ rotate: 3, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <MessageSquare className="w-8 h-8 text-slate-900" />
        </motion.div>

        {/* Content */}
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              {room.name}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed font-medium border-l-4 border-slate-200 pl-2 my-2">{room.description}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm font-bold">
            <div className="flex items-center gap-1 text-slate-500">
              <Users className="w-4 h-4" />
              <span>{room.members} members</span>
            </div>
            <div className="text-slate-400 font-mono text-xs">
              <span>{room.lastActivity}</span>
            </div>
          </div>

          {/* Unread Messages */}
          {room.unreadMessages && room.unreadMessages > 0 && (
            <div className="flex items-center gap-2 border-2 border-green-600 bg-green-50 p-1 px-2 w-fit">
              <div className="w-2 h-2 bg-green-600 rounded-none animate-pulse"></div>
              <span className="text-sm text-green-700 font-bold uppercase">
                {room.unreadMessages} new messages
              </span>
            </div>
          )}

          {/* Action Button */}
          <motion.button
            onClick={() => room.isJoined ? onEnter(room.id) : onJoin(room.id)}
            className={cn(
              "w-full py-3 px-4 rounded-none font-black uppercase tracking-wider transition-all duration-200 border-2 border-slate-900 relative",
              room.isJoined
                ? "bg-green-600 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-green-500"
                : "bg-white text-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-slate-50"
            )}
            whileTap={{ scale: 0.98 }}
          >
            {room.isJoined ? 'Enter Room' : 'Join Room'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};