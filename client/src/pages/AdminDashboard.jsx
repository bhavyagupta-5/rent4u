import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';
import { 
  Users, 
  Home, 
  MessageSquare, 
  Sparkles, 
  ShieldAlert, 
  Search, 
  Check, 
  Trash2, 
  Activity,
  UserCheck,
  UserMinus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats'); 
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      
      const statsRes = await api.get('/admin/dashboard');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      
      const usersRes = await api.get('/admin/users?limit=100');
      if (usersRes.data.success) {
        setUsers(usersRes.data.data);
      }

      
      const listingsRes = await api.get('/admin/listings');
      if (listingsRes.data.success) {
        setListings(listingsRes.data.data);
      }

      
      const logsRes = await api.get('/admin/activity-logs');
      if (logsRes.data.success) {
        setLogs(logsRes.data.data);
      }

    } catch (err) {
      console.error("Failed to load admin panel data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (user) => {
    try {
      const res = await api.patch(`/admin/users/${user._id}/status`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchAdminData();
      }
    } catch (err) {
      toast.error("Failed to toggle status.");
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await api.delete(`/admin/listings/${listingId}`);
      if (res.data.success) {
        toast.success("Listing deleted successfully");
        fetchAdminData();
      }
    } catch (err) {
      toast.error("Failed to delete listing.");
    }
  };

  
  const chartData = [
    { name: 'Jan', Users: 12, Listings: 6 },
    { name: 'Feb', Users: 19, Listings: 10 },
    { name: 'Mar', Users: 32, Listings: 15 },
    { name: 'Apr', Users: 54, Listings: 22 },
    { name: 'May', Users: 78, Listings: 29 },
    { name: 'Jun', Users: 95, Listings: 34 },
  ];

  return (
    <div className="space-y-6 text-left">
      
      {}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        {['stats', 'users', 'listings', 'logs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold capitalize transition-all border-b-2 ${
              activeTab === tab 
                ? 'border-primary-500 text-primary-500 font-bold' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {tab === 'stats' ? 'Analytics' : tab === 'logs' ? 'Audit Logs' : tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-60 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {}
          {activeTab === 'stats' && stats && (
            <div className="space-y-8">
              
              {}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Users</span>
                    <Users className="text-primary-500" size={18} />
                  </div>
                  <p className="text-2xl font-black mt-2">{stats.users.total}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{stats.users.tenants} Tenants / {stats.users.owners} Owners</p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Listings</span>
                    <Home className="text-indigo-500" size={18} />
                  </div>
                  <p className="text-2xl font-black mt-2">{stats.listings.total}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{stats.listings.available} Available / {stats.listings.filled} Filled</p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Conversations</span>
                    <MessageSquare className="text-emerald-500" size={18} />
                  </div>
                  <p className="text-2xl font-black mt-2">{stats.chats}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{stats.interests.accepted} Matches Completed</p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Average Score</span>
                    <Sparkles className="text-yellow-500" size={18} />
                  </div>
                  <p className="text-2xl font-black mt-2">{stats.averageScore}%</p>
                  <p className="text-[10px] text-slate-400 mt-1">Grok-predicted compatibility</p>
                </div>
              </div>

              {}
              <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                <h4 className="font-bold text-sm mb-6 flex items-center gap-1.5"><Activity size={16} className="text-primary-500" /> Platform Growth Timeline</h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="Users" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
                      <Area type="monotone" dataKey="Listings" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorListings)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

          {}
          {activeTab === 'users' && (
            <div className="space-y-4">
              
              {}
              <div className="relative max-w-sm">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {}
              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-100/50 dark:bg-slate-950/20">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase">User</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase">Role</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                      <tr key={u._id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={u.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150"} alt="avatar" className="h-8 w-8 rounded-lg object-cover" />
                            <div className="text-left">
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{u.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                          {u.role}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                            u.deactivated 
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-500/20' 
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {u.deactivated ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleToggleUserStatus(u)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold ${
                              u.deactivated 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                                : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                            }`}
                          >
                            {u.deactivated ? <UserCheck size={14} /> : <UserMinus size={14} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {}
          {activeTab === 'listings' && (
            <div className="space-y-4">
              
              <div className="relative max-w-sm">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search listings..." 
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-100/50 dark:bg-slate-950/20">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase">Room Details</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase">Location</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase">Rent</th>
                      <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {listings.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.city.toLowerCase().includes(searchQuery.toLowerCase())).map((l) => (
                      <tr key={l._id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={l.images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=150"} alt="room" className="h-8 w-8 rounded-lg object-cover" />
                            <div className="text-left">
                              <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{l.title}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Owner ID: {l.owner?._id || 'Unknown'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                          {l.location}, {l.city}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-primary-500">
                          ₹{l.rent}/mo
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteListing(l._id)}
                            className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-600 hover:text-red-500 dark:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {}
          {activeTab === 'logs' && (
            <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md space-y-4">
              <h4 className="font-bold text-sm flex items-center gap-1.5"><ShieldAlert size={16} className="text-red-500" /> Platform Security & Audit Timeline</h4>
              
              <div className="flow-root">
                <ul className="-mb-8">
                  {logs.map((log, index) => (
                    <li key={log._id}>
                      <div className="relative pb-8 text-left">
                        {index !== logs.length - 1 && (
                          <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-800" aria-hidden="true"></span>
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[9px] font-bold">
                              {log.action.substring(0, 3)}
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                                <span className="font-bold text-slate-900 dark:text-slate-100">{log.user?.name || 'System'}: </span>
                                {log.details}
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-[10px] text-slate-400">
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default AdminDashboard;
