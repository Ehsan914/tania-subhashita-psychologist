import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Home, BarChart3, Briefcase, FolderOpen,
  FileText, MessageSquareQuote, HelpCircle, Image, User, Settings,
  Menu, X, LogOut, ChevronRight, BookOpen, ClipboardList, Shield,
  CalendarCheck, MessageCircle
} from 'lucide-react';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/admin/home', icon: Home, label: 'Home Page' },
  { path: '/admin/statistics', icon: BarChart3, label: 'Statistics' },
  { path: '/admin/services', icon: Briefcase, label: 'Services' },
  { path: '/admin/programs', icon: FolderOpen, label: 'Programs' },
  { path: '/admin/blog', icon: FileText, label: 'Blog Posts' },
  { path: '/admin/testimonials', icon: MessageSquareQuote, label: 'Testimonials' },
  { path: '/admin/faq', icon: HelpCircle, label: 'FAQs' },
  { path: '/admin/gallery', icon: Image, label: 'Gallery' },
  { path: '/admin/about', icon: BookOpen, label: 'About Page' },
  { path: '/admin/contact', icon: User, label: 'Contact Info' },
  { path: '/admin/assessment', icon: ClipboardList, label: 'Assessment' },
  { path: '/admin/appointments', icon: CalendarCheck, label: 'Appointments' },
  { path: '/admin/booking-settings', icon: MessageCircle, label: 'Booking Settings' },
  { path: '/admin/settings', icon: Settings, label: 'Site Settings' },
  { path: '/admin/users', icon: Shield, label: 'Admin Users' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isFullWidth = pathname === '/admin';
  const isWide = pathname === '/admin/appointments';

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex select-auto" style={{ fontFamily: "'Inter', 'Mulish', sans-serif" }}>
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#12121f] border-r border-white/5 flex flex-col transform transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Settings className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight">CMS Admin</div>
              <div className="text-[10px] text-gray-500 tracking-wider uppercase">Tania Subhashita's Website</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full ring-2 ring-indigo-500/30" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                {user?.name?.[0] || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</div>
              <div className="text-[10px] text-gray-500 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/5 py-2 rounded-lg transition-all cursor-pointer border border-transparent hover:border-red-500/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#0f0f1a]/80 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-indigo-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              View Public Site
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {isFullWidth
            ? <Outlet />
            : <div className={`${isWide ? 'max-w-7xl' : 'max-w-5xl'} mx-auto`}><Outlet /></div>}
        </main>
      </div>
    </div>
  );
}
