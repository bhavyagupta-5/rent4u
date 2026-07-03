import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { ThemeContext } from '../context/ThemeContext';
import UserAvatar from '../components/Common/UserAvatar';
import { 
  LayoutDashboard, 
  Search, 
  Heart, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Bell, 
  Home, 
  PlusCircle, 
  FileText,
  Users,
  Shield,
  History
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { notifications, setNotifications } = useSocket();
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  
  const getNavLinks = () => {
    if (user?.role === 'Admin') {
      return [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Manage Users', path: '/admin/users', icon: Users },
        { name: 'Manage Listings', path: '/admin/listings', icon: Home },
        { name: 'Audit Logs', path: '/admin/logs', icon: History },
        { name: 'Profile', path: '/profile', icon: User },
        { name: 'Settings', path: '/settings', icon: Settings },
      ];
    } else if (user?.role === 'Owner') {
      return [
        { name: 'Dashboard', path: '/owner', icon: LayoutDashboard },
        { name: 'Create Listing', path: '/owner/create-listing', icon: PlusCircle },
        { name: 'My Listings', path: '/owner/listings', icon: Home },
        { name: 'Tenant Interests', path: '/owner/interests', icon: FileText },
        { name: 'Chats', path: '/chats', icon: MessageSquare },
        { name: 'Profile', path: '/profile', icon: User },
        { name: 'Settings', path: '/settings', icon: Settings },
      ];
    } else {
      
      return [
        { name: 'Dashboard', path: '/tenant', icon: LayoutDashboard },
        { name: 'Browse Rooms', path: '/browse', icon: Search },
        { name: 'My Saved Rooms', path: '/tenant/wishlist', icon: Heart },
        { name: 'My Applications', path: '/tenant/interests', icon: FileText },
        { name: 'Chats', path: '/chats', icon: MessageSquare },
        { name: 'My Profile', path: '/profile', icon: User },
        { name: 'Settings', path: '/settings', icon: Settings },
      ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800 dark:bg-darkBg-dark dark:text-slate-100">
      
      {}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        ></div>
      )}

      {}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-64 flex-col 
        border-r border-slate-200 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md dark:border-slate-800
        transition-transform duration-300 md:static md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 shadow-md">
              <span className="text-lg font-extrabold text-white">R</span>
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
              RentHour AI
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-500">
            <X size={20} />
          </button>
        </div>

        {}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25 dark:shadow-none' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'}
                `}
              >
                <Icon size={18} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <UserAvatar 
              name={user?.name}
              avatar={user?.avatar} 
              className="h-10 w-10 rounded-xl ring-2 ring-primary-500/20"
            />
            <div className="truncate">
              <p className="text-sm font-semibold dark:text-slate-100 truncate">{user?.name}</p>
              <span className="inline-flex items-center rounded-md bg-primary-50 dark:bg-primary-950/50 px-2 py-0.5 text-xs font-medium text-primary-700 dark:text-primary-400 ring-1 ring-inset ring-primary-700/10">
                {user?.role}
              </span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {}
        <header className="flex h-16 items-center justify-between px-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-10">
          
          {}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 md:hidden"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 hidden sm:block">
              {navLinks.find(link => location.pathname === link.path)?.name || 'RentHour AI'}
            </h1>
          </div>

          {}
          <div className="flex items-center gap-4">
            
            {}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-200"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (notifications.length > 0) {
                    
                  }
                }}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-200 relative"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
                )}
              </button>

              {}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl z-50">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => setNotifications([])}
                        className="text-xs text-primary-500 hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">No new notifications</p>
                    ) : (
                      notifications.map((notif, index) => (
                        <div key={index} className="flex flex-col gap-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer" onClick={() => navigate('/chats')}>
                          <span className="text-xs font-semibold text-primary-500">New Message</span>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-1">{notif.message.senderName}: {notif.message.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {}
            <Link to="/profile" className="flex items-center gap-2">
            <UserAvatar 
              name={user?.name}
              avatar={user?.avatar} 
              className="h-9 w-9 rounded-xl ring-2 ring-primary-500/10 hover:ring-primary-500/30 transition-all"
            />
            </Link>
          </div>
        </header>

        {}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 dark:bg-darkBg-dark/50">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
