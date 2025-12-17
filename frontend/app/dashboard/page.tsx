import { useEffect, useState } from 'react';
import {
    Plus,
    FolderPlus,
    CheckSquare,
    UserPlus,
    MessageSquare,
    MoreHorizontal,
    Loader2
} from 'lucide-react';
import { opportunityAPI, roomAPI } from '@/lib/axios';

export default function DashboardPage() {
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetch
                const [oppRes, roomRes] = await Promise.all([
                    opportunityAPI.getAll(),
                    roomAPI.getMyRooms()
                ]);

                // Backend returns array directly for rooms, array for opportunities
                console.log('✅ [Dashboard] Loaded Data:', {
                    ops: oppRes.data?.length,
                    rooms: roomRes.data?.length
                });

                setOpportunities(oppRes.data || []);
                setRooms(roomRes.data || []);
            } catch (error) {
                console.error("❌ [Dashboard] Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-green-600" /></div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">

            {/* Header Section */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-700 transition shadow-sm hover:shadow-md">
                    <Plus className="w-4 h-4" /> Add New
                </button>
            </div>

            {/* Quick Actions Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Actions retained... can drive modals later */}
                {/* Card 1 */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer group">
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition">
                        <FolderPlus className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">Create Project</h3>
                        <p className="text-xs text-slate-400">Organize task to your project</p>
                    </div>
                </div>
                {/* ... other actions kept static for now ... */}
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* My Rooms / Activity */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-slate-900">My Active Rooms</h2>
                        <button className="text-slate-400 hover:text-green-600"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-4">
                        {rooms.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">No active rooms yet.</p>
                        ) : rooms.slice(0, 5).map((room: any) => (
                            <div key={room._id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full bg-green-500`}></div>
                                    <span className="text-sm font-semibold text-slate-700">{room.name}</span>
                                </div>
                                <span className="text-xs text-slate-400">Member</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Opportunities */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-slate-900">Recent Opportunities</h2>
                        <button className="text-slate-400 hover:text-green-600"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-4">
                        {opportunities.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">No opportunities available.</p>
                        ) : opportunities.slice(0, 5).map((op: any) => (
                            <div key={op._id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden">
                                        {/* Fallback avatar */}
                                        <div className="w-full h-full bg-slate-300"></div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-700">{op.title}</div>
                                        <div className="text-xs text-slate-500">{op.projectType || 'Startup'}</div>
                                    </div>
                                </div>
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">{op.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
