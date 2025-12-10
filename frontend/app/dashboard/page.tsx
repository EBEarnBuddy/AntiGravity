import {
    Plus,
    FolderPlus,
    CheckSquare,
    UserPlus,
    MessageSquare,
    MoreHorizontal
} from 'lucide-react';

export default function DashboardPage() {
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
                {/* Card 2 */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer group">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
                        <CheckSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">Create Task</h3>
                        <p className="text-xs text-slate-400">Organize task to your project</p>
                    </div>
                </div>
                {/* Card 3 */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer group">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">Invite Team</h3>
                        <p className="text-xs text-slate-400">Organize task to your project</p>
                    </div>
                </div>
                {/* Card 4 */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer group">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">Send Message</h3>
                        <p className="text-xs text-slate-400">Organize task to your project</p>
                    </div>
                </div>
            </div>

            {/* Task Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* To Do This Week */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-slate-900">To do this week</h2>
                        <button className="text-slate-400 hover:text-green-600"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { name: "Solutions Pages", project: "Main Project", date: "March 17 - 09:00AM", color: "bg-purple-500" },
                            { name: "Company pages", project: "Landing Page Pro...", date: "March 17 - 09:00AM", color: "bg-yellow-500" },
                            { name: "Help Center Pages", project: "Landing Page Pro...", date: "Add date", color: "bg-yellow-500" },
                            { name: "Icon Custom", project: "Main Project", date: "Add date", color: "bg-purple-500" },
                        ].map((task, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${task.color}`}></div>
                                    <span className="text-sm font-semibold text-slate-700">{task.name}</span>
                                </div>
                                <span className="text-xs text-slate-500 hidden sm:block">{task.project}</span>
                                <span className="text-xs text-slate-400">{task.date}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* To Review */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-slate-900">To review</h2>
                        <button className="text-slate-400 hover:text-green-600"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { name: "About Us Illustration", project: "Main Project", date: "March 17 - 09:00AM", color: "bg-purple-500", checked: true },
                            { name: "Hero Illustration", project: "Landing Page Pro...", date: "March 17 - 09:00AM", color: "bg-red-500", checked: true },
                            { name: "Moodboarding", project: "Landing Page Pro...", date: "Add date", color: "bg-red-500", checked: true },
                            { name: "Research", project: "Yellow Branding", date: "March 17 - 09:00AM", color: "bg-yellow-500", checked: true },
                        ].map((task, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition group">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded border border-green-500 bg-green-500 flex items-center justify-center text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 line-through decoration-slate-300">{task.name}</span>
                                </div>
                                <span className="text-xs text-slate-500 hidden sm:block">{task.project}</span>
                                <span className="text-xs text-slate-400">{task.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-slate-900">Recent Activity</h2>
                    <button className="text-xs font-bold text-green-600 hover:text-green-700">View All</button>
                </div>

                <div className="relative pl-4 space-y-8 before:absolute before:inset-y-0 before:left-2 before:w-[2px] before:bg-slate-100">
                    {/* Activity 1 */}
                    <div className="relative pl-6">
                        <span className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white"></span>
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-slate-700">
                                <span className="font-bold text-slate-900">Main Project</span> completed <span className="text-slate-400 font-normal ml-2">Today, 2:24pm</span>
                            </p>
                        </div>
                    </div>

                    {/* Activity 2 */}
                    <div className="relative pl-6">
                        <span className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white"></span>
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-medium text-slate-700">
                                <span className="font-bold text-slate-900">Landing Page Project</span> removed <span className="text-slate-400 font-normal ml-2">Today, 2:24pm</span>
                            </p>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p className="text-xs text-slate-500 italic">"Removing this project because there's internal issues, will reach back once the project can start"</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">SD</div>
                                    <span className="text-xs font-semibold text-slate-700">Savannah Dune</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity 3 */}
                    <div className="relative pl-6">
                        <span className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white"></span>
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-slate-700">
                                <span className="font-bold text-slate-900">Main Project</span> completed <span className="text-slate-400 font-normal ml-2">Today, 2:24pm</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
